"use client";

import { Copy, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WalletEntry {
  address: string;
  isPrimary: boolean;
  network: string;
}

interface WalletAddressTableProps {
  wallets: WalletEntry[];
}

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function WalletAddressTable({ wallets }: WalletAddressTableProps) {
  function handleCopy(address: string) {
    navigator.clipboard.writeText(address);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Wallet Addresses
        </CardTitle>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Wallet
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead>Network</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallets.map((wallet) => (
                <TableRow key={wallet.address}>
                  <TableCell className="font-mono text-sm">
                    {truncateAddress(wallet.address)}
                    {wallet.isPrimary && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        Primary
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{wallet.network}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(wallet.address)}
                      className="gap-1"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
