import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import VerifyEmail from "./VerifyEmail";
import { sendEmailVerification, signOut } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { clearSessionCookie } from "@/lib/auth/session";

const mockPush = jest.fn();
let mockRedirect: string | null = null;
const mockAuthListeners: Array<(user: unknown) => void> = [];

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  usePathname: () => "/verify-email",
  useSearchParams: () => ({
    get: (key: string) => (key === "redirect" ? mockRedirect : null),
  }),
}));

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn(
    (_auth: unknown, callback: (user: unknown) => void) => {
      mockAuthListeners.push(callback);
      return jest.fn();
    },
  ),
  signOut: jest.fn().mockResolvedValue(undefined),
  sendEmailVerification: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("firebase/app", () => {
  class FirebaseError extends Error {
    code: string;
    constructor(code: string, message?: string) {
      super(message ?? code);
      this.name = "FirebaseError";
      this.code = code;
    }
  }
  return { __esModule: true, FirebaseError };
});

jest.mock("@/lib/firebase", () => ({ auth: {} }));

jest.mock("@/lib/auth/session", () => ({ clearSessionCookie: jest.fn() }));

jest.mock("@/components/auth/ui/Buildings", () => {
  const MockBuildings = () => <div data-testid="buildings" />;
  MockBuildings.displayName = "MockBuildings";
  return MockBuildings;
});

type MockFirebaseUser = {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  reload: jest.Mock;
  getIdToken: jest.Mock;
};

function makeUser(overrides: Partial<MockFirebaseUser> = {}): MockFirebaseUser {
  return {
    uid: "u-1",
    email: "ana.safetrust@example.com",
    emailVerified: false,
    reload: jest.fn().mockResolvedValue(undefined),
    getIdToken: jest.fn().mockResolvedValue("fresh-token"),
    ...overrides,
  };
}

function signIn(user: MockFirebaseUser | null) {
  act(() => {
    mockAuthListeners.forEach((notify) => notify(user));
  });
}

describe("VerifyEmail page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthListeners.length = 0;
    mockRedirect = null;
    (sendEmailVerification as jest.Mock).mockResolvedValue(undefined);
    (signOut as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows the signed-in user's real address and no code inputs", () => {
    render(<VerifyEmail />);
    signIn(makeUser());

    expect(screen.getByText("ana.safetrust@example.com")).toBeInTheDocument();
    expect(screen.getByText(/We sent a link to/)).toBeInTheDocument();
    expect(screen.queryByText(/JhonCasas/i)).not.toBeInTheDocument();
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(
      screen.getByRole("heading", { name: "Verify your email" }),
    ).toBeInTheDocument();
  });

  it("prompts signed-out visitors to sign in", () => {
    render(<VerifyEmail />);
    signIn(null);

    const signInLink = screen.getByRole("link", { name: "Sign in" });
    expect(signInLink).toHaveAttribute(
      "href",
      expect.stringContaining("/login?redirect="),
    );
    expect(signInLink).toHaveAttribute(
      "href",
      expect.stringContaining(encodeURIComponent("/verify-email")),
    );
  });

  it("announces messages through a status region", () => {
    render(<VerifyEmail />);
    signIn(makeUser());

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toBeEmptyDOMElement();
  });

  it("sends a new link, then disables resend for 60 seconds with a countdown", async () => {
    jest.useFakeTimers();
    const user = makeUser();
    render(<VerifyEmail />);
    signIn(user);

    fireEvent.click(screen.getByRole("button", { name: "Resend email" }));

    await act(async () => {});
    expect(sendEmailVerification).toHaveBeenCalledTimes(1);
    expect(sendEmailVerification).toHaveBeenCalledWith(user, {
      url: `${window.location.origin}/verify-email?redirect=${encodeURIComponent("/dashboard/escrow-dashboard")}`,
    });

    expect(
      screen.getByRole("button", { name: "Resend in 60 s" }),
    ).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "We sent a new link. It can take a minute to arrive.",
    );

    await act(async () => {
      jest.advanceTimersByTime(10_000);
    });
    expect(
      screen.getByRole("button", { name: "Resend in 50 s" }),
    ).toBeDisabled();

    await act(async () => {
      jest.advanceTimersByTime(50_000);
    });
    expect(screen.getByRole("button", { name: "Resend email" })).toBeEnabled();
    expect(sendEmailVerification).toHaveBeenCalledTimes(1);
  });

  it("shows a clear message when Firebase rate-limits resends", async () => {
    (sendEmailVerification as jest.Mock).mockRejectedValue(
      new FirebaseError("auth/too-many-requests", "Too many requests"),
    );
    render(<VerifyEmail />);
    signIn(makeUser());

    fireEvent.click(screen.getByRole("button", { name: "Resend email" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Too many attempts. Please wait a few minutes and try again.",
      );
    });
    expect(screen.getByRole("button", { name: "Resend email" })).toBeEnabled();
  });

  it("shows a connection message for any other send failure", async () => {
    (sendEmailVerification as jest.Mock).mockRejectedValue(
      new Error("network down"),
    );
    render(<VerifyEmail />);
    signIn(makeUser());

    fireEvent.click(screen.getByRole("button", { name: "Resend email" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "We couldn't send the email. Check your connection and try again.",
      );
    });
  });

  it("moves to the verified state once 'I've verified my email' confirms", async () => {
    const user = makeUser();
    user.reload.mockImplementation(async () => {
      user.emailVerified = true;
    });
    render(<VerifyEmail />);
    signIn(user);

    fireEvent.click(
      screen.getByRole("button", { name: "I've verified my email" }),
    );

    const continueLink = await screen.findByRole("link", { name: "Continue" });
    expect(continueLink).toHaveAttribute("href", "/dashboard/escrow-dashboard");
    expect(user.reload).toHaveBeenCalledTimes(1);
    expect(user.getIdToken).toHaveBeenCalledWith(true);
  });

  it("explains when the email still cannot be confirmed", async () => {
    render(<VerifyEmail />);
    signIn(makeUser());

    fireEvent.click(
      screen.getByRole("button", { name: "I've verified my email" }),
    );

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "We couldn't confirm it yet. Open the link in the email, then try again.",
      );
    });
    expect(
      screen.queryByRole("link", { name: "Continue" }),
    ).not.toBeInTheDocument();
  });

  it("re-checks automatically when the tab regains focus", async () => {
    const user = makeUser();
    user.reload.mockImplementation(async () => {
      user.emailVerified = true;
    });
    render(<VerifyEmail />);
    signIn(user);

    act(() => {
      window.dispatchEvent(new Event("focus"));
    });

    expect(
      await screen.findByRole("link", { name: "Continue" }),
    ).toBeInTheDocument();
  });

  it("shows the verified state for users who are already verified", () => {
    render(<VerifyEmail />);
    signIn(makeUser({ emailVerified: true }));

    expect(
      screen.getByRole("heading", { name: "Email verified" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue" })).toHaveAttribute(
      "href",
      "/dashboard/escrow-dashboard",
    );
  });

  it("shows a short no-email state for accounts without an address", () => {
    render(<VerifyEmail />);
    signIn(makeUser({ email: null }));

    expect(
      screen.getByRole("heading", { name: "No email to verify" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue" })).toBeInTheDocument();
    expect(screen.queryByText(/We sent a link to/)).not.toBeInTheDocument();
  });

  it("keeps a validated ?redirect= destination", () => {
    mockRedirect = "/dashboard/hotels";
    render(<VerifyEmail />);
    signIn(makeUser({ emailVerified: true }));

    expect(screen.getByRole("link", { name: "Continue" })).toHaveAttribute(
      "href",
      "/dashboard/hotels",
    );
  });

  it("falls back to the default destination for an unsafe ?redirect=", () => {
    mockRedirect = "https://evil.example/steal";
    render(<VerifyEmail />);
    signIn(makeUser({ emailVerified: true }));

    expect(screen.getByRole("link", { name: "Continue" })).toHaveAttribute(
      "href",
      "/dashboard/escrow-dashboard",
    );
  });

  it("signs out and returns to login when switching accounts", async () => {
    render(<VerifyEmail />);
    signIn(makeUser());

    fireEvent.click(
      screen.getByRole("button", { name: "Use a different account" }),
    );

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledTimes(1);
      expect(clearSessionCookie).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith(
        `/login?redirect=${encodeURIComponent("/dashboard/escrow-dashboard")}`,
      );
    });
  });
});
