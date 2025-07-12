import { ethers } from "ethers";
import { TokenTransaction, TokenTransactionStatus } from "../types/token";
import { KlerosEscrowConfig } from "../types/config";
import { BaseService } from "../base/BaseService";

/**
 * Service for reading token transaction data from the Kleros Escrow Token contract
 */
export class TokenTransactionService extends BaseService {
  private tokenContract: ethers.Contract;

  /**
   * Creates a new TokenTransactionService instance
   * @param config The Kleros Escrow configuration
   * @param provider Optional provider for read operations
   */
  constructor(
    config: KlerosEscrowConfig,
    provider?: ethers.providers.Provider
  ) {
    super(config, provider);
    
    if (!config.multipleArbitrableTransactionToken) {
      throw new Error("multipleArbitrableTransactionToken configuration is required");
    }

    this.tokenContract = new ethers.Contract(
      config.multipleArbitrableTransactionToken.address,
      config.multipleArbitrableTransactionToken.abi,
      provider || this.provider
    );
  }

  /**
   * Gets a token transaction by its ID
   * @param transactionId The ID of the transaction to fetch
   * @returns The token transaction data
   */
  getTokenTransaction = async (transactionId: string): Promise<TokenTransaction> => {
    const tx = await this.tokenContract.transactions(transactionId);

    return {
      id: transactionId,
      sender: tx.sender,
      receiver: tx.receiver,
      amount: tx.amount.toString(),
      token: tx.token, // ERC20 token contract address
      status: this.mapStatus(tx.status),
      timeoutPayment: tx.timeoutPayment.toNumber(),
      lastInteraction: tx.lastInteraction.toNumber(),
      createdAt: 0, // Not directly available from contract, would need to get from events
      disputeId:
        tx.disputeId.toNumber() > 0 ? tx.disputeId.toNumber() : undefined,
      senderFee: tx.senderFee.toString(),
      receiverFee: tx.receiverFee.toString(),
    };
  };

  /**
   * Gets all token transactions for a specific address
   * @param address The address to get transactions for
   * @returns Array of token transactions where the address is sender or receiver
   */
  getTransactionsByAddress = async (
    address: string
  ): Promise<TokenTransaction[]> => {
    const transactionIds =
      await this.tokenContract.getTransactionIDsByAddress(address);

    const transactions: TokenTransaction[] = [];
    for (const id of transactionIds) {
      const tx = await this.getTokenTransaction(id.toString());
      transactions.push(tx);
    }

    return transactions;
  };

  /**
   * Gets the total number of token transactions in the contract
   * @returns The count of transactions
   */
  getTransactionCount = async (): Promise<number> => {
    const count = await this.tokenContract.getCountTransactions();
    return count.toNumber();
  };

  /**
   * Checks if a token transaction can be executed (timeout has passed)
   * @param transactionId The ID of the transaction to check
   * @returns True if the transaction can be executed
   */
  canExecuteTransaction = async (transactionId: string): Promise<boolean> => {
    const tx = await this.getTokenTransaction(transactionId);
    const currentTime = Math.floor(Date.now() / 1000);

    return (
      tx.status === TokenTransactionStatus.NoDispute &&
      currentTime - tx.lastInteraction >= tx.timeoutPayment
    );
  };

  /**
   * Checks if a party can be timed out for not paying arbitration fees
   * @param transactionId The ID of the transaction to check
   * @returns Object indicating which party can be timed out, if any
   */
  canTimeOut = async (
    transactionId: string
  ): Promise<{
    canSenderTimeOut: boolean;
    canReceiverTimeOut: boolean;
  }> => {
    const tx = await this.getTokenTransaction(transactionId);
    const currentTime = Math.floor(Date.now() / 1000);
    const feeTimeout = await this.tokenContract.feeTimeout();

    return {
      canSenderTimeOut:
        tx.status === TokenTransactionStatus.WaitingReceiver &&
        currentTime - tx.lastInteraction >= feeTimeout,
      canReceiverTimeOut:
        tx.status === TokenTransactionStatus.WaitingSender &&
        currentTime - tx.lastInteraction >= feeTimeout,
    };
  };

  /**
   * Get basic ERC20 token information
   * @param tokenAddress The ERC20 token contract address
   * @returns Token information (name, symbol, decimals)
   */
  getTokenInfo = async (tokenAddress: string): Promise<{
    name: string;
    symbol: string;
    decimals: number;
  }> => {
    const tokenAbi = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
    ];

    const tokenContract = new ethers.Contract(
      tokenAddress,
      tokenAbi,
      this.provider
    );

    try {
      const [name, symbol, decimals] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
      ]);

      return {
        name,
        symbol,
        decimals,
      };
    } catch (error) {
      console.warn(`Could not get token info for ${tokenAddress}:`, error);
      return {
        name: "Unknown",
        symbol: "UNKNOWN",
        decimals: 18,
      };
    }
  };

  /**
   * Gets the fee timeout period from the token contract
   * @returns The fee timeout in seconds
   */
  getFeeTimeout = async (): Promise<number> => {
    const timeout = await this.tokenContract.feeTimeout();
    return timeout.toNumber();
  };

  /**
   * Gets the arbitrator address from the token contract
   * @returns The arbitrator contract address
   */
  getArbitratorAddress = async (): Promise<string> => {
    return await this.tokenContract.arbitrator();
  };

  /**
   * Gets the arbitrator extra data from the token contract
   * @returns The arbitrator extra data as bytes
   */
  getArbitratorExtraData = async (): Promise<string> => {
    return await this.tokenContract.arbitratorExtraData();
  };

  /**
   * Maps numeric status from contract to enum
   * @param status The numeric status from the contract
   * @returns The corresponding TokenTransactionStatus enum value
   */
  private mapStatus = (status: number): TokenTransactionStatus => {
    const statusMap: Record<number, TokenTransactionStatus> = {
      0: TokenTransactionStatus.NoDispute,
      1: TokenTransactionStatus.WaitingSender,
      2: TokenTransactionStatus.WaitingReceiver,
      3: TokenTransactionStatus.DisputeCreated,
      4: TokenTransactionStatus.Resolved,
    };

    return statusMap[status] || TokenTransactionStatus.NoDispute;
  };
} 