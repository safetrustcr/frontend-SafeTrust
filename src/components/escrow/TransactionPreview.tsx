"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TransactionPreviewProps } from "./types";

export const TransactionPreview: React.FC<TransactionPreviewProps> = ({ action }) => {
  const getActionLabel = (type: string) => {
    switch (type) {
      case 'fund':
        return 'Fund Escrow';
      case 'release':
        return 'Release Funds';
      case 'approve':
        return 'Approve Milestone';
      case 'dispute':
        return 'Dispute Transaction';
      case 'deploy':
        return 'Deploy Contract';
      default:
        return 'Unknown Action';
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'fund':
        return 'bg-green-100 text-green-800';
      case 'release':
        return 'bg-blue-100 text-blue-800';
      case 'approve':
        return 'bg-yellow-100 text-yellow-800';
      case 'dispute':
        return 'bg-red-100 text-red-800';
      case 'deploy':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Transaction Details</CardTitle>
          <Badge className={getActionColor(action.type)}>
            {getActionLabel(action.type)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {action.title && (
          <div>
            <h4 className="text-sm font-medium text-gray-600">Title</h4>
            <p className="text-sm">{action.title}</p>
          </div>
        )}

        {action.description && (
          <div>
            <h4 className="text-sm font-medium text-gray-600">Description</h4>
            <p className="text-sm">{action.description}</p>
          </div>
        )}

        {action.amount && (
          <div>
            <h4 className="text-sm font-medium text-gray-600">Amount</h4>
            <p className="text-sm font-semibold">{action.amount} USDC</p>
          </div>
        )}

        {action.contractId && (
          <div>
            <h4 className="text-sm font-medium text-gray-600">Contract ID</h4>
            <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
              {action.contractId}
            </p>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-gray-600">Transaction XDR (Preview)</h4>
          <p className="text-xs font-mono bg-gray-100 p-2 rounded max-h-20 overflow-y-auto break-all">
            {action.unsignedXDR.slice(0, 100)}...
          </p>
        </div>
      </CardContent>
    </Card>
  );
};