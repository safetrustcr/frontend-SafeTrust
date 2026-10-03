"use client";

import { useCallback } from "react";
import type { ISupportedWallet } from "@creit.tech/stellar-wallets-kit";
import { getWalletKit, signXdr } from "@/lib/stellar/wallet-kit";
import { useGlobalAuthenticationStore } from "@/core/store/data";

export function useWallet() {
  const address = useGlobalAuthenticationStore((s) => s.address);
  const name = useGlobalAuthenticationStore((s) => s.name);
  const connectWalletStore = useGlobalAuthenticationStore(
    (s) => s.connectWalletStore
  );
  const disconnectWalletStore = useGlobalAuthenticationStore(
    (s) => s.disconnectWalletStore
  );

  const connect = useCallback(
    () =>
      new Promise<string>((resolve, reject) => {
        getWalletKit()
          .openModal({
            modalTitle: "Connect your Stellar wallet",
            onWalletSelected: async (option: ISupportedWallet) => {
              try {
                getWalletKit().setWallet(option.id);
                const { address } = await getWalletKit().getAddress();
                await connectWalletStore(address, option.name);
                resolve(address);
              } catch (err) {
                reject(err);
              }
            },
          })
          .catch(reject);
      }),
    [connectWalletStore]
  );

  const disconnect = useCallback(async () => {
    await getWalletKit().disconnect();
    disconnectWalletStore();
  }, [disconnectWalletStore]);

  const sign = useCallback(
    (unsignedXdr: string) => {
      if (!address) throw new Error("No wallet connected");
      return signXdr(unsignedXdr, address);
    },
    [address]
  );

  return {
    address,
    name,
    isConnected: Boolean(address),
    connect,
    disconnect,
    sign,
  };
}
