import { useState, useCallback } from "react";
import {
  Horizon,
  TransactionBuilder,
  Operation,
  Networks,
  Asset,
  Memo,
  BASE_FEE,
} from "stellar-sdk";
import { ISupportedWallet } from "@creit.tech/stellar-wallets-kit";
import { kit } from "../constants/wallet-kit.constant";
import {
  WalletInfo,
  WalletError,
  WalletType,
  Balance,
  PaymentOptions,
  StellarWalletInfo,
} from "@/types/wallet";
import { validateWalletConnection } from "../utils/walletValidation";

const Server = Horizon.Server;

export const useMultiWallet = (
  horizonUrl: string = "https://horizon-testnet.stellar.org",
  network: string = Networks.TESTNET,
) => {
  const [connectedWallets, setConnectedWallets] = useState<WalletInfo[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<WalletError>();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [server] = useState(() => new Server(horizonUrl));

  const refreshBalancesForKey = useCallback(
    async (key: string) => {
      try {
        const account = await server.accounts().accountId(key).call();
        setBalances(account.balances);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 404) {
          // Account not funded yet
          setBalances([]);
        } else {
          console.error("Balance fetch failed:", err);
          setBalances([]);
        }
      }
    },
    [server],
  );

  const connectStellarWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(undefined);

    try {
      await kit.openModal({
        modalTitle: "Connect to your favorite Stellar wallet",
        onWalletSelected: async (option: ISupportedWallet) => {
          kit.setWallet(option.id);

          const { address } = await kit.getAddress();
          const { name } = option;

          const walletInfo: StellarWalletInfo = {
            address,
            name,
            chain: "stellar",
            connectionStatus: "connected",
            walletType: option.id as WalletType,
            balances: [],
            publicKey: address,
          };

          const validation = validateWalletConnection({
            address,
            chain: "stellar",
            walletType: option.id,
          });

          if (!validation.isValid) {
            throw new Error(validation.errors.join(", "));
          }

          setConnectedWallets((prev) => {
            const filtered = prev.filter((w) => w.walletType !== option.id);
            return [...filtered, walletInfo];
          });

          setSelectedWallet(walletInfo);
          refreshBalancesForKey(address); // Fire and forget
        },
      });
    } catch (err: unknown) {
      const walletError: WalletError = {
        code: "STELLAR_CONNECTION_FAILED",
        message: (err as Error)?.message || "Failed to connect Stellar wallet",
        details: err,
      };
      setError(walletError);
      throw walletError;
    } finally {
      setIsConnecting(false);
    }
  }, [refreshBalancesForKey]);

  /**
   * Generic connect wallet method
   */
  const connectWallet = useCallback(
    async (walletType: WalletType) => {
      switch (walletType) {
        case "freighter":
        case "albedo":
        case "lobstr":
          await connectStellarWallet();
          break;
        default:
          throw new Error(`Unsupported wallet type: ${walletType}`);
      }
    },
    [connectStellarWallet],
  );

  /**
   * Disconnect a specific wallet
   */
  const disconnectWallet = useCallback(
    async (walletType: WalletType) => {
      try {
        if (["freighter", "albedo", "lobstr"].includes(walletType)) {
          await kit.disconnect();
        }

        setConnectedWallets((prev) =>
          prev.filter((w) => w.walletType !== walletType),
        );

        if (selectedWallet?.walletType === walletType) {
          const remainingWallets = connectedWallets.filter(
            (w) => w.walletType !== walletType,
          );
          setSelectedWallet(remainingWallets[0] || undefined);
        }

        if (connectedWallets.length <= 1) {
          setBalances([]);
        }
      } catch (err: unknown) {
        const walletError: WalletError = {
          code: "DISCONNECT_FAILED",
          message: (err as Error)?.message || "Failed to disconnect wallet",
          details: err,
        };
        setError(walletError);
        throw walletError;
      }
    },
    [selectedWallet, connectedWallets],
  );

  /**
   * Select a connected wallet as active
   */
  const selectWallet = useCallback(
    (wallet: WalletInfo) => {
      setSelectedWallet(wallet);
      if (wallet.chain === "stellar") {
        refreshBalancesForKey(wallet.address);
      }
    },
    [refreshBalancesForKey],
  );

  /**
   * Reset all wallet connections
   */
  const reset = useCallback(() => {
    setConnectedWallets([]);
    setSelectedWallet(undefined);
    setError(undefined);
    setBalances([]);
    setIsConnecting(false);
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!selectedWallet || selectedWallet.chain !== "stellar") return;
    refreshBalancesForKey(selectedWallet.address);
  }, [selectedWallet, refreshBalancesForKey]);

  /**
   * Send payment using the selected Stellar wallet
   */
  const sendPayment = useCallback(
    async (opts: PaymentOptions) => {
      if (!selectedWallet || selectedWallet.chain !== "stellar") {
        throw new Error("No Stellar wallet selected");
      }

      try {
        const account = await server.loadAccount(selectedWallet.address);

        const asset =
          opts.asset === "XLM" || !opts.asset
            ? Asset.native()
            : new Asset(opts.asset.code, opts.asset.issuer);

        const txBuilder = new TransactionBuilder(account, {
          fee: BASE_FEE,
          networkPassphrase: network,
        });

        txBuilder.addOperation(
          Operation.payment({
            destination: opts.to,
            asset: asset,
            amount: opts.amount,
          }),
        );

        if (opts.memo) {
          txBuilder.addMemo(Memo.text(opts.memo));
        }

        txBuilder.setTimeout(30);
        const transaction = txBuilder.build();

        const { signedTxXdr } = await kit.signTransaction(transaction.toXDR(), {
          address: selectedWallet.address,
          networkPassphrase: network,
        });

        const signedTransaction = TransactionBuilder.fromXDR(
          signedTxXdr,
          network,
        );
        const result = await server.submitTransaction(signedTransaction);

        await refreshBalances();
        return result;
      } catch (error) {
        console.error("Payment failed:", error);
        throw error;
      }
    },
    [selectedWallet, server, network, refreshBalances],
  );

  return {
    connectedWallets,
    selectedWallet,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    selectWallet,
    reset,
    balances,
    refreshBalances,
    sendPayment: selectedWallet?.chain === "stellar" ? sendPayment : undefined,
    connectStellarWallet,
  };
};
