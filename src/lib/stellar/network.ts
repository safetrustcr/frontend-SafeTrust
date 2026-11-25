import { WalletNetwork } from "@creit.tech/stellar-wallets-kit/types";
import { clientEnv } from "@/config/env";

export const STELLAR_NETWORK_NAME: "testnet" | "mainnet" =
  clientEnv.NEXT_PUBLIC_TRUSTLESS_NETWORK === "mainnet" ? "mainnet" : "testnet";
export const STELLAR_NETWORK =
  STELLAR_NETWORK_NAME === "mainnet"
    ? WalletNetwork.PUBLIC
    : WalletNetwork.TESTNET;
