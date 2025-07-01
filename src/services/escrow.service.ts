import { kit } from '@/components/auth/wallet/constants/wallet-kit.constant';
import http from '@/core/config/axios/http';
import { EscrowContract } from '@/interfaces/escrow.interface';
import { WalletNetwork } from '@creit.tech/stellar-wallets-kit';
import { signTransaction } from '@stellar/freighter-api';
import { v4 as uuidv4 } from 'uuid';

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
  const serviceWallet = 'GBPA2LO4XHBZD54ZEGGK4GG3OYHAYBPK6FNDAHCJWNJTLTKYUL52QCQR';

  const initializedEscrowBody: EscrowContract = {
    signer: address,
    engagementId: uuidv4(),
    title: hotelName,
    description,
    approver: address,
    serviceProvider: serviceWallet,
    platformAddress: serviceWallet,
    releaseSigner: serviceWallet,
    disputeResolver: serviceWallet,
    receiver: serviceWallet,
    amount: price.toString(),
    platformFee: tax.toString(),
    milestones: [
      {
        description: 'The hotel delivers the room keys to the tenant',
        status: 'pending',
        approved_flag: false,
      },
      {
        description: 'The room is in perfectly conditions',
        status: 'pending',
        approved_flag: false,
      },
      {
        description: 'The tenant returns the room keys to the hotel',
        status: 'pending',
        approved_flag: false,
      },
    ],
    trustline: {
      address,
      decimals: 18,
    },
    receiverMemo: 'Hotel reservation',
  };

  const response = await http.post(
    '/deployer/invoke-deployer-contract',
    initializedEscrowBody
  );

  const { unsignedTransaction } = response.data;

  const { signedTxXdr } = await signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  const tx = await http.post('/helper/send-transaction', {
    signedXdr: signedTxXdr,
    returnEscrowDataIsRequired: true,
  });

  return { data: tx.data };
};

export const fundReservationEscrow = async ({
  contractId,
  amount,
}: FundEscrowProps) => {
  const { address } = await kit.getAddress();

  const fundEscrowResponse = await http.post('/escrow/fund-escrow', {
    contractId,
    signer: address,
    amount: amount.toString(),
  });

  const { unsignedTransaction } = fundEscrowResponse.data;

  const { signedTxXdr } = await signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  const tx = await http.post('/helper/send-transaction', {
    signedXdr: signedTxXdr,
  });

  return tx.data;
};
