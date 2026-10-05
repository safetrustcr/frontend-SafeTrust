"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FREIGHTER_ID,
  ISupportedWallet,
} from "@creit.tech/stellar-wallets-kit";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getWalletKit } from "@/lib/stellar/wallet-kit";
import { signInWithFreighter, WalletAuthError } from "@/lib/auth/wallet";

const FREIGHTER_INSTALL_URL = "https://www.freighter.app";

interface FreighterSignInButtonProps {
  redirectTo: string;
}

export default function FreighterSignInButton({
  redirectTo,
}: FreighterSignInButtonProps) {
  const router = useRouter();
  const [isBusy, setIsBusy] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isFreighterAvailable, setIsFreighterAvailable] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobile(media.matches);
    updateViewport();
    media.addEventListener("change", updateViewport);

    getWalletKit()
      .getSupportedWallets()
      .then((wallets) => {
        const freighter = wallets.find((wallet) => wallet.id === FREIGHTER_ID);
        setIsFreighterAvailable(Boolean(freighter?.isAvailable));
      })
      .catch(() => setIsFreighterAvailable(false));

    return () => media.removeEventListener("change", updateViewport);
  }, []);

  const showWalletError = (error: unknown, walletId: string) => {
    if (!(error instanceof WalletAuthError)) {
      toast.error("Wallet sign-in failed. Please try again.");
      return;
    }

    if (error.code === "REJECTED") return;

    if (error.code === "NOT_INSTALLED" && walletId === FREIGHTER_ID) {
      toast.error("Freighter isn't installed.", {
        action: {
          label: "Install Freighter",
          onClick: () =>
            window.open(FREIGHTER_INSTALL_URL, "_blank", "noopener,noreferrer"),
        },
      });
      return;
    }

    toast.error(error.message);
  };

  const authenticate = async (walletId: string) => {
    try {
      await signInWithFreighter(walletId);
      router.replace(redirectTo);
    } catch (error) {
      showWalletError(error, walletId);
    }
  };

  const handleFreighterSignIn = async () => {
    setIsBusy(true);
    try {
      await authenticate(FREIGHTER_ID);
    } finally {
      setIsBusy(false);
    }
  };

  const handleOtherWallets = async () => {
    let authenticationInProgress = false;
    setIsBusy(true);
    try {
      await getWalletKit().openModal({
        modalTitle: "Choose a Stellar wallet",
        onWalletSelected: async (wallet: ISupportedWallet) => {
          authenticationInProgress = true;
          setIsBusy(true);
          try {
            await authenticate(wallet.id);
          } finally {
            authenticationInProgress = false;
            setIsBusy(false);
          }
        },
      });
    } catch {
      // Closing the wallet picker is a user cancellation.
    } finally {
      if (!authenticationInProgress) setIsBusy(false);
    }
  };

  const showMobileGuidance = isMobile && !isFreighterAvailable;

  return (
    <div className="space-y-2 text-center">
      {showMobileGuidance ? (
        <p className="rounded-md border border-border px-3 py-3 text-sm text-muted-foreground">
          Open this page in the Freighter mobile app to continue.
        </p>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleFreighterSignIn}
          disabled={isBusy}
        >
          {isBusy ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <Image
              src="/img/wallet/freighter.svg"
              alt=""
              width={20}
              height={20}
              aria-hidden="true"
            />
          )}
          Continue with Freighter
        </Button>
      )}
      <Button
        type="button"
        variant="link"
        className="h-auto px-1 py-1 text-sm"
        onClick={handleOtherWallets}
        disabled={isBusy}
      >
        Other Stellar wallets
      </Button>
    </div>
  );
}
