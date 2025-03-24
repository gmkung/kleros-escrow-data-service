/**
 * Enum representing the status of an escrow transaction
 */
export enum TransactionStatus {
  NoDispute = 'NoDispute',
  WaitingSender = 'WaitingSender',
  WaitingReceiver = 'WaitingReceiver',
  DisputeCreated = 'DisputeCreated',
  Resolved = 'Resolved'
}

/**
 * Enum representing the parties in an escrow transaction
 */
export enum Party {
  Sender = 'Sender',
  Receiver = 'Receiver'
}

/**
 * Interface representing an escrow transaction
 */
export interface Transaction {
  // Core transaction data
  id: string;
  sender: string;
  receiver: string;
  amount: string; // Amount in Wei
  status: TransactionStatus;
  
  // Timing information
  timeoutPayment: number;
  lastInteraction: number;
  createdAt: number;
  
  // Dispute information
  disputeId?: number;
  senderFee: string; // Amount in Wei
  receiverFee: string; // Amount in Wei
  
  // Metadata
  metaEvidence?: string;
}

/**
 * Parameters for creating a new transaction
 */
export interface CreateTransactionParams {
  receiver: string;
  timeoutPayment: number;
  metaEvidence: string;
  value: string; // Amount in Wei
}

/**
 * Parameters for paying or reimbursing
 */
export interface PaymentParams {
  transactionId: string;
  amount: string; // Amount in Wei
} 