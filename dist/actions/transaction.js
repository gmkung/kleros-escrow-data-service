"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionActions = void 0;
const ethers_1 = require("ethers");
/**
 * Service for writing transaction data to the Kleros Escrow contract
 */
class TransactionActions {
    /**
     * Creates a new TransactionActions instance
     * @param config The Kleros Escrow configuration
     * @param signerOrProvider A signer or provider
     */
    constructor(config, signerOrProvider) {
        /**
         * Creates a new escrow transaction
         * @param params Parameters for creating the transaction
         * @returns The transaction response and the transaction ID
         */
        this.createTransaction = async (params) => {
            var _a, _b;
            const tx = await this.contract.createTransaction(params.timeoutPayment, params.receiver, params.metaEvidence, { value: ethers_1.ethers.utils.parseEther(params.value) });
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
            const tx = await this.contract.pay(params.transactionId, ethers_1.ethers.utils.parseEther(params.amount));
            return tx;
        };
        /**
         * Reimburses the sender (returns funds from escrow)
         * @param params Parameters for the reimbursement
         * @returns The transaction response
         */
        this.reimburse = async (params) => {
            const tx = await this.contract.reimburse(params.transactionId, ethers_1.ethers.utils.parseEther(params.amount));
            return tx;
        };
        /**
         * Executes a transaction after the timeout period
         * @param transactionId The ID of the transaction to execute
         * @returns The transaction response
         */
        this.executeTransaction = async (transactionId) => {
            const tx = await this.contract.executeTransaction(transactionId);
            return tx;
        };
        /**
         * Times out the receiver for not paying arbitration fees
         * @param transactionId The ID of the transaction
         * @returns The transaction response
         */
        this.timeOutBySender = async (transactionId) => {
            const tx = await this.contract.timeOutBySender(transactionId);
            return tx;
        };
        /**
         * Times out the sender for not paying arbitration fees
         * @param transactionId The ID of the transaction
         * @returns The transaction response
         */
        this.timeOutByReceiver = async (transactionId) => {
            const tx = await this.contract.timeOutByReceiver(transactionId);
            return tx;
        };
        /**
         * Estimates gas for creating a transaction
         * @param params Parameters for creating the transaction
         * @returns The estimated gas
         */
        this.estimateGasForCreateTransaction = async (params) => {
            const gasEstimate = await this.contract.estimateGas.createTransaction(params.timeoutPayment, params.receiver, params.metaEvidence, { value: ethers_1.ethers.utils.parseEther(params.value) });
            return gasEstimate;
        };
        this.provider =
            signerOrProvider instanceof ethers_1.ethers.Signer
                ? signerOrProvider.provider
                : signerOrProvider;
        this.contract = new ethers_1.ethers.Contract(config.multipleArbitrableTransaction.address, config.multipleArbitrableTransaction.abi, signerOrProvider);
    }
}
exports.TransactionActions = TransactionActions;
