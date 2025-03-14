"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceActions = void 0;
const ethers_1 = require("ethers");
const ipfs_1 = require("../services/ipfs");
/**
 * Service for evidence-related actions in the Kleros Escrow contract
 */
class EvidenceActions {
    /**
     * Creates a new EvidenceActions instance
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
     * Submits evidence for a dispute
     * @param params Parameters for submitting evidence
     * @returns The transaction response
     */
    async submitEvidence(params) {
        const tx = await this.contract.submitEvidence(params.transactionId, params.evidence);
        return tx;
    }
    /**
     * Estimates gas for submitting evidence
     * @param params Parameters for submitting evidence
     * @returns The estimated gas
     */
    async estimateGasForSubmitEvidence(params) {
        const gasEstimate = await this.contract.estimateGas.submitEvidence(params.transactionId, params.evidence);
        return gasEstimate;
    }
    /**
     * Uploads evidence to IPFS
     * @param config The Kleros Escrow configuration
     * @param evidence The evidence data to upload
     * @returns The IPFS URI of the uploaded evidence
     */
    static async uploadEvidenceToIPFS(config, evidence) {
        if (!config.ipfsGateway) {
            throw new Error("IPFS gateway not configured");
        }
        const ipfsService = new ipfs_1.IPFSService(config.ipfsGateway);
        return ipfsService.uploadEvidence(evidence);
    }
}
exports.EvidenceActions = EvidenceActions;
