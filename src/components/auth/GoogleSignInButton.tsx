"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/auth/ui/GoogleIcon";
import {
  completeGoogleRedirect,
  GOOGLE_ERROR_MESSAGES,
  signInWithGoogle,
} from "@/lib/auth/google";

export function GoogleSignInButton({
  redirectTo,
  label = "Continue with Google",
  disabled,
  onLoadingChange,
}: {
  redirectTo: string;
  label?: string;
  disabled?: boolean;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateLoading = (isLoading: boolean) => {
    setLoading(isLoading);
    onLoadingChange?.(isLoading);
  };

  useEffect(() => {
    updateLoading(true);
    completeGoogleRedirect()
      .then((user) => {
        if (user) {
          router.replace(redirectTo);
        }
      })
      .catch(handleError)
      .finally(() => {
        updateLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  function handleError(err: unknown) {
    const code = err instanceof FirebaseError ? err.code : "unknown";
    const msg =
      code in GOOGLE_ERROR_MESSAGES
        ? GOOGLE_ERROR_MESSAGES[code]
        : "Google sign-in failed. Please try again.";
    if (msg) toast.error(msg);
  }

  async function onClick() {
    updateLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        toast.success(`Welcome, ${user.displayName ?? user.email}!`);
        router.replace(redirectTo);
      }
    } catch (err) {
      handleError(err);
    } finally {
      updateLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <GoogleIcon className="mr-2 h-4 w-4" />
      )}
      {label}
    </Button>
  );
}
