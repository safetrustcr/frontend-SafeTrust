export interface Milestone {
  description: string;
  status?: string; // Optional if not always used
  approved_flag?: boolean; // Optional if not always present during init
}

export interface Trustline {
  address: string;
  decimals: number;
}

export interface EscrowContract {
  signer: string;
  engagementId: string;
  title: string;
  description: string;
  
  approver: string;
  serviceProvider: string;
  platformAddress: string;
  disputeResolver: string;
  releaseSigner: string;

  receiver?: string; // Optional depending on API logic

  amount: string;
  platformFee: string;

  milestones: Milestone[];

  trustline?: Trustline; // Optional but recommended
  receiverMemo?: string; // Optional
}
