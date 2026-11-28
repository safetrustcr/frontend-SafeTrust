import type {
  DisputeDetails,
  EscrowLifecycleStatus,
  TimelineStepDetail,
} from "../model/lifecycle";

export interface LifecycleDemoFixture {
  id: string;
  name: string;
  status: EscrowLifecycleStatus;
  listingName: string;
  amount: number;
  currency: string;
  checkInDate: string;
  checkOutDate: string;
  contractId: string;
  hostAddress: string;
  guestAddress: string;
  resolverAddress: string;
  platformAddress: string;
  disputeDetails?: DisputeDetails;
  stepDetails: Partial<
    Record<EscrowLifecycleStatus, Partial<TimelineStepDetail>>
  >;
}

export const LIFECYCLE_FIXTURES: Record<string, LifecycleDemoFixture> = {
  created: {
    id: "escrow-demo-created-001",
    name: "1. Escrow Created (Awaiting Deposit)",
    status: "created",
    listingName: "La Sabana Modern Apartment",
    amount: 4000,
    currency: "USDC",
    checkInDate: "2025-03-01",
    checkOutDate: "2025-03-10",
    contractId: "CA3D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ",
    hostAddress: "GBHOST47W5RKK2RQQ7L6H6A7QZ5H4LMPQZVM5G6Z6V6B4J4N7M8Q9ABC",
    guestAddress: "GBGUEST12ABCDEF3456789GHIJKLMNOPQRSTUVWXYZ123456789ABCDEF",
    resolverAddress: "GBRESOLVER9999999999999999999999999999999999999999999999",
    platformAddress: "GBPLATFORM8888888888888888888888888888888888888888888888",
    stepDetails: {
      created: {
        date: "2025-02-20",
        actor: "Guest created the escrow",
        txHash:
          "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90",
      },
    },
  },

  funded_before_checkout: {
    id: "escrow-demo-funded-active-002",
    name: "2. Payment Locked (Stay In Progress - Future Checkout)",
    status: "funded",
    listingName: "La Sabana Modern Apartment",
    amount: 4000,
    currency: "USDC",
    checkInDate: "2025-02-01",
    checkOutDate: "2099-12-31", // Far future
    contractId: "CA3D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ",
    hostAddress: "GBHOST47W5RKK2RQQ7L6H6A7QZ5H4LMPQZVM5G6Z6V6B4J4N7M8Q9ABC",
    guestAddress: "GBGUEST12ABCDEF3456789GHIJKLMNOPQRSTUVWXYZ123456789ABCDEF",
    resolverAddress: "GBRESOLVER9999999999999999999999999999999999999999999999",
    platformAddress: "GBPLATFORM8888888888888888888888888888888888888888888888",
    stepDetails: {
      created: {
        date: "2025-02-01",
        actor: "Guest created the escrow",
        txHash:
          "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90",
      },
      funded: {
        date: "2025-02-01",
        actor: "Guest locked 4,000 USDC in escrow",
        txHash:
          "b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1",
      },
    },
  },

  funded_after_checkout: {
    id: "escrow-demo-funded-checkout-003",
    name: "3. Payment Locked (Checkout Passed - Host Can Conclude)",
    status: "funded",
    listingName: "La Sabana Modern Apartment",
    amount: 4000,
    currency: "USDC",
    checkInDate: "2025-01-20",
    checkOutDate: "2025-01-30", // Past checkout
    contractId: "CA3D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ",
    hostAddress: "GBHOST47W5RKK2RQQ7L6H6A7QZ5H4LMPQZVM5G6Z6V6B4J4N7M8Q9ABC",
    guestAddress: "GBGUEST12ABCDEF3456789GHIJKLMNOPQRSTUVWXYZ123456789ABCDEF",
    resolverAddress: "GBRESOLVER9999999999999999999999999999999999999999999999",
    platformAddress: "GBPLATFORM8888888888888888888888888888888888888888888888",
    stepDetails: {
      created: {
        date: "2025-01-20",
        actor: "Guest created the escrow",
        txHash:
          "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90",
      },
      funded: {
        date: "2025-01-20",
        actor: "Guest locked 4,000 USDC in escrow",
        txHash:
          "b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1",
      },
    },
  },

  stay_completed: {
    id: "escrow-demo-stay-completed-004",
    name: "4. Stay Completed (Host Concluded - Guest Approves or Disputes)",
    status: "stay_completed",
    listingName: "La Sabana Modern Apartment",
    amount: 4000,
    currency: "USDC",
    checkInDate: "2025-01-20",
    checkOutDate: "2025-01-30",
    contractId: "CA3D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ",
    hostAddress: "GBHOST47W5RKK2RQQ7L6H6A7QZ5H4LMPQZVM5G6Z6V6B4J4N7M8Q9ABC",
    guestAddress: "GBGUEST12ABCDEF3456789GHIJKLMNOPQRSTUVWXYZ123456789ABCDEF",
    resolverAddress: "GBRESOLVER9999999999999999999999999999999999999999999999",
    platformAddress: "GBPLATFORM8888888888888888888888888888888888888888888888",
    stepDetails: {
      created: {
        date: "2025-01-20",
        actor: "Guest created the escrow",
      },
      funded: {
        date: "2025-01-20",
        actor: "Guest locked 4,000 USDC in escrow",
      },
      stay_completed: {
        date: "2025-01-31",
        actor: "Host marked the stay completed",
        txHash:
          "c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2",
      },
    },
  },

  approved_option_a: {
    id: "escrow-demo-approved-005",
    name: "5. Approved (Option A: Platform Release Queued)",
    status: "approved",
    listingName: "La Sabana Modern Apartment",
    amount: 4000,
    currency: "USDC",
    checkInDate: "2025-01-20",
    checkOutDate: "2025-01-30",
    contractId: "CA3D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ",
    hostAddress: "GBHOST47W5RKK2RQQ7L6H6A7QZ5H4LMPQZVM5G6Z6V6B4J4N7M8Q9ABC",
    guestAddress: "GBGUEST12ABCDEF3456789GHIJKLMNOPQRSTUVWXYZ123456789ABCDEF",
    resolverAddress: "GBRESOLVER9999999999999999999999999999999999999999999999",
    platformAddress: "GBPLATFORM8888888888888888888888888888888888888888888888",
    stepDetails: {
      created: { date: "2025-01-20", actor: "Guest created the escrow" },
      funded: { date: "2025-01-20", actor: "Guest locked 4,000 USDC" },
      stay_completed: { date: "2025-01-31", actor: "Host marked completed" },
      approved: {
        date: "2025-02-01",
        actor: "Guest approved the stay",
        txHash:
          "d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3",
      },
    },
  },

  released: {
    id: "escrow-demo-released-006",
    name: "6. Released (Completed Escrow Lifecycle)",
    status: "released",
    listingName: "La Sabana Modern Apartment",
    amount: 4000,
    currency: "USDC",
    checkInDate: "2025-01-20",
    checkOutDate: "2025-01-30",
    contractId: "CA3D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ",
    hostAddress: "GBHOST47W5RKK2RQQ7L6H6A7QZ5H4LMPQZVM5G6Z6V6B4J4N7M8Q9ABC",
    guestAddress: "GBGUEST12ABCDEF3456789GHIJKLMNOPQRSTUVWXYZ123456789ABCDEF",
    resolverAddress: "GBRESOLVER9999999999999999999999999999999999999999999999",
    platformAddress: "GBPLATFORM8888888888888888888888888888888888888888888888",
    stepDetails: {
      created: { date: "2025-01-20", actor: "Guest created the escrow" },
      funded: { date: "2025-01-20", actor: "Guest locked 4,000 USDC" },
      stay_completed: { date: "2025-01-31", actor: "Host marked completed" },
      approved: { date: "2025-02-01", actor: "Guest approved stay" },
      released: {
        date: "2025-02-02",
        actor: "Funds released to host",
        txHash:
          "e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4",
      },
    },
  },

  disputed: {
    id: "escrow-demo-disputed-007",
    name: "7. Disputed (Dispute Raised - Resolver Active)",
    status: "disputed",
    listingName: "La Sabana Modern Apartment",
    amount: 4000,
    currency: "USDC",
    checkInDate: "2025-01-20",
    checkOutDate: "2025-01-30",
    contractId: "CA3D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ",
    hostAddress: "GBHOST47W5RKK2RQQ7L6H6A7QZ5H4LMPQZVM5G6Z6V6B4J4N7M8Q9ABC",
    guestAddress: "GBGUEST12ABCDEF3456789GHIJKLMNOPQRSTUVWXYZ123456789ABCDEF",
    resolverAddress: "GBRESOLVER9999999999999999999999999999999999999999999999",
    platformAddress: "GBPLATFORM8888888888888888888888888888888888888888888888",
    disputeDetails: {
      reason: "Property not as described",
      description:
        "The apartment had severe water leak in the second bathroom and air conditioning was non-operational throughout the stay.",
      openedBy: "Guest",
      openedAt: "2025-02-02",
      txHash:
        "f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5",
    },
    stepDetails: {
      created: { date: "2025-01-20", actor: "Guest created the escrow" },
      funded: { date: "2025-01-20", actor: "Guest locked 4,000 USDC" },
      disputed: {
        date: "2025-02-02",
        actor: "Guest opened a dispute",
        txHash:
          "f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5",
      },
    },
  },

  resolved: {
    id: "escrow-demo-resolved-008",
    name: "8. Resolved (Arbitrated and Split by Resolver)",
    status: "resolved",
    listingName: "La Sabana Modern Apartment",
    amount: 4000,
    currency: "USDC",
    checkInDate: "2025-01-20",
    checkOutDate: "2025-01-30",
    contractId: "CA3D5KRYMCMFZVACNOHQPB2DBQLPRDHTPH5VFFH75BLTXFTRYVVPOCCZ",
    hostAddress: "GBHOST47W5RKK2RQQ7L6H6A7QZ5H4LMPQZVM5G6Z6V6B4J4N7M8Q9ABC",
    guestAddress: "GBGUEST12ABCDEF3456789GHIJKLMNOPQRSTUVWXYZ123456789ABCDEF",
    resolverAddress: "GBRESOLVER9999999999999999999999999999999999999999999999",
    platformAddress: "GBPLATFORM8888888888888888888888888888888888888888888888",
    disputeDetails: {
      reason: "Property not as described",
      description: "Severe leak and non-functional AC.",
      openedBy: "Guest",
      openedAt: "2025-02-02",
    },
    stepDetails: {
      created: { date: "2025-01-20", actor: "Guest created the escrow" },
      funded: { date: "2025-01-20", actor: "Guest locked 4,000 USDC" },
      disputed: { date: "2025-02-02", actor: "Guest opened a dispute" },
      resolved: {
        date: "2025-02-04",
        actor:
          "Dispute resolver split balance: 2,000 USDC Guest / 2,000 USDC Host",
        txHash:
          "0718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6",
      },
    },
  },
};
