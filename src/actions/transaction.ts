import { ethers } from "ethers";
import { CreateTransactionParams, PaymentParams } from "../types/transaction";
import { KlerosEscrowConfig } from "../types/config";
import { BaseService } from "../base/BaseService";

/**
 * Service for writing transaction data to the Kleros Escrow contract
 */
export class TransactionActions extends BaseService {
  /**
   * Creates a new TransactionActions instance
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
   * Creates a new escrow transaction
   * @param params Parameters for creating the transaction
   * @returns The transaction response and the transaction ID
   */
  createTransaction = async (params: CreateTransactionParams): Promise<{
    transactionResponse: ethers.providers.TransactionResponse;
    transactionId: string;
  }> => {
    this.ensureCanWrite();
    
    const tx = await this.escrowContract.createTransaction(
      params.timeoutPayment,
      params.receiver,
      params.metaEvidence,
      { value: ethers.utils.parseEther(params.value) }
    );

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    // Find the transaction ID from the event logs
    const event = receipt.events?.find((e: ethers.Event) => e.event === "MetaEvidence");
    const transactionId = event?.args?._metaEvidenceID.toString();

    return {
      transactionResponse: tx,
      transactionId,
    };
  }

  /**
   * Pays the receiver (releases funds from escrow)
   * @param params Parameters for the payment
   * @returns The transaction response
   */
  pay = async (
    params: PaymentParams
  ): Promise<ethers.providers.TransactionResponse> => {
    this.ensureCanWrite();
    
    const tx = await this.escrowContract.pay(
      params.transactionId,
      ethers.utils.parseEther(params.amount)
    );
    
    return tx;
  }

  /**
   * Reimburses the sender (returns funds from escrow)
   * @param params Parameters for the reimbursement
   * @returns The transaction response
   */
  reimburse = async (
    params: PaymentParams
  ): Promise<ethers.providers.TransactionResponse> => {
    this.ensureCanWrite();
    
    const tx = await this.escrowContract.reimburse(
      params.transactionId,
      ethers.utils.parseEther(params.amount)
    );
    
    return tx;
  }

  /**
   * Executes a transaction after the timeout period
   * @param transactionId The ID of the transaction to execute
   * @returns The transaction response
   */
  executeTransaction = async (
    transactionId: string
  ): Promise<ethers.providers.TransactionResponse> => {
    this.ensureCanWrite();
    
    const tx = await this.escrowContract.executeTransaction(transactionId);
    return tx;
  }

  /**
   * Times out the receiver for not paying arbitration fees
   * @param transactionId The ID of the transaction
   * @returns The transaction response
   */
  timeOutBySender = async (
    transactionId: string
  ): Promise<ethers.providers.TransactionResponse> => {
    this.ensureCanWrite();
    
    const tx = await this.escrowContract.timeOutBySender(transactionId);
    return tx;
  }

  /**
   * Times out the sender for not paying arbitration fees
   * @param transactionId The ID of the transaction
   * @returns The transaction response
   */
  timeOutByReceiver = async (
    transactionId: string
  ): Promise<ethers.providers.TransactionResponse> => {
    this.ensureCanWrite();
    
    const tx = await this.escrowContract.timeOutByReceiver(transactionId);
    return tx;
  }

  /**
   * Estimates gas for creating a transaction
   * @param params Parameters for creating the transaction
   * @returns The estimated gas
   */
  estimateGasForCreateTransaction = async (
    params: CreateTransactionParams
  ): Promise<ethers.BigNumber> => {
    const gasEstimate = await this.escrowContract.estimateGas.createTransaction(
      params.timeoutPayment,
      params.receiver,
      params.metaEvidence,
      { value: ethers.utils.parseEther(params.value) }
    );

    return gasEstimate;
  }
}
