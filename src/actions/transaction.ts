import { ethers } from "ethers";
import { CreateTransactionParams, PaymentParams, CreateEthTransactionParams } from "../types/transaction";
import { CreateTokenTransactionParams } from "../types/token";
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
    
    let tx: ethers.providers.TransactionResponse;
    
    // Check if this is a token transaction by looking for tokenAddress parameter
    if ('tokenAddress' in params) {
      // Token transaction
      tx = await this.escrowContract.createTransaction(
        params.amount,
        params.tokenAddress,
        params.timeoutPayment,
        params.receiver,
        params.metaEvidence
      );
    } else {
      // ETH transaction
      tx = await this.escrowContract.createTransaction(
        params.timeoutPayment,
        params.receiver,
        params.metaEvidence,
        { value: params.value } // Already in Wei
      );
    }

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    // Find the transaction ID from the event logs
    const events = (receipt as any).events;
    const event = events?.find((e: any) => e.event === "MetaEvidence");
    const transactionId = event?.args?._metaEvidenceID?.toString() || "0";

    return {
      transactionResponse: tx,
      transactionId,
    };
  }

  /**
   * Pays the receiver (releases funds from escrow)
   * @param params Parameters for the payment
   * @param params.amount Amount in Wei
   * @returns The transaction response
   */
  pay = async (
    params: PaymentParams
  ): Promise<ethers.providers.TransactionResponse> => {
    this.ensureCanWrite();
    
    const tx = await this.escrowContract.pay(
      params.transactionId,
      params.amount // Already in Wei
    );
    
    return tx;
  }

  /**
   * Reimburses the sender (returns funds from escrow)
   * @param params Parameters for the reimbursement
   * @param params.amount Amount in Wei
   * @returns The transaction response
   */
  reimburse = async (
    params: PaymentParams
  ): Promise<ethers.providers.TransactionResponse> => {
    this.ensureCanWrite();
    
    const tx = await this.escrowContract.reimburse(
      params.transactionId,
      params.amount // Already in Wei
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
    // Check if this is a token transaction by looking for tokenAddress parameter
    if ('tokenAddress' in params) {
      // Token transaction
      return await this.escrowContract.estimateGas.createTransaction(
        params.amount,
        params.tokenAddress,
        params.timeoutPayment,
        params.receiver,
        params.metaEvidence
      );
    } else {
      // ETH transaction
      return await this.escrowContract.estimateGas.createTransaction(
        params.timeoutPayment,
        params.receiver,
        params.metaEvidence,
        { value: params.value }
      );
    }
  }
}
