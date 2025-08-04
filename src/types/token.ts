/**
 * Interface representing a token transaction (extends the base Transaction)
 */
export interface TokenTransaction {
  // Core transaction data
  id: string;
  sender: string;
  receiver: string;
  amount: string; // Amount in token's smallest unit
  token: string; // ERC20 token contract address
  status: TokenTransactionStatus;
  
  // Timing information
  timeoutPayment: number;
  lastInteraction: number;
  createdAt: number;
  
  // Dispute information
  disputeId?: number;
  senderFee: string; // Amount in Wei (for arbitration fees)
  receiverFee: string; // Amount in Wei (for arbitration fees)
  
  // Metadata
  metaEvidence?: string;
}

/**
 * Enum representing the status of a token escrow transaction
 */
export enum TokenTransactionStatus {
  NoDispute = 'NoDispute',
  WaitingSender = 'WaitingSender',
  WaitingReceiver = 'WaitingReceiver',
  DisputeCreated = 'DisputeCreated',
  Resolved = 'Resolved'
}

/**
 * Parameters for creating a new token transaction
 */
export interface CreateTokenTransactionParams {
  receiver: string;
  timeoutPayment: number;
  metaEvidence: string;
  amount: string; // Amount in token's smallest unit
  tokenAddress: string; // ERC20 token contract address
}

/**
 * Parameters for paying or reimbursing in tokens
 */
export interface TokenPaymentParams {
  transactionId: string;
  amount: string; // Amount in token's smallest unit
}

/**
 * Token information from subgraph
 */
export interface TokenInfo {
  address: string;
  name?: string;
  symbol?: string;
  decimals?: number;
} 