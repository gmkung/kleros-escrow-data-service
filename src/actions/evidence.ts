import { ethers } from 'ethers';
import { EvidenceSubmissionParams } from '../types/dispute';
import { KlerosEscrowConfig } from '../types/config';
import { IPFSService } from '../services/ipfs';
import { BaseService } from '../base/BaseService';

/**
 * Service for evidence-related actions in the Kleros Escrow contract
 */
export class EvidenceActions extends BaseService {
  /**
   * Creates a new EvidenceActions instance
   * @param config The Kleros Escrow configuration
   * @param signer A signer for write operations
   */
  constructor(
    config: KlerosEscrowConfig,
    signer: ethers.Signer
  ) {
    super(config, signer);
  }

  /**
   * Submits evidence for a dispute
   * @param params Parameters for submitting evidence
   * @returns The transaction response
   */
  async submitEvidence(params: EvidenceSubmissionParams): Promise<ethers.providers.TransactionResponse> {
    this.ensureCanWrite();
    
    const tx = await this.escrowContract.submitEvidence(
      params.transactionId,
      params.evidence
    );
    
    return tx;
  }

  /**
   * Estimates gas for submitting evidence
   * @param params Parameters for submitting evidence
   * @returns The estimated gas
   */
  async estimateGasForSubmitEvidence(params: EvidenceSubmissionParams): Promise<ethers.BigNumber> {
    const gasEstimate = await this.escrowContract.estimateGas.submitEvidence(
      params.transactionId,
      params.evidence
    );
    
    return gasEstimate;
  }

  /**
   * Uploads evidence to IPFS
   * @param config The Kleros Escrow configuration
   * @param evidence The evidence data to upload
   * @returns The IPFS URI of the uploaded evidence
   */
  static async uploadEvidenceToIPFS(
    config: KlerosEscrowConfig,
    evidence: {
      name: string;
      description: string;
      fileURI?: string;
      fileTypeExtension?: string;
    }
  ): Promise<string> {
    if (!config.ipfsGateway) {
      throw new Error("IPFS gateway not configured");
    }
    
    const ipfsService = new IPFSService(config.ipfsGateway);
    return ipfsService.uploadEvidence(evidence);
  }
} 