export interface EscrowAction {
  unsignedXDR: string;
  type: 'fund' | 'release' | 'approve' | 'dispute' | 'deploy';
  amount?: string;
  contractId?: string;
  description?: string;
  title?: string;
}

export interface TransactionResult {
  hash: string;
  status: 'success' | 'pending' | 'failed';
  message?: string;
  escrowData?: any;
}

export interface XDRSigningFlowProps {
  escrowAction: EscrowAction;
  onSuccess: (result: TransactionResult) => void;
  onError?: (error: Error) => void;
  apiKey?: string;
  network?: 'testnet' | 'mainnet';
}

export interface TransactionPreviewProps {
  action: EscrowAction;
}