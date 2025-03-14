/**
 * Enum representing the status of an escrow transaction
 */
export declare enum TransactionStatus {
    NoDispute = "NoDispute",
    WaitingSender = "WaitingSender",
    WaitingReceiver = "WaitingReceiver",
    DisputeCreated = "DisputeCreated",
    Resolved = "Resolved"
}
/**
 * Enum representing the parties in an escrow transaction
 */
export declare enum Party {
    Sender = "Sender",
    Receiver = "Receiver"
}
/**
 * Interface representing an escrow transaction
 */
export interface Transaction {
    id: string;
    sender: string;
    receiver: string;
    amount: string;
    status: TransactionStatus;
    timeoutPayment: number;
    lastInteraction: number;
    createdAt: number;
    disputeId?: number;
    senderFee: string;
    receiverFee: string;
    metaEvidence?: string;
}
/**
 * Parameters for creating a new transaction
 */
export interface CreateTransactionParams {
    receiver: string;
    timeoutPayment: number;
    metaEvidence: string;
    value: string;
}
/**
 * Parameters for paying or reimbursing
 */
export interface PaymentParams {
    transactionId: string;
    amount: string;
}
