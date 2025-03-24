import { ethers } from "ethers";
import { DisputeParams, AppealParams } from "../types/dispute";
import { KlerosEscrowConfig } from "../types/config";
import { BaseService } from "../base/BaseService";

/**
 * Service for dispute-related actions in the Kleros Escrow contract
 */
export class DisputeActions extends BaseService {
  /**
   * Creates a new DisputeActions instance
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
   * Pays arbitration fee by sender
   * @param params Parameters for paying arbitration fee
   * @param params.value Amount in Wei
   * @returns The transaction response
   */
  payArbitrationFeeBySender = async (
    params: DisputeParams
  ): Promise<ethers.providers.TransactionResponse> => {
    this.ensureCanWrite();
    
    const tx = await this.escrowContract.payArbitrationFeeBySender(
      params.transactionId,
      { value: params.value } // Already in Wei
    );
    
    return tx;
  }

  /**
   * Pays arbitration fee by receiver
   * @param params Parameters for paying arbitration fee
   * @param params.value Amount in Wei
   * @returns The transaction response
   */
  payArbitrationFeeByReceiver = async (
    params: DisputeParams
  ): Promise<ethers.providers.TransactionResponse> => {
    this.ensureCanWrite();
    
    const tx = await this.escrowContract.payArbitrationFeeByReceiver(
      params.transactionId,
      { value: params.value } // Already in Wei
    );
    
    return tx;
  }

  /**
   * Appeals a ruling
   * @param params Parameters for appealing
   * @param params.value Appeal fee in Wei
   * @returns The transaction response
   */
  appeal = async (
    params: AppealParams
  ): Promise<ethers.providers.TransactionResponse> => {
    this.ensureCanWrite();
    
    const tx = await this.escrowContract.appeal(
      params.transactionId,
      { value: params.value } // Already in Wei
    );
    
    return tx;
  }

  /**
   * Estimates gas for paying arbitration fee as sender
   * @param params Parameters for paying the arbitration fee
   * @returns The estimated gas
   */
  async estimateGasForPayArbitrationFeeBySender(
    params: DisputeParams
  ): Promise<ethers.BigNumber> {
    const gasEstimate =
      await this.escrowContract.estimateGas.payArbitrationFeeBySender(
        params.transactionId,
        { value: params.value }
      );

    return gasEstimate;
  }

  /**
   * Estimates gas for paying arbitration fee as receiver
   * @param params Parameters for paying the arbitration fee
   * @returns The estimated gas
   */
  async estimateGasForPayArbitrationFeeByReceiver(
    params: DisputeParams
  ): Promise<ethers.BigNumber> {
    const gasEstimate =
      await this.escrowContract.estimateGas.payArbitrationFeeByReceiver(
        params.transactionId,
        { value: params.value }
      );

    return gasEstimate;
  }

  /**
   * Estimates gas for appealing a ruling
   * @param params Parameters for appealing
   * @returns The estimated gas
   */
  async estimateGasForAppeal(params: AppealParams): Promise<ethers.BigNumber> {
    const gasEstimate = await this.escrowContract.estimateGas.appeal(
      params.transactionId,
      { value: params.value }
    );

    return gasEstimate;
  }
}
