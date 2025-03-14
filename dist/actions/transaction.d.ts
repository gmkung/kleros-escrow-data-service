import { ethers } from "ethers";
import { CreateTransactionParams, PaymentParams } from "../types/transaction";
import { KlerosEscrowConfig } from "../types/config";
import { BaseService } from "../base/BaseService";
/**
 * Service for writing transaction data to the Kleros Escrow contract
 */
export declare class TransactionActions extends BaseService {
    /**
     * Creates a new TransactionActions instance
     * @param config The Kleros Escrow configuration
     * @param signer A signer for write operations
     */
    constructor(config: KlerosEscrowConfig, signer: ethers.Signer);
    /**
     * Creates a new escrow transaction
     * @param params Parameters for creating the transaction
     * @returns The transaction response and the transaction ID
     */
    createTransaction: (params: CreateTransactionParams) => Promise<{
        transactionResponse: ethers.providers.TransactionResponse;
        transactionId: string;
    }>;
    /**
     * Pays the receiver (releases funds from escrow)
     * @param params Parameters for the payment
     * @returns The transaction response
     */
    pay: (params: PaymentParams) => Promise<ethers.providers.TransactionResponse>;
    /**
     * Reimburses the sender (returns funds from escrow)
     * @param params Parameters for the reimbursement
     * @returns The transaction response
     */
    reimburse: (params: PaymentParams) => Promise<ethers.providers.TransactionResponse>;
    /**
     * Executes a transaction after the timeout period
     * @param transactionId The ID of the transaction to execute
     * @returns The transaction response
     */
    executeTransaction: (transactionId: string) => Promise<ethers.providers.TransactionResponse>;
    /**
     * Times out the receiver for not paying arbitration fees
     * @param transactionId The ID of the transaction
     * @returns The transaction response
     */
    timeOutBySender: (transactionId: string) => Promise<ethers.providers.TransactionResponse>;
    /**
     * Times out the sender for not paying arbitration fees
     * @param transactionId The ID of the transaction
     * @returns The transaction response
     */
    timeOutByReceiver: (transactionId: string) => Promise<ethers.providers.TransactionResponse>;
    /**
     * Estimates gas for creating a transaction
     * @param params Parameters for creating the transaction
     * @returns The estimated gas
     */
    estimateGasForCreateTransaction: (params: CreateTransactionParams) => Promise<ethers.BigNumber>;
}
