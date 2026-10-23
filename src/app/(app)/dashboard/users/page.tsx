"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserProfileCard } from "@/components/dashboard/UserProfileCard";
import {
  WalletAddressTable,
  type WalletEntry,
} from "@/components/dashboard/WalletAddressTable";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { auth } from "@/lib/firebase";
import { loginHref } from "@/components/navigation/account-routes";
import { AccountApiError, listWallets } from "@/features/account/wallets";

export default function UsersPage() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [walletError, setWalletError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace(loginHref("/dashboard/users"));
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const load = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      try {
        const { wallets: linkedWallets } = await listWallets(
          await currentUser.getIdToken(),
        );
        if (active) {
          setWallets(
            linkedWallets.map((wallet) => ({
              address: wallet.address,
              fullAddress: wallet.address,
              isPrimary: wallet.isPrimary,
              network: "Stellar",
            })),
          );
        }
      } catch (error) {
        if (!active) return;
        setWalletError(
          error instanceof AccountApiError &&
            error.code === "BACKEND_NOT_CONFIGURED"
            ? "Linked wallets need the SafeTrust backend."
            : error instanceof Error
              ? error.message
              : "Failed to load linked wallets.",
        );
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [user]);

  if (loading || !user) {
    return <p className="py-12 text-center text-sm text-muted-foreground">Loading your account…</p>;
  }

  const [firstName = "", ...lastNames] = (user.displayName ?? "").split(" ");
  const profile = {
    id: user.uid,
    firstName,
    lastName: lastNames.join(" "),
    email: user.email ?? "",
    phoneNumber: "",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Your account</h1>
      <UserProfileCard key={profile.id} user={profile} />
      {walletError && (
        <p role="alert" className="text-sm text-destructive">
          {walletError}
        </p>
      )}
      <WalletAddressTable wallets={wallets} />
    </div>
  );
}
