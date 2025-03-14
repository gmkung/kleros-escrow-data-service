import { Transaction } from '../types/transaction';
import { KlerosEscrowConfig } from '../types/config';
/**
 * Service for reading transaction data from the Kleros Escrow contract
 */
export declare class TransactionService {
    private provider;
    private contract;
    /**
     * Creates a new TransactionService instance
     * @param config The Kleros Escrow configuration
     */
    constructor(config: KlerosEscrowConfig);
    /**
     * Gets a transaction by its ID
     * @param transactionId The ID of the transaction to fetch
     * @returns The transaction data
     */
    getTransaction: (transactionId: string) => Promise<Transaction>;
    /**
     * Gets all transactions for a specific address
     * @param address The address to get transactions for
     * @returns Array of transactions where the address is sender or receiver
     */
    getTransactionsByAddress: (address: string) => Promise<Transaction[]>;
    /**
     * Gets the total number of transactions in the contract
     * @returns The count of transactions
     */
    getTransactionCount: () => Promise<number>;
    /**
     * Gets the amount paid by a party in a transaction
     * @param transactionId The ID of the transaction
     * @param party The address of the party
     * @returns The amount paid in wei as a string
     */
    getAmountPaid: (transactionId: string, party: string) => Promise<string>;
    /**
     * Checks if a transaction can be executed (timeout has passed)
     * @param transactionId The ID of the transaction to check
     * @returns True if the transaction can be executed
     */
    canExecuteTransaction: (transactionId: string) => Promise<boolean>;
    /**
     * Checks if a party can be timed out for not paying arbitration fees
     * @param transactionId The ID of the transaction to check
     * @returns Object indicating which party can be timed out, if any
     */
    canTimeOut: (transactionId: string) => Promise<{
        canSenderTimeOut: boolean;
        canReceiverTimeOut: boolean;
    }>;
    /**
     * Maps numeric status from contract to enum
     * @param status The numeric status from the contract
     * @returns The corresponding TransactionStatus enum value
     */
    private mapStatus;
}
