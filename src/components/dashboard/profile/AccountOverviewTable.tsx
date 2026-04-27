"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Copy, MoreHorizontal } from "lucide-react";
import { useState } from "react";

interface AccountOverviewTableProps {
  createdAt: string;
  walletAddress: string;
  email: string;
}

export function AccountOverviewTable({
  createdAt,
  walletAddress,
  email,
}: AccountOverviewTableProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncated =
    walletAddress.length > 10
      ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
      : walletAddress;

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Account overview</h3>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                Creation date
              </th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                Wallet address
              </th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                Email
              </th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-3 text-muted-foreground">{createdAt}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-muted-foreground">
                    {truncated}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Copy wallet address"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{email}</td>
              <td className="px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-accent transition-colors"
                      aria-label="Account actions"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Disconnect wallet</DropdownMenuItem>
                    <DropdownMenuItem>Change email</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
