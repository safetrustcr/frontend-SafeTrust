"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, ShieldCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProfileSettingsSidebar } from "@/components/dashboard/profile/ProfileSettingsSidebar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useWallet } from "@/hooks/useWallet";
import { auth } from "@/lib/firebase";
import { loginHref } from "@/components/navigation/account-routes";
import {
  AccountApiError,
  linkCurrentWallet,
  listWallets,
  makePrimary,
  unlinkWallet,
  type LinkedWallet,
} from "@/features/account/wallets";
import {
  emailChangeErrorMessage,
  requestEmailChange,
  syncUserAfterEmailChange,
} from "@/features/account/email";

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function AccountSecurityPage() {
  const { user, loading: authLoading } = useCurrentUser();
  const router = useRouter();
  const { address, connect, disconnect } = useWallet();
  const [linkedWallets, setLinkedWallets] = useState<LinkedWallet[]>([]);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletUnavailable, setWalletUnavailable] = useState(false);
  const [walletError, setWalletError] = useState("");
  const [walletNotice, setWalletNotice] = useState("");
  const [pendingWalletAction, setPendingWalletAction] = useState("");
  const [removeTarget, setRemoveTarget] = useState<LinkedWallet | null>(null);
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailPending, setEmailPending] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailNotice, setEmailNotice] = useState("");
  const [connectedPending, setConnectedPending] = useState(false);
  const [emailSyncError, setEmailSyncError] = useState("");
  const lastEmail = useRef<string | null>(null);

  const firebaseUser = auth.currentUser;
  const providers = firebaseUser?.providerData.map((provider) => provider.providerId) ?? [];
  const canChangeEmail =
    providers.includes("password") || providers.includes("google.com");
  const needsPassword = providers.includes("password");
  const connectedAlreadyLinked = useMemo(
    () => linkedWallets.some((wallet) => wallet.address === address),
    [address, linkedWallets],
  );

  const loadWallets = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    setWalletLoading(true);
    setWalletError("");
    setWalletUnavailable(false);
    try {
      const token = await currentUser.getIdToken();
      const response = await listWallets(token);
      setLinkedWallets(response.wallets);
    } catch (error) {
      if (
        error instanceof AccountApiError &&
        error.code === "BACKEND_NOT_CONFIGURED"
      ) {
        setWalletUnavailable(true);
        setLinkedWallets([]);
      } else {
        setWalletError(errorMessage(error));
      }
    } finally {
      setWalletLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(loginHref("/dashboard/profile/security"));
      return;
    }
    if (user) {
      setEmail(firebaseUser?.email ?? user.email ?? "");
      setEmailVerified(firebaseUser?.emailVerified ?? false);
      lastEmail.current = firebaseUser?.email ?? user.email;
      void loadWallets();
    }
  }, [authLoading, firebaseUser, loadWallets, router, user]);

  const refreshEmail = useCallback(async (forceSync = false) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    try {
      const previousEmail = lastEmail.current;
      await currentUser.reload();
      const refreshedUser = auth.currentUser;
      if (!refreshedUser) return;
      setEmail(refreshedUser.email ?? "");
      setEmailVerified(refreshedUser.emailVerified);
      const changed = previousEmail !== refreshedUser.email;
      lastEmail.current = refreshedUser.email;
      if (forceSync || changed) {
        await syncUserAfterEmailChange(refreshedUser);
        setEmailSyncError("");
      }
    } catch (error) {
      console.error("Failed to refresh verified email:", error);
      setEmailSyncError(
        "We couldn't sync your confirmed email yet. Please refresh or try again.",
      );
    }
  }, []);

  useEffect(() => {
    const onFocus = () => void refreshEmail(true);
    window.addEventListener("focus", onFocus);
    if (
      new URLSearchParams(window.location.search).get("mode") ===
      "verifyAndChangeEmail"
    ) {
      void refreshEmail(true);
    }
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshEmail]);

  const performWalletAction = async (
    action: () => Promise<unknown>,
    pendingLabel: string,
    successMessage: string,
  ) => {
    setPendingWalletAction(pendingLabel);
    setWalletError("");
    setWalletNotice("");
    try {
      await action();
      await loadWallets();
      setWalletNotice(successMessage);
    } catch (error) {
      setWalletError(errorMessage(error));
    } finally {
      setPendingWalletAction("");
    }
  };

  const handleConnectedWallet = async () => {
    setConnectedPending(true);
    setWalletError("");
    setWalletNotice("");
    try {
      if (address) {
        await disconnect();
        setWalletNotice("Connected wallet session ended.");
      } else {
        await connect();
        setWalletNotice("Wallet connected for this browser session.");
      }
    } catch (error) {
      setWalletError(errorMessage(error));
    } finally {
      setConnectedPending(false);
    }
  };

  const submitEmailChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setEmailError("You must be signed in to change your email.");
      return;
    }
    setEmailPending(true);
    setEmailError("");
    setEmailNotice("");
    try {
      await requestEmailChange(
        currentUser,
        newEmail.trim(),
        needsPassword ? password : undefined,
      );
      setEmailNotice(
        `We sent a confirmation link to ${newEmail.trim()}. Your email changes after you open it.`,
      );
      setNewEmail("");
      setPassword("");
      setEmailDialogOpen(false);
    } catch (error) {
      setEmailError(emailChangeErrorMessage(error));
    } finally {
      setEmailPending(false);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <LoaderCircle className="h-5 w-5 animate-spin" aria-label="Loading account security" />
      </div>
    );
  }

  return (
    <div className="flex w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <ProfileSettingsSidebar />
      <main className="min-w-0 flex-1 space-y-8 p-6 lg:p-8">
        <header>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-sky-600" aria-hidden="true" />
            <h1 className="text-2xl font-semibold">Account security</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your email and Stellar wallet connections.
          </p>
        </header>

        <section id="email" className="scroll-mt-8 space-y-3">
          <h2 className="text-lg font-semibold">Email</h2>
          <div className="rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{email || "No email address"}</p>
                <p className="text-sm text-muted-foreground">
                  {emailVerified ? "Verified" : "Not verified"}
                </p>
              </div>
              {emailVerified ? (
                <Check className="h-5 w-5 text-green-600" aria-label="Email verified" />
              ) : (
                <Link className="text-sm text-sky-700 underline" href="/verify-email">
                  Verify email
                </Link>
              )}
            </div>
            {canChangeEmail ? (
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => {
                  setEmailError("");
                  setEmailNotice("");
                  setEmailDialogOpen(true);
                }}
              >
                Change email
              </Button>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Add an email sign-in method to change email.
              </p>
            )}
            {emailNotice && (
              <p role="status" className="mt-3 text-sm text-green-700">
                {emailNotice}
              </p>
            )}
            {emailSyncError && (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {emailSyncError}
              </p>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Connected wallet</h2>
          <div className="rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="font-mono text-sm">
                  {address || "No wallet connected"}
                </span>
              </div>
              <Button
                variant="outline"
                disabled={connectedPending}
                onClick={() => void handleConnectedWallet()}
              >
                {connectedPending
                  ? "Please wait…"
                  : address
                    ? "Disconnect"
                    : "Connect"}
              </Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Disconnecting only ends this browser session.
            </p>
          </div>
        </section>

        <section id="wallets" className="scroll-mt-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Linked wallets</h2>
              <p className="text-sm text-muted-foreground">
                Linked addresses are verified and saved to your account.
              </p>
            </div>
            <Button
              variant="outline"
              disabled={!address || connectedAlreadyLinked || walletUnavailable || Boolean(pendingWalletAction)}
              onClick={() =>
                void performWalletAction(
                  linkCurrentWallet,
                  "link",
                  "Wallet linked successfully.",
                )
              }
            >
              {pendingWalletAction === "link"
                ? "Verifying…"
                : connectedAlreadyLinked
                  ? "Already linked"
                  : "Link connected wallet"}
            </Button>
          </div>

          {walletLoading ? (
            <p className="py-4 text-sm text-muted-foreground">Loading linked wallets…</p>
          ) : walletUnavailable ? (
            <p className="rounded-lg border p-4 text-sm text-muted-foreground">
              Linked wallets need the SafeTrust backend
            </p>
          ) : walletError ? (
            <p role="alert" className="rounded-lg border border-destructive/40 p-4 text-sm text-destructive">
              {walletError}
            </p>
          ) : linkedWallets.length === 0 ? (
            <p className="rounded-lg border p-4 text-sm text-muted-foreground">
              No wallets linked.
            </p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {linkedWallets.map((wallet) => (
                <li
                  key={wallet.address}
                  className="flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="break-all font-mono text-sm">{wallet.address}</span>
                    {wallet.isPrimary && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        Primary
                      </span>
                    )}
                    {wallet.isSignInMethod && (
                      <span className="text-xs text-muted-foreground">
                        Used to sign in
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!wallet.isPrimary && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={Boolean(pendingWalletAction)}
                        onClick={() =>
                          void performWalletAction(
                            async () => {
                              const currentUser = auth.currentUser;
                              if (!currentUser) throw new Error("UNAUTHENTICATED");
                              await makePrimary(
                                wallet.address,
                                await currentUser.getIdToken(),
                              );
                            },
                            wallet.address,
                            "Primary wallet updated.",
                          )
                        }
                      >
                        {pendingWalletAction === wallet.address
                          ? "Updating…"
                          : "Make primary"}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={wallet.isSignInMethod || Boolean(pendingWalletAction)}
                      title={wallet.isSignInMethod ? "Used to sign in" : undefined}
                      onClick={() => setRemoveTarget(wallet)}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {walletNotice && (
            <p role="status" className="text-sm text-green-700">
              {walletNotice}
            </p>
          )}
        </section>
      </main>

      <Dialog
        open={Boolean(removeTarget)}
        onOpenChange={(open) => {
          if (!open && !pendingWalletAction) setRemoveTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove linked wallet?</DialogTitle>
            <DialogDescription>
              This only removes the wallet from your SafeTrust account. It does
              not disconnect your browser wallet session.
            </DialogDescription>
          </DialogHeader>
          {removeTarget && (
            <p className="break-all font-mono text-sm">{removeTarget.address}</p>
          )}
          {walletError && (
            <p role="alert" className="text-sm text-destructive">{walletError}</p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={Boolean(pendingWalletAction)}
              onClick={() => setRemoveTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!removeTarget || Boolean(pendingWalletAction)}
              onClick={() => {
                if (!removeTarget) return;
                const target = removeTarget;
                void performWalletAction(
                  async () => {
                    const currentUser = auth.currentUser;
                    if (!currentUser) throw new Error("UNAUTHENTICATED");
                    await unlinkWallet(
                      target.address,
                      await currentUser.getIdToken(),
                    );
                  },
                  target.address,
                  "Wallet removed.",
                ).then(() => setRemoveTarget(null));
              }}
            >
              {pendingWalletAction && removeTarget &&
              pendingWalletAction === removeTarget.address
                ? "Removing…"
                : "Remove wallet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change email</DialogTitle>
            <DialogDescription>
              We&apos;ll email a confirmation link. Your account email changes
              only after you open it.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitEmailChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">New email</Label>
              <Input
                id="new-email"
                type="email"
                required
                autoComplete="email"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
              />
            </div>
            {needsPassword && (
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input
                  id="current-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            )}
            {emailError && (
              <p role="alert" className="text-sm text-destructive">{emailError}</p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={emailPending}
                onClick={() => setEmailDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={emailPending}>
                {emailPending ? "Sending…" : "Send confirmation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
