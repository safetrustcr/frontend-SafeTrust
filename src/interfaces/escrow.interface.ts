interface Milestone {
    description: string;
  }
  
  interface Roles {
    approver: string;
    serviceProvider: string;
    platformAddress: string;
    releaseSigner: string;
    disputeResolver: string;
    receiver: string;
  }
  
  interface Trustline {
    address: string;
    decimals: number;
  }
  
  export interface EscrowContract {
    signer: string;
    engagementId: string;
    title: string;
    description: string;
    roles: Roles;
    amount: number;
    platformFee: number;
    milestones: Milestone[];
    trustline: Trustline;
    receiverMemo?: number;
  }
  