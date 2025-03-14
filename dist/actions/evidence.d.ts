import { ethers } from 'ethers';
import { EvidenceSubmissionParams } from '../types/dispute';
import { KlerosEscrowConfig } from '../types/config';
import { BaseService } from '../base/BaseService';
/**
 * Service for evidence-related actions in the Kleros Escrow contract
 */
export declare class EvidenceActions extends BaseService {
    /**
     * Creates a new EvidenceActions instance
     * @param config The Kleros Escrow configuration
     * @param signer A signer for write operations
     */
    constructor(config: KlerosEscrowConfig, signer: ethers.Signer);
    /**
     * Submits evidence for a dispute
     * @param params Parameters for submitting evidence
     * @returns The transaction response
     */
    submitEvidence(params: EvidenceSubmissionParams): Promise<ethers.providers.TransactionResponse>;
    /**
     * Estimates gas for submitting evidence
     * @param params Parameters for submitting evidence
     * @returns The estimated gas
     */
    estimateGasForSubmitEvidence(params: EvidenceSubmissionParams): Promise<ethers.BigNumber>;
    /**
     * Uploads evidence to IPFS
     * @param config The Kleros Escrow configuration
     * @param evidence The evidence data to upload
     * @returns The IPFS URI of the uploaded evidence
     */
    static uploadEvidenceToIPFS(config: KlerosEscrowConfig, evidence: {
        name: string;
        description: string;
        fileURI?: string;
        fileTypeExtension?: string;
    }): Promise<string>;
}
