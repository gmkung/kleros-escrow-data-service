"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionActions = void 0;
const ethers_1 = require("ethers");
const BaseService_1 = require("../base/BaseService");
/**
 * Service for writing transaction data to the Kleros Escrow contract
 */
class TransactionActions extends BaseService_1.BaseService {
    /**
     * Creates a new TransactionActions instance
     * @param config The Kleros Escrow configuration
     * @param signer A signer for write operations
     */
    constructor(config, signer) {
        super(config, signer);
        /**
         * Creates a new escrow transaction
         * @param params Parameters for creating the transaction
         * @returns The transaction response and the transaction ID
         */
        this.createTransaction = async (params) => {
            var _a, _b;
            this.ensureCanWrite();
            const tx = await this.escrowContract.createTransaction(params.timeoutPayment, params.receiver, params.metaEvidence, { value: ethers_1.ethers.utils.parseEther(params.value) });
            // Wait for the transaction to be mined
            const receipt = await tx.wait();
            // Find the transaction ID from the event logs
            const event = (_a = receipt.events) === null || _a === void 0 ? void 0 : _a.find((e) => e.event === "MetaEvidence");
            const transactionId = (_b = event === null || event === void 0 ? void 0 : event.args) === null || _b === void 0 ? void 0 : _b._metaEvidenceID.toString();
            return {
                transactionResponse: tx,
                transactionId,
            };
        };
        /**
         * Pays the receiver (releases funds from escrow)
         * @param params Parameters for the payment
         * @returns The transaction response
         */
        this.pay = async (params) => {
            this.ensureCanWrite();
            const tx = await this.escrowContract.pay(params.transactionId, ethers_1.ethers.utils.parseEther(params.amount));
            return tx;
        };
        /**
         * Reimburses the sender (returns funds from escrow)
         * @param params Parameters for the reimbursement
         * @returns The transaction response
         */
        this.reimburse = async (params) => {
            this.ensureCanWrite();
            const tx = await this.escrowContract.reimburse(params.transactionId, ethers_1.ethers.utils.parseEther(params.amount));
            return tx;
        };
        /**
         * Executes a transaction after the timeout period
         * @param transactionId The ID of the transaction to execute
         * @returns The transaction response
         */
        this.executeTransaction = async (transactionId) => {
            this.ensureCanWrite();
            const tx = await this.escrowContract.executeTransaction(transactionId);
            return tx;
        };
        /**
         * Times out the receiver for not paying arbitration fees
         * @param transactionId The ID of the transaction
         * @returns The transaction response
         */
        this.timeOutBySender = async (transactionId) => {
            this.ensureCanWrite();
            const tx = await this.escrowContract.timeOutBySender(transactionId);
            return tx;
        };
        /**
         * Times out the sender for not paying arbitration fees
         * @param transactionId The ID of the transaction
         * @returns The transaction response
         */
        this.timeOutByReceiver = async (transactionId) => {
            this.ensureCanWrite();
            const tx = await this.escrowContract.timeOutByReceiver(transactionId);
            return tx;
        };
        /**
         * Estimates gas for creating a transaction
         * @param params Parameters for creating the transaction
         * @returns The estimated gas
         */
        this.estimateGasForCreateTransaction = async (params) => {
            const gasEstimate = await this.escrowContract.estimateGas.createTransaction(params.timeoutPayment, params.receiver, params.metaEvidence, { value: ethers_1.ethers.utils.parseEther(params.value) });
            return gasEstimate;
        };
    }
}
exports.TransactionActions = TransactionActions;
