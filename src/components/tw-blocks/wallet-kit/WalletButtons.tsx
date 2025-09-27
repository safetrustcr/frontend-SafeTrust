"use client";

import * as React from "react";
import { useWallet } from "./useWallet";
import { useWalletContext } from "./WalletProvider";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, Copy, LogOut, ChevronDown, Wallet } from "lucide-react";

/**
 * Wallet connection/disconnection button component
 * Shows different states based on wallet connection status
 */
export const WalletButton = () => {
  const { handleConnect, handleDisconnect } = useWallet();
  const { walletAddress, walletName } = useWalletContext();
  const [copied, setCopied] = React.useState(false);

  const shortAddress = React.useMemo(() => {
    if (!walletAddress) return "";
    if (walletAddress.length <= 10) return walletAddress;
    return `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`;
  }, [walletAddress]);

  const copyAddress = async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {
      // noop
    }
  };

  if (walletAddress) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-10 px-4 gap-2 font-medium bg-transparent"
          >
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">{walletName}</span>
            <span className="font-mono text-sm text-muted-foreground">
              {shortAddress}
            </span>
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{walletName}</span>
              </div>
              <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                Testnet
              </span>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 border">
              <p className="text-xs text-muted-foreground mb-1">Address</p>
              <p className="font-mono text-sm break-all">{walletAddress}</p>
            </div>
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Button
                onClick={copyAddress}
                variant="ghost"
                size="sm"
                className="flex-1 cursor-pointer"
                disabled={copied}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                onClick={handleDisconnect}
                variant="outline"
                size="sm"
                className="flex-1 text-destructive hover:text-destructive bg-transparent cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Button
      className="h-10 px-6 gap-2 font-medium cursor-pointer"
      onClick={handleConnect}
    >
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
};
