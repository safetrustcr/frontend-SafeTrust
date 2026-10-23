import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterPage from "./Register";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setSessionCookie } from "@/lib/auth/session";

let mockRedirectParam: string | null = null;
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  useSearchParams: () => ({
    get: (key: string) => (key === "redirect" ? mockRedirectParam : null),
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
  updateProfile: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    setCustomParameters: jest.fn(),
  })),
  signInWithPopup: jest.fn(),
}));

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

describe("RegisterPage redirect handling", () => {
  beforeAll(() => {
    // The optional backend sync must never reach the network in tests.
    globalThis.fetch = jest
      .fn()
      .mockRejectedValue(new Error("offline")) as unknown as typeof fetch;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedirectParam = null;
  });

  it("keeps a valid ?redirect= on the Log in link and the Google sign-up", () => {
    mockRedirectParam = "/dashboard/favorites";

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
    mockRedirectParam = "https://evil.com/steal";

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

  it("carries the return path to login after a successful sign-up", async () => {
    mockRedirectParam = "/dashboard/favorites";
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: { getIdToken: jest.fn().mockResolvedValue("token-1") },
    });
    (updateProfile as jest.Mock).mockResolvedValue(undefined);

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Ana" },
    });
    fireEvent.change(screen.getByLabelText("Last Name"), {
      target: { value: "Guest" },
    });
    fireEvent.change(screen.getByLabelText("Phone Number"), {
      target: { value: "88888888" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ana.guest@safetrust.test" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret-1" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith(
        "/login?redirect=%2Fdashboard%2Ffavorites",
      ),
    );
    expect(setSessionCookie).toHaveBeenCalledWith("token-1");
  });
});
