import { ethers } from "ethers";
import {
  TokenTransactionService,
  TokenEventService,
  DisputeService,
  ArbitratorService,
  IPFSService,
} from "../services";
import { KlerosEscrowConfig } from "../types";
import { TokenTransaction } from "../types/token";

// Import ABIs
import MultipleArbitrableTransactionTokenABI from "../reference/MultipleArbitrableTransactionToken_ABI.json";
import KlerosLiquidABI from "../reference/KlerosLiquid/KlerosLiquid_ABI.json";

const DEFAULT_IPFS_GATEWAY = "https://cdn.kleros.link";

/**
 * Client for interacting with Kleros Escrow Token services
 */
export class KlerosEscrowTokenClient {
  /**
   * Services for reading token transaction data
   */
  readonly services: {
    tokenTransaction: TokenTransactionService;
    tokenEvent: TokenEventService;
    dispute: DisputeService;
    arbitrator: ArbitratorService;
    ipfs: IPFSService;
  };

  /**
   * Creates a new KlerosEscrowTokenClient
   * @param config The Kleros Escrow configuration
   * @param signer Optional signer for write operations
   */
  constructor(
    private config: KlerosEscrowConfig,
    signer?: ethers.Signer
  ) {
    // Ensure the config has the necessary token contract configuration
    if (!this.config.multipleArbitrableTransactionToken) {
      throw new Error(
        "multipleArbitrableTransactionToken configuration is required for token client"
      );
    }

    // Use provided ABI or default
    this.config.multipleArbitrableTransactionToken.abi =
      this.config.multipleArbitrableTransactionToken.abi ||
      MultipleArbitrableTransactionTokenABI;

    // Ensure arbitrator configuration if it exists
    if (this.config.arbitrator && !this.config.arbitrator.abi) {
      this.config.arbitrator.abi = KlerosLiquidABI;
    }

    // Initialize all services
    this.services = {
      tokenTransaction: new TokenTransactionService(this.config),
      tokenEvent: new TokenEventService(),
      dispute: new DisputeService(this.config),
      arbitrator: new ArbitratorService(this.config),
      ipfs: new IPFSService(this.config.ipfsGateway || DEFAULT_IPFS_GATEWAY),
    };
  }

  /**
   * Gets the configuration used by this client
   * @returns The Kleros Escrow configuration
   */
  getConfig(): KlerosEscrowConfig {
    return this.config;
  }

  /**
   * Convenience method to get a token transaction by ID
   * @param transactionId The ID of the transaction to fetch
   * @returns The token transaction data
   */
  async getTokenTransaction(transactionId: string): Promise<TokenTransaction> {
    return this.services.tokenTransaction.getTokenTransaction(transactionId);
  }

  /**
   * Convenience method to get token transactions by address
   * @param address The address to get transactions for
   * @returns Array of token transactions
   */
  async getTransactionsByAddress(address: string): Promise<TokenTransaction[]> {
    return this.services.tokenTransaction.getTransactionsByAddress(address);
  }

  /**
   * Convenience method to get token information
   * @param tokenAddress The token contract address
   * @returns Token information (name, symbol, decimals)
   */
  async getTokenInfo(tokenAddress: string) {
    return this.services.tokenTransaction.getTokenInfo(tokenAddress);
  }

  /**
   * Convenience method to get a dispute by transaction ID
   * @param transactionId The ID of the transaction
   * @returns The dispute data if it exists
   */
  async getDispute(transactionId: string) {
    return this.services.dispute.getDispute(transactionId);
  }

  /**
   * Convenience method to get the arbitrator information
   * @returns The arbitrator information
   */
  async getArbitrator() {
    return this.services.arbitrator.getArbitrator();
  }

  /**
   * Convenience method to fetch data from IPFS
   * @param path The IPFS path or CID
   * @returns The data from IPFS
   */
  async fetchFromIPFS(path: string) {
    return this.services.ipfs.fetchFromIPFS(path);
  }

  /**
   * Get all token transaction details from subgraph
   * @param transactionId The transaction ID
   * @returns Combined transaction details with events
   */
  async getTokenTransactionDetails(transactionId: string) {
    return this.services.tokenEvent.getTokenTransactionDetails(transactionId);
  }

  /**
   * Get all token transactions from subgraph
   * @returns Array of all token transactions
   */
  async getAllTokenTransactions() {
    return this.services.tokenEvent.getAllTokenTransactions();
  }

  /**
   * Get token transactions by address from subgraph
   * @param address The address to filter by
   * @returns Array of token transactions involving the address
   */
  async getTokenTransactionsByAddress(address: string) {
    return this.services.tokenEvent.getTokenTransactionsByAddress(address);
  }

  /**
   * Get transactions by token contract address from subgraph
   * @param tokenAddress The token contract address
   * @returns Array of transactions for the specific token
   */
  async getTransactionsByToken(tokenAddress: string) {
    return this.services.tokenEvent.getTransactionsByToken(tokenAddress);
  }

  /**
   * Get enhanced token transaction data combining contract and subgraph data
   * @param transactionId The transaction ID
   * @returns Enhanced token transaction data with token info and events
   */
  async getEnhancedTokenTransaction(transactionId: string) {
    const [contractData, subgraphData] = await Promise.all([
      this.getTokenTransaction(transactionId),
      this.getTokenTransactionDetails(transactionId),
    ]);

    // Get token info if available
    let tokenInfo = undefined;
    if (contractData.token) {
      try {
        tokenInfo = await this.getTokenInfo(contractData.token);
      } catch (error) {
        console.warn(`Could not get token info for ${contractData.token}:`, error);
      }
    }

    return {
      ...contractData,
      tokenInfo,
      events: subgraphData,
    };
  }
} 