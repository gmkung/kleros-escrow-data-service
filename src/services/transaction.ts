import { ethers } from 'ethers';
import { Transaction, TransactionStatus } from '../types/transaction';
import { KlerosEscrowConfig } from '../types/config';

/**
 * Service for reading transaction data from the Kleros Escrow contract
 */
export class TransactionService {
  private provider: ethers.providers.Provider;
  private contract: ethers.Contract;

  /**
   * Creates a new TransactionService instance
   * @param config The Kleros Escrow configuration
   */
  constructor(config: KlerosEscrowConfig) {
    this.provider = new ethers.providers.JsonRpcProvider(
      config.provider.url,
      config.provider.networkId
    );
    
    this.contract = new ethers.Contract(
      config.multipleArbitrableTransaction.address,
      config.multipleArbitrableTransaction.abi,
      this.provider
    );
  }

  /**
   * Gets a transaction by its ID
   * @param transactionId The ID of the transaction to fetch
   * @returns The transaction data
   */
  async getTransaction(transactionId: string): Promise<Transaction> {
    const tx = await this.contract.transactions(transactionId);
    
    return {
      id: transactionId,
      sender: tx.sender,
      receiver: tx.receiver,
      amount: tx.amount.toString(),
      status: this.mapStatus(tx.status),
      timeoutPayment: tx.timeoutPayment.toNumber(),
      lastInteraction: tx.lastInteraction.toNumber(),
      createdAt: 0, // Not directly available from contract, would need to get from events
      disputeId: tx.disputeId.toNumber() > 0 ? tx.disputeId.toNumber() : undefined,
      senderFee: tx.senderFee.toString(),
      receiverFee: tx.receiverFee.toString()
    };
  }

  /**
   * Gets all transactions for a specific address
   * @param address The address to get transactions for
   * @returns Array of transactions where the address is sender or receiver
   */
  async getTransactionsByAddress(address: string): Promise<Transaction[]> {
    const transactionIds = await this.contract.getTransactionIDsByAddress(address);
    
    const transactions: Transaction[] = [];
    for (const id of transactionIds) {
      const tx = await this.getTransaction(id.toString());
      transactions.push(tx);
    }
    
    return transactions;
  }

  /**
   * Gets the total number of transactions in the contract
   * @returns The count of transactions
   */
  async getTransactionCount(): Promise<number> {
    const count = await this.contract.getCountTransactions();
    return count.toNumber();
  }

  /**
   * Gets the amount paid by a party in a transaction
   * @param transactionId The ID of the transaction
   * @param party The address of the party
   * @returns The amount paid in wei as a string
   */
  async getAmountPaid(transactionId: string, party: string): Promise<string> {
    const amount = await this.contract.amountPaid(transactionId, party);
    return amount.toString();
  }

  /**
   * Checks if a transaction can be executed (timeout has passed)
   * @param transactionId The ID of the transaction to check
   * @returns True if the transaction can be executed
   */
  async canExecuteTransaction(transactionId: string): Promise<boolean> {
    const tx = await this.getTransaction(transactionId);
    const currentTime = Math.floor(Date.now() / 1000);
    
    return (
      tx.status === TransactionStatus.NoDispute &&
      currentTime - tx.lastInteraction >= tx.timeoutPayment
    );
  }

  /**
   * Checks if a party can be timed out for not paying arbitration fees
   * @param transactionId The ID of the transaction to check
   * @returns Object indicating which party can be timed out, if any
   */
  async canTimeOut(transactionId: string): Promise<{
    canSenderTimeOut: boolean;
    canReceiverTimeOut: boolean;
  }> {
    const tx = await this.getTransaction(transactionId);
    const currentTime = Math.floor(Date.now() / 1000);
    const feeTimeout = await this.contract.feeTimeout();
    
    return {
      canSenderTimeOut: 
        tx.status === TransactionStatus.WaitingReceiver &&
        currentTime - tx.lastInteraction >= feeTimeout,
      canReceiverTimeOut:
        tx.status === TransactionStatus.WaitingSender &&
        currentTime - tx.lastInteraction >= feeTimeout
    };
  }

  /**
   * Maps numeric status from contract to enum
   * @param status The numeric status from the contract
   * @returns The corresponding TransactionStatus enum value
   */
  private mapStatus(status: number): TransactionStatus {
    const statusMap: Record<number, TransactionStatus> = {
      0: TransactionStatus.NoDispute,
      1: TransactionStatus.WaitingSender,
      2: TransactionStatus.WaitingReceiver,
      3: TransactionStatus.DisputeCreated,
      4: TransactionStatus.Resolved
    };
    
    return statusMap[status] || TransactionStatus.NoDispute;
  }
} 