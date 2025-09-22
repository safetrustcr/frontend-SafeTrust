import { Core } from "@walletconnect/core";
import { WalletKit } from "@reown/walletkit";

let walletKit: any = null;

export const initializeWalletKit = async (): Promise<any> => {
  if (walletKit) {
    return walletKit;
  }

  try {
    // Initialize Core
    const core = new Core({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
    });

    // Initialize WalletKit
    walletKit = await WalletKit.init({
      core,
      metadata: {
        name: "SafeTrust",
        description: "SafeTrust Hotel Booking Platform",
        url: "https://safetrust.com",
        icons: ["https://safetrust.com/logo.png"],
      },
    });

    return walletKit;
  } catch (error) {
    console.error("Failed to initialize WalletKit:", error);
    throw error;
  }
};

export const getWalletKit = (): any => {
  return walletKit;
};
