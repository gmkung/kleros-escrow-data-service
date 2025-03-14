import { ethers } from 'ethers';
import { EvidenceSubmissionParams } from '../types/dispute';
import { KlerosEscrowConfig } from '../types/config';

/**
 * Service for evidence-related actions in the Kleros Escrow contract
 */
export class EvidenceActions {
  private provider: ethers.providers.Provider;
  private contract: ethers.Contract;

  /**
   * Creates a new EvidenceActions instance
   * @param config The Kleros Escrow configuration
   * @param signerOrProvider A signer or provider
   */
  constructor(
    config: KlerosEscrowConfig,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) {
    this.provider = signerOrProvider instanceof ethers.Signer 
      ? signerOrProvider.provider! 
      : signerOrProvider;
    
    this.contract = new ethers.Contract(
      config.multipleArbitrableTransaction.address,
      config.multipleArbitrableTransaction.abi,
      signerOrProvider
    );
  }

  /**
   * Submits evidence for a dispute
   * @param params Parameters for submitting evidence
   * @returns The transaction response
   */
  async submitEvidence(params: EvidenceSubmissionParams): Promise<ethers.providers.TransactionResponse> {
    const tx = await this.contract.submitEvidence(
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
    const gasEstimate = await this.contract.estimateGas.submitEvidence(
      params.transactionId,
      params.evidence
    );
    
    return gasEstimate;
  }

  /**
   * Uploads evidence to IPFS if an IPFS gateway is configured
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
    
    // This is a placeholder for actual IPFS upload logic
    // In a real implementation, you would use a library like ipfs-http-client
    
    // For now, we'll just return a mock URI
    return `ipfs://QmXyz.../${evidence.name}`;
  }
} 