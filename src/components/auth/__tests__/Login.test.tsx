import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../Login";
import { signInWithEmailAndPassword } from "firebase/auth";
import { applyRememberMe } from "@/lib/auth/persistence";
import { setSessionCookie } from "@/lib/auth/session";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/login",
  useSearchParams: () => ({ get: jest.fn().mockReturnValue(null) }),
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
  signInWithEmailAndPassword: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    setCustomParameters: jest.fn(),
  })),
  signInWithPopup: jest.fn(),
}));

jest.mock("@/components/auth/GoogleSignInButton", () => ({
  GoogleSignInButton: () => <button>Continue with Google</button>,
}));

jest.mock("@/lib/firebase", () => ({
  auth: { currentUser: null },
}));

jest.mock("@/lib/auth/persistence", () => ({
  applyRememberMe: jest.fn().mockResolvedValue(undefined),
  getRememberMe: jest.fn().mockReturnValue(true),
}));

jest.mock("@/lib/auth/session", () => ({
  setSessionCookie: jest.fn(),
}));

jest.mock("@/core/store/data", () => ({
  useGlobalAuthenticationStore: Object.assign(
    () => ({ address: "", token: "" }),
    {
      getState: () => ({
        setToken: jest.fn(),
      }),
    },
  ),
}));

jest.mock("../ui/Illustration", () => {
  const MockIllustration = () => <div data-testid="illustration" />;
  MockIllustration.displayName = "MockIllustration";
  return MockIllustration;
});
jest.mock("@/hooks/useWallet", () => ({
  useWallet: () => ({
    connect: jest.fn().mockResolvedValue(undefined),
  }),
}));

describe("LoginPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Email label without mentioning 'username'", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.queryByText(/email or username/i)).not.toBeInTheDocument();
  });

  it("provides proper autocomplete and inputMode attributes on inputs", () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/^email$/i);
    expect(emailInput).toHaveAttribute("name", "email");
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("inputMode", "email");
    expect(emailInput).toHaveAttribute("autoComplete", "username");

    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toHaveAttribute("name", "password");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("autoComplete", "current-password");
  });

  it("renders 'Keep me signed in' checkbox checked by default", () => {
    render(<LoginPage />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-checked", "true");
  });

  it("calls applyRememberMe(true) and setSessionCookie on login with checked checkbox", async () => {
    const mockUser = {
      getIdToken: jest.fn().mockResolvedValue("mock-jwt-token"),
    };
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: mockUser,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^login$/i }));

    await waitFor(() => {
      expect(applyRememberMe).toHaveBeenCalledWith(true);
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        "test@example.com",
        "password123",
      );
      expect(setSessionCookie).toHaveBeenCalledWith("mock-jwt-token");
    });
  });

  it("calls applyRememberMe(false) on login when checkbox is unchecked", async () => {
    const mockUser = {
      getIdToken: jest.fn().mockResolvedValue("mock-jwt-token"),
    };
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: mockUser,
    });

    render(<LoginPage />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute("aria-checked", "false");

    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^login$/i }));

    await waitFor(() => {
      expect(applyRememberMe).toHaveBeenCalledWith(false);
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        "test@example.com",
        "password123",
      );
      expect(setSessionCookie).toHaveBeenCalledWith("mock-jwt-token");
    });
  });
});
