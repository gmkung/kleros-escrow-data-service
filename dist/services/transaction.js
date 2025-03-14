"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const transaction_1 = require("../types/transaction");
const BaseService_1 = require("../base/BaseService");
/**
 * Service for reading transaction data from the Kleros Escrow contract
 */
class TransactionService extends BaseService_1.BaseService {
    /**
     * Creates a new TransactionService instance
     * @param config The Kleros Escrow configuration
     * @param provider Optional provider for read operations
     */
    constructor(config, provider) {
        super(config, provider);
        /**
         * Gets a transaction by its ID
         * @param transactionId The ID of the transaction to fetch
         * @returns The transaction data
         */
        this.getTransaction = async (transactionId) => {
            const tx = await this.escrowContract.transactions(transactionId);
            return {
                id: transactionId,
                sender: tx.sender,
                receiver: tx.receiver,
                amount: tx.amount.toString(),
                status: this.mapStatus(tx.status),
                timeoutPayment: tx.timeoutPayment.toNumber(),
                lastInteraction: tx.lastInteraction.toNumber(),
                createdAt: 0, // Not directly available from contract, would need to get from events
                disputeId: tx.disputeId.toNumber() > 0 ? tx.disputeId.toNumber() : undefined,
                senderFee: tx.senderFee.toString(),
                receiverFee: tx.receiverFee.toString(),
            };
        };
        /**
         * Gets all transactions for a specific address
         * @param address The address to get transactions for
         * @returns Array of transactions where the address is sender or receiver
         */
        this.getTransactionsByAddress = async (address) => {
            const transactionIds = await this.escrowContract.getTransactionIDsByAddress(address);
            const transactions = [];
            for (const id of transactionIds) {
                const tx = await this.getTransaction(id.toString());
                transactions.push(tx);
            }
            return transactions;
        };
        /**
         * Gets the total number of transactions in the contract
         * @returns The count of transactions
         */
        this.getTransactionCount = async () => {
            const count = await this.escrowContract.getCountTransactions();
            return count.toNumber();
        };
        /**
         * Checks if a transaction can be executed (timeout has passed)
         * @param transactionId The ID of the transaction to check
         * @returns True if the transaction can be executed
         */
        this.canExecuteTransaction = async (transactionId) => {
            const tx = await this.getTransaction(transactionId);
            const currentTime = Math.floor(Date.now() / 1000);
            return (tx.status === transaction_1.TransactionStatus.NoDispute &&
                currentTime - tx.lastInteraction >= tx.timeoutPayment);
        };
        /**
         * Checks if a party can be timed out for not paying arbitration fees
         * @param transactionId The ID of the transaction to check
         * @returns Object indicating which party can be timed out, if any
         */
        this.canTimeOut = async (transactionId) => {
            const tx = await this.getTransaction(transactionId);
            const currentTime = Math.floor(Date.now() / 1000);
            const feeTimeout = await this.escrowContract.feeTimeout();
            return {
                canSenderTimeOut: tx.status === transaction_1.TransactionStatus.WaitingReceiver &&
                    currentTime - tx.lastInteraction >= feeTimeout,
                canReceiverTimeOut: tx.status === transaction_1.TransactionStatus.WaitingSender &&
                    currentTime - tx.lastInteraction >= feeTimeout,
            };
        };
        /**
         * Maps numeric status from contract to enum
         * @param status The numeric status from the contract
         * @returns The corresponding TransactionStatus enum value
         */
        this.mapStatus = (status) => {
            const statusMap = {
                0: transaction_1.TransactionStatus.NoDispute,
                1: transaction_1.TransactionStatus.WaitingSender,
                2: transaction_1.TransactionStatus.WaitingReceiver,
                3: transaction_1.TransactionStatus.DisputeCreated,
                4: transaction_1.TransactionStatus.Resolved,
            };
            return statusMap[status] || transaction_1.TransactionStatus.NoDispute;
        };
    }
}
exports.TransactionService = TransactionService;
