import { ethers } from "ethers";
import { CreateTransactionParams, PaymentParams } from "../types/transaction";
import { KlerosEscrowConfig } from "../types/config";

/**
 * Service for writing transaction data to the Kleros Escrow contract
 */
export class TransactionActions {
  private provider: ethers.providers.Provider;
  private contract: ethers.Contract;

  /**
   * Creates a new TransactionActions instance
   * @param config The Kleros Escrow configuration
   * @param signerOrProvider A signer or provider
   */
  constructor(
    config: KlerosEscrowConfig,
    signerOrProvider: ethers.Signer | ethers.providers.Provider
  ) {
    this.provider =
      signerOrProvider instanceof ethers.Signer
        ? signerOrProvider.provider!
        : signerOrProvider;

    this.contract = new ethers.Contract(
      config.multipleArbitrableTransaction.address,
      config.multipleArbitrableTransaction.abi,
      signerOrProvider
    );
  }

  /**
   * Creates a new escrow transaction
   * @param params Parameters for creating the transaction
   * @returns The transaction response and the transaction ID
   */
  async createTransaction(params: CreateTransactionParams): Promise<{
    transactionResponse: ethers.providers.TransactionResponse;
    transactionId: string;
  }> {
    const tx = await this.contract.createTransaction(
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
  async pay(
    params: PaymentParams
  ): Promise<ethers.providers.TransactionResponse> {
    const tx = await this.contract.pay(
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
  async reimburse(
    params: PaymentParams
  ): Promise<ethers.providers.TransactionResponse> {
    const tx = await this.contract.reimburse(
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
  async executeTransaction(
    transactionId: string
  ): Promise<ethers.providers.TransactionResponse> {
    const tx = await this.contract.executeTransaction(transactionId);
    return tx;
  }

  /**
   * Times out the receiver for not paying arbitration fees
   * @param transactionId The ID of the transaction
   * @returns The transaction response
   */
  async timeOutBySender(
    transactionId: string
  ): Promise<ethers.providers.TransactionResponse> {
    const tx = await this.contract.timeOutBySender(transactionId);
    return tx;
  }

  /**
   * Times out the sender for not paying arbitration fees
   * @param transactionId The ID of the transaction
   * @returns The transaction response
   */
  async timeOutByReceiver(
    transactionId: string
  ): Promise<ethers.providers.TransactionResponse> {
    const tx = await this.contract.timeOutByReceiver(transactionId);
    return tx;
  }

  /**
   * Estimates gas for creating a transaction
   * @param params Parameters for creating the transaction
   * @returns The estimated gas
   */
  async estimateGasForCreateTransaction(
    params: CreateTransactionParams
  ): Promise<ethers.BigNumber> {
    const gasEstimate = await this.contract.estimateGas.createTransaction(
      params.timeoutPayment,
      params.receiver,
      params.metaEvidence,
      { value: ethers.utils.parseEther(params.value) }
    );

    return gasEstimate;
  }
}
