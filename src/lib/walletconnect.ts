import { Core } from "@walletconnect/core";
import { WalletKit } from "@reown/walletkit";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";

const core = new Core({
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
  relayUrl: "wss://relay.walletconnect.com"
});

export const walletKit = await WalletKit.init({
  core, // <- pass the shared `core` instance
  metadata: {
    name: "SafeTrust",
    description: "SafeTrust Hotel Booking Platform",
    url: "https://safetrust.com",
    icons: ["https://safetrust.com/logo.png"],
  },
});

export const createWalletConnectURI = async () => {
  const { uri } = await core.pairing.create();
  return uri;
};

// Handle session proposals
walletKit.on("session_proposal", async ({ id, params }) => {
  try {
    const approvedNamespaces = buildApprovedNamespaces({
      proposal: params,
      supportedNamespaces: {
        eip155: {
          chains: ["eip155:1", "eip155:56"], // Ethereum + BSC
          methods: ["eth_sendTransaction", "personal_sign"],
          events: ["accountsChanged", "chainChanged"],
          accounts: ["eip155:1:0xYourWalletAddress"],
        },
      },
    });

    await walletKit.approveSession({ id, namespaces: approvedNamespaces });
  } catch (error) {
    await walletKit.rejectSession({ id, reason: getSdkError("USER_REJECTED") });
  }
});
