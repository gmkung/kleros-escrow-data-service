import { ethers } from 'ethers';
import { ArbitrationFeePaymentParams, AppealParams } from '../types/dispute';
import { KlerosEscrowConfig } from '../types/config';

/**
 * Service for dispute-related actions in the Kleros Escrow contract
 */
export class DisputeActions {
  private provider: ethers.providers.Provider;
  private contract: ethers.Contract;

  /**
   * Creates a new DisputeActions instance
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
   * Pays arbitration fee as the sender to raise a dispute
   * @param params Parameters for paying the arbitration fee
   * @returns The transaction response
   */
  async payArbitrationFeeBySender(params: ArbitrationFeePaymentParams): Promise<ethers.providers.TransactionResponse> {
    const tx = await this.contract.payArbitrationFeeBySender(
      params.transactionId,
      { value: ethers.utils.parseEther(params.value) }
    );
    
    return tx;
  }

  /**
   * Pays arbitration fee as the receiver to raise a dispute
   * @param params Parameters for paying the arbitration fee
   * @returns The transaction response
   */
  async payArbitrationFeeByReceiver(params: ArbitrationFeePaymentParams): Promise<ethers.providers.TransactionResponse> {
    const tx = await this.contract.payArbitrationFeeByReceiver(
      params.transactionId,
      { value: ethers.utils.parseEther(params.value) }
    );
    
    return tx;
  }

  /**
   * Appeals a ruling
   * @param params Parameters for appealing
   * @returns The transaction response
   */
  async appeal(params: AppealParams): Promise<ethers.providers.TransactionResponse> {
    const tx = await this.contract.appeal(
      params.transactionId,
      { value: ethers.utils.parseEther(params.value) }
    );
    
    return tx;
  }

  /**
   * Estimates gas for paying arbitration fee as sender
   * @param params Parameters for paying the arbitration fee
   * @returns The estimated gas
   */
  async estimateGasForPayArbitrationFeeBySender(params: ArbitrationFeePaymentParams): Promise<ethers.BigNumber> {
    const gasEstimate = await this.contract.estimateGas.payArbitrationFeeBySender(
      params.transactionId,
      { value: ethers.utils.parseEther(params.value) }
    );
    
    return gasEstimate;
  }

  /**
   * Estimates gas for paying arbitration fee as receiver
   * @param params Parameters for paying the arbitration fee
   * @returns The estimated gas
   */
  async estimateGasForPayArbitrationFeeByReceiver(params: ArbitrationFeePaymentParams): Promise<ethers.BigNumber> {
    const gasEstimate = await this.contract.estimateGas.payArbitrationFeeByReceiver(
      params.transactionId,
      { value: ethers.utils.parseEther(params.value) }
    );
    
    return gasEstimate;
  }

  /**
   * Estimates gas for appealing a ruling
   * @param params Parameters for appealing
   * @returns The estimated gas
   */
  async estimateGasForAppeal(params: AppealParams): Promise<ethers.BigNumber> {
    const gasEstimate = await this.contract.estimateGas.appeal(
      params.transactionId,
      { value: ethers.utils.parseEther(params.value) }
    );
    
    return gasEstimate;
  }
} 