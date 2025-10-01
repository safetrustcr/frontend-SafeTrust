import { kit } from "@/components/auth/wallet/constants/wallet-kit.constant";
import http from "@/core/config/axios/http";
import { EscrowContract } from "@/interfaces/escrow.interface";
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit";
import { signTransaction } from "@stellar/freighter-api";

interface InitializedEscrowProps {
  hotelName: string;
  description: string;
  price: number;
  tax: number;
}

interface FundEscrowProps {
  contractId: string;
  amount: number;
}

export const initializedReservationEscrow = async ({
  hotelName,
  description,
  price,
  tax,
}: InitializedEscrowProps) => {
  const { address } = await kit.getAddress();

  if (!price || price <= 0) {
    throw new Error('Invalid price: must be a positive number');
  }
  if (!tax || tax < 0) {
    throw new Error('Invalid tax: must be a non-negative number');
  }


  if (price <= 0) {
    throw new Error('Invalid amount after conversion to smallest unit');
  } 

  const initializedEscrowBody: EscrowContract = {
    signer: address,
    engagementId: "HR1-223423232",
    title: hotelName,
    description,
    roles: {
      approver: address,
      serviceProvider: 'GBPA2LO4XHBZD54ZEGGK4GG3OYHAYBPK6FNDAHCJWNJTLTKYUL52QCQR',
      platformAddress: 'GBPA2LO4XHBZD54ZEGGK4GG3OYHAYBPK6FNDAHCJWNJTLTKYUL52QCQR',
      releaseSigner: 'GBPA2LO4XHBZD54ZEGGK4GG3OYHAYBPK6FNDAHCJWNJTLTKYUL52QCQR',
      disputeResolver: 'GBPA2LO4XHBZD54ZEGGK4GG3OYHAYBPK6FNDAHCJWNJTLTKYUL52QCQR',
      receiver: 'GBPA2LO4XHBZD54ZEGGK4GG3OYHAYBPK6FNDAHCJWNJTLTKYUL52QCQR',
    },
    amount: price,
    platformFee: tax,
    milestones: [
      {
        description: 'The hotel delivers the room keys to the tenant',
      },
      {
        description: 'The room is in perfectly conditions',
      },
      {
        description: 'The tenant returns the room keys to the hotel',
      },
    ],
    trustline: {
      address: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA',
      decimals: 10000000,
    },
    receiverMemo: 123456,
  };

  const response = await http.post(
    '/deployer/single-release',
    initializedEscrowBody
  );

  const { unsignedTransaction } = response.data;

  const { signedTxXdr } = await signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  const tx = await http.post("/helper/send-transaction", {
    signedXdr: signedTxXdr,
  });

  const { data } = tx;

  return { data };
};

export const fundReservationEscrow = async ({
  contractId,
  amount,
}: FundEscrowProps) => {
  const { address } = await kit.getAddress();

  if (!contractId) {
    throw new Error('Contract ID is required');
  }
  if (!amount || amount <= 0) {
    throw new Error('Invalid amount: must be a positive number');
  }


  if (amount <= 0) {
    throw new Error('Invalid amount after conversion to smallest unit');
  }

  const fundEscrowResponse = await http.post('/escrow/single-release/fund-escrow', {
    contractId,
    signer: address,
    amount: amount,
  });

  const { unsignedTransaction } = fundEscrowResponse.data;

  const { signedTxXdr } = await signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  const tx = await http.post("/helper/send-transaction", {
    signedXdr: signedTxXdr,
  });

  const { data } = tx;

  return data;
};
