import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GoogleSignInButton } from "../GoogleSignInButton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FirebaseError } from "firebase/app";
import { signInWithGoogle, completeGoogleRedirect } from "@/lib/auth/google";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/lib/auth/google", () => ({
  signInWithGoogle: jest.fn(),
  completeGoogleRedirect: jest.fn(),
  GOOGLE_ERROR_MESSAGES: {
    "auth/popup-closed-by-user": null,
    "auth/cancelled-popup-request": null,
    "auth/account-exists-with-different-credential":
      "This email is already registered with a password. Sign in with email, then link Google from your profile.",
    "auth/network-request-failed":
      "Network error. Check your connection and try again.",
    "auth/unauthorized-domain":
      "Google sign-in isn't enabled for this domain yet.",
    "auth/operation-not-allowed":
      "Google sign-in is not enabled. Contact support.",
  },
}));

describe("GoogleSignInButton", () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });
    (completeGoogleRedirect as jest.Mock).mockResolvedValue(null);
  });

  it("renders with default label", async () => {
    render(<GoogleSignInButton redirectTo="/dashboard" />);
    const button = screen.getByRole("button", {
      name: /continue with google/i,
    });
    expect(button).toBeInTheDocument();
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it("renders with custom label", async () => {
    render(
      <GoogleSignInButton
        redirectTo="/dashboard"
        label="Sign up with Google"
      />,
    );
    const button = screen.getByRole("button", { name: /sign up with google/i });
    expect(button).toBeInTheDocument();
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it("locks loading and notifies parent during completeGoogleRedirect on mount", async () => {
    const onLoadingChange = jest.fn();
    (completeGoogleRedirect as jest.Mock).mockReturnValue(
      new Promise((resolve) => setTimeout(() => resolve(null), 10)),
    );

    render(
      <GoogleSignInButton
        redirectTo="/dashboard"
        onLoadingChange={onLoadingChange}
      />,
    );

    expect(onLoadingChange).toHaveBeenCalledWith(true);

    await waitFor(() => {
      expect(onLoadingChange).toHaveBeenCalledWith(false);
    });
  });

  it("completes redirect on mount and redirects user if user exists", async () => {
    (completeGoogleRedirect as jest.Mock).mockResolvedValue({
      displayName: "Redirect User",
      email: "redirect@example.com",
    });

    render(<GoogleSignInButton redirectTo="/custom-target" />);

    await waitFor(() => {
      expect(completeGoogleRedirect).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith("/custom-target");
    });
  });

  it("signs in on click, shows success toast, and redirects to target", async () => {
    (signInWithGoogle as jest.Mock).mockResolvedValue({
      displayName: "Alex Morgan",
      email: "alex@example.com",
    });

    const onLoadingChange = jest.fn();

    render(
      <GoogleSignInButton
        redirectTo="/dashboard/escrow-dashboard"
        onLoadingChange={onLoadingChange}
      />,
    );

    const button = screen.getByRole("button", {
      name: /continue with google/i,
    });

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });

    fireEvent.click(button);

    expect(onLoadingChange).toHaveBeenCalledWith(true);

    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalledTimes(1);
      expect(toast.success).toHaveBeenCalledWith("Welcome, Alex Morgan!");
      expect(mockReplace).toHaveBeenCalledWith("/dashboard/escrow-dashboard");
      expect(onLoadingChange).toHaveBeenCalledWith(false);
    });
  });

  it("does not trigger error toast when user closes the popup", async () => {
    (signInWithGoogle as jest.Mock).mockRejectedValue(
      new FirebaseError("auth/popup-closed-by-user", "Popup closed"),
    );

    render(<GoogleSignInButton redirectTo="/dashboard" />);

    const button = screen.getByRole("button", {
      name: /continue with google/i,
    });

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalledTimes(1);
      expect(toast.error).not.toHaveBeenCalled();
      expect(button).not.toBeDisabled();
    });
  });

  it("displays guidance toast when account-exists-with-different-credential occurs", async () => {
    (signInWithGoogle as jest.Mock).mockRejectedValue(
      new FirebaseError(
        "auth/account-exists-with-different-credential",
        "Different credential",
      ),
    );

    render(<GoogleSignInButton redirectTo="/dashboard" />);

    const button = screen.getByRole("button", {
      name: /continue with google/i,
    });

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("already registered with a password"),
      );
    });
  });

  it("displays generic error toast for unknown error", async () => {
    (signInWithGoogle as jest.Mock).mockRejectedValue(
      new Error("Unexpected failure"),
    );

    render(<GoogleSignInButton redirectTo="/dashboard" />);

    const button = screen.getByRole("button", {
      name: /continue with google/i,
    });

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Google sign-in failed. Please try again.",
      );
    });
  });

  it("respects disabled prop", async () => {
    render(<GoogleSignInButton redirectTo="/dashboard" disabled={true} />);

    const button = screen.getByRole("button", {
      name: /continue with google/i,
    });
    expect(button).toBeDisabled();
    await waitFor(() => {
      expect(completeGoogleRedirect).toHaveBeenCalled();
    });
  });
});
