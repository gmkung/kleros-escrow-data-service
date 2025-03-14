"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceActions = void 0;
const ipfs_1 = require("../services/ipfs");
const BaseService_1 = require("../base/BaseService");
/**
 * Service for evidence-related actions in the Kleros Escrow contract
 */
class EvidenceActions extends BaseService_1.BaseService {
    /**
     * Creates a new EvidenceActions instance
     * @param config The Kleros Escrow configuration
     * @param signer A signer for write operations
     */
    constructor(config, signer) {
        super(config, signer);
    }
    /**
     * Submits evidence for a dispute
     * @param params Parameters for submitting evidence
     * @returns The transaction response
     */
    async submitEvidence(params) {
        this.ensureCanWrite();
        const tx = await this.escrowContract.submitEvidence(params.transactionId, params.evidence);
        return tx;
    }
    /**
     * Estimates gas for submitting evidence
     * @param params Parameters for submitting evidence
     * @returns The estimated gas
     */
    async estimateGasForSubmitEvidence(params) {
        const gasEstimate = await this.escrowContract.estimateGas.submitEvidence(params.transactionId, params.evidence);
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
