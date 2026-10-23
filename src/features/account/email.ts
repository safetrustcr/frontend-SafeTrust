import {
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  verifyBeforeUpdateEmail,
  type User,
} from "firebase/auth";

export async function requestEmailChange(
  user: User,
  newEmail: string,
  password?: string,
): Promise<void> {
  const providers = user.providerData.map((provider) => provider.providerId);

  if (providers.includes("password")) {
    if (!user.email || !password) throw new Error("EMAIL_PASSWORD_REQUIRED");
    await reauthenticateWithCredential(
      user,
      EmailAuthProvider.credential(user.email, password),
    );
  } else if (providers.includes("google.com")) {
    await reauthenticateWithPopup(user, new GoogleAuthProvider());
  } else {
    throw new Error("EMAIL_CHANGE_UNSUPPORTED");
  }

  await verifyBeforeUpdateEmail(user, newEmail, {
    url: `${location.origin}/dashboard/profile/security`,
  });
}

export function emailChangeErrorMessage(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : error instanceof Error
        ? error.message
        : "";
  const messages: Record<string, string> = {
    "auth/wrong-password": "The password you entered is incorrect.",
    "auth/invalid-credential": "The password you entered is incorrect.",
    "auth/email-already-in-use": "That email address is already in use.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/requires-recent-login":
      "Please sign in again before changing your email.",
    EMAIL_CHANGE_UNSUPPORTED:
      "Add an email sign-in method to change email.",
    EMAIL_PASSWORD_REQUIRED: "Enter your current password to continue.",
  };
  return messages[code] ?? "We couldn't change your email. Please try again.";
}

export async function syncUserAfterEmailChange(user: User): Promise<void> {
  await user.reload();
  const token = await user.getIdToken(true);
  const response = await fetch("/api/auth/sync-user", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("EMAIL_SYNC_FAILED");
  }
}
