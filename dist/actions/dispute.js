"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisputeActions = void 0;
const ethers_1 = require("ethers");
/**
 * Service for dispute-related actions in the Kleros Escrow contract
 */
class DisputeActions {
    /**
     * Creates a new DisputeActions instance
     * @param config The Kleros Escrow configuration
     * @param signerOrProvider A signer or provider
     */
    constructor(config, signerOrProvider) {
        this.provider = signerOrProvider instanceof ethers_1.ethers.Signer
            ? signerOrProvider.provider
            : signerOrProvider;
        this.contract = new ethers_1.ethers.Contract(config.multipleArbitrableTransaction.address, config.multipleArbitrableTransaction.abi, signerOrProvider);
    }
    /**
     * Pays arbitration fee as the sender to raise a dispute
     * @param params Parameters for paying the arbitration fee
     * @returns The transaction response
     */
    async payArbitrationFeeBySender(params) {
        const tx = await this.contract.payArbitrationFeeBySender(params.transactionId, { value: ethers_1.ethers.utils.parseEther(params.value) });
        return tx;
    }
    /**
     * Pays arbitration fee as the receiver to raise a dispute
     * @param params Parameters for paying the arbitration fee
     * @returns The transaction response
     */
    async payArbitrationFeeByReceiver(params) {
        const tx = await this.contract.payArbitrationFeeByReceiver(params.transactionId, { value: ethers_1.ethers.utils.parseEther(params.value) });
        return tx;
    }
    /**
     * Appeals a ruling
     * @param params Parameters for appealing
     * @returns The transaction response
     */
    async appeal(params) {
        const tx = await this.contract.appeal(params.transactionId, { value: ethers_1.ethers.utils.parseEther(params.value) });
        return tx;
    }
    /**
     * Estimates gas for paying arbitration fee as sender
     * @param params Parameters for paying the arbitration fee
     * @returns The estimated gas
     */
    async estimateGasForPayArbitrationFeeBySender(params) {
        const gasEstimate = await this.contract.estimateGas.payArbitrationFeeBySender(params.transactionId, { value: ethers_1.ethers.utils.parseEther(params.value) });
        return gasEstimate;
    }
    /**
     * Estimates gas for paying arbitration fee as receiver
     * @param params Parameters for paying the arbitration fee
     * @returns The estimated gas
     */
    async estimateGasForPayArbitrationFeeByReceiver(params) {
        const gasEstimate = await this.contract.estimateGas.payArbitrationFeeByReceiver(params.transactionId, { value: ethers_1.ethers.utils.parseEther(params.value) });
        return gasEstimate;
    }
    /**
     * Estimates gas for appealing a ruling
     * @param params Parameters for appealing
     * @returns The estimated gas
     */
    async estimateGasForAppeal(params) {
        const gasEstimate = await this.contract.estimateGas.appeal(params.transactionId, { value: ethers_1.ethers.utils.parseEther(params.value) });
        return gasEstimate;
    }
}
exports.DisputeActions = DisputeActions;
