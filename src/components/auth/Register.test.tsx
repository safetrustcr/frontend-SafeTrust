import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RegisterPage from "./Register";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { setSessionCookie } from "@/lib/auth/session";

const mockPush = jest.fn();
let mockRedirect: string | null = null;

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  usePathname: () => "/register",
  useSearchParams: () => ({
    get: (key: string) => (key === "redirect" ? mockRedirect : null),
  }),
}));

jest.mock("next/image", () => {
  const MockImage = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || ""} />
  );
  MockImage.displayName = "MockImage";
  return {
    __esModule: true,
    default: MockImage,
  };
});

jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn().mockResolvedValue(undefined),
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

jest.mock("@/lib/auth/session", () => ({ setSessionCookie: jest.fn() }));

jest.mock("@/components/auth/GoogleSignInButton", () => ({
  GoogleSignInButton: (props: { redirectTo: string; label: string }) => (
    <button data-testid="google-signup" data-redirect={props.redirectTo}>
      {props.label}
    </button>
  ),
}));

jest.mock("@/components/auth/ui/Illustration", () => {
  const MockIllustration = () => <div data-testid="illustration" />;
  MockIllustration.displayName = "MockIllustration";
  return MockIllustration;
});

function makeFirebaseUser() {
  return {
    uid: "u-new",
    email: "nueva@safetrust.test",
    emailVerified: false,
    getIdToken: jest.fn().mockResolvedValue("id-token"),
  };
}

function fillFormAndSubmit() {
  fireEvent.change(screen.getByLabelText("First Name"), {
    target: { value: "Nueva" },
  });
  fireEvent.change(screen.getByLabelText("Last Name"), {
    target: { value: "Safetrust" },
  });
  fireEvent.change(screen.getByLabelText("Phone Number"), {
    target: { value: "8888-8888" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "nueva@safetrust.test" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "Secret-123" },
  });

  const form = screen.getByRole("button", { name: "Sign Up" }).closest("form");
  fireEvent.submit(form!);
}

describe("RegisterPage", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedirect = null;
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: makeFirebaseUser(),
    });
    (updateProfile as jest.Mock).mockResolvedValue(undefined);
    (sendEmailVerification as jest.Mock).mockResolvedValue(undefined);
    (setSessionCookie as jest.Mock).mockImplementation(() => {});
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("sends the Firebase verification email and lands on /verify-email", async () => {
    const createdUser = makeFirebaseUser();
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: createdUser,
    });
    render(<RegisterPage />);
    fillFormAndSubmit();

    await waitFor(() => {
      expect(sendEmailVerification).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith(
        `/verify-email?redirect=${encodeURIComponent("/dashboard/escrow-dashboard")}`,
      );
    });
    expect(mockPush).not.toHaveBeenCalledWith(
      expect.stringContaining("/login"),
    );

    const [user, options] = (sendEmailVerification as jest.Mock).mock.calls[0];
    expect(user).toBe(createdUser);
    expect(options.url).toBe(
      `${window.location.origin}/verify-email?redirect=${encodeURIComponent("/dashboard/escrow-dashboard")}`,
    );
    expect(setSessionCookie).toHaveBeenCalledWith("id-token");
  });

  it("still completes registration when the email cannot be sent", async () => {
    (sendEmailVerification as jest.Mock).mockRejectedValue(
      new Error("smtp down"),
    );
    render(<RegisterPage />);
    fillFormAndSubmit();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("/verify-email?redirect="),
      );
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("carries a validated ?redirect= through to the verify page", async () => {
    mockRedirect = "/dashboard/hotels";
    render(<RegisterPage />);
    fillFormAndSubmit();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        `/verify-email?redirect=${encodeURIComponent("/dashboard/hotels")}`,
      );
    });
    expect(sendEmailVerification).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        url: expect.stringContaining(encodeURIComponent("/dashboard/hotels")),
      }),
    );
  });

  describe("redirect handling", () => {
    it("keeps a valid ?redirect= on the Log in link and the Google sign-up", () => {
      mockRedirect = "/dashboard/favorites";

      render(<RegisterPage />);

      expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
        "href",
        "/login?redirect=%2Fdashboard%2Ffavorites",
      );
      expect(screen.getByTestId("google-signup")).toHaveAttribute(
        "data-redirect",
        "/dashboard/favorites",
      );
    });

    it("falls back to the default when ?redirect= is an external URL", () => {
      mockRedirect = "https://evil.com/steal";

      render(<RegisterPage />);

      expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
        "href",
        "/login?redirect=%2Fdashboard%2Fescrow-dashboard",
      );
      expect(screen.getByTestId("google-signup")).toHaveAttribute(
        "data-redirect",
        "/dashboard/escrow-dashboard",
      );
    });

    it("omits the param entirely when none was given", () => {
      render(<RegisterPage />);

      expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
        "href",
        "/login",
      );
      expect(screen.getByTestId("google-signup")).toHaveAttribute(
        "data-redirect",
        "/dashboard/escrow-dashboard",
      );
    });
  });
});
