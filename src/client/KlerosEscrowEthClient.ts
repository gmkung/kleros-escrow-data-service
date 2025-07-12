//read/listen imports
import { ethers } from "ethers";
import {
  EthTransactionService,
  DisputeService,
  ArbitratorService,
  IPFSService,
  EthEventService
} from "../services";
import { KlerosEscrowConfig } from "../types";
import { TransactionActions, DisputeActions, EvidenceActions } from "../actions";

// Import ABIs
import MultipleArbitrableTransactionABI from "../reference/MultipleArbitrableTransaction_ABI.json";
import KlerosLiquidABI from "../reference/KlerosLiquid/KlerosLiquid_ABI.json";

const DEFAULT_CONTRACT_ADDRESS = "0x0d67440946949FE293B45c52eFD8A9b3d51e2522";
const DEFAULT_IPFS_GATEWAY = "https://cdn.kleros.link";

/**
 * Client for interacting with Kleros Escrow ETH services
 */
export class KlerosEscrowEthClient {
  /**
   * Services for reading ETH transaction data
   */
  readonly services: {
    ethTransaction: EthTransactionService;
    dispute: DisputeService;
    arbitrator: ArbitratorService;
    ethEvent: EthEventService;
    ipfs: IPFSService;
  };

  /**
   * Actions for writing data (only available if a signer is provided)
   */
  readonly actions?: {
    transaction: TransactionActions;
    dispute: DisputeActions;
    evidence: EvidenceActions;
  };

  /**
   * Creates a new KlerosEscrowEthClient
   * @param config The Kleros Escrow configuration
   * @param signer Optional signer for write operations
   */
  constructor(
    private config: KlerosEscrowConfig,
    signer?: ethers.Signer
  ) {
    // Ensure the config has the necessary contract configuration
    if (!this.config.multipleArbitrableTransactionEth) {
      this.config.multipleArbitrableTransactionEth = {
        address: DEFAULT_CONTRACT_ADDRESS,
        abi: MultipleArbitrableTransactionABI,
      };
    } else {
      // Use defaults if not provided
      this.config.multipleArbitrableTransactionEth.address =
        this.config.multipleArbitrableTransactionEth.address ||
        DEFAULT_CONTRACT_ADDRESS;
      this.config.multipleArbitrableTransactionEth.abi =
        this.config.multipleArbitrableTransactionEth.abi ||
        MultipleArbitrableTransactionABI;
    }

    // Ensure arbitrator configuration if it exists
    if (this.config.arbitrator && !this.config.arbitrator.abi) {
      this.config.arbitrator.abi = KlerosLiquidABI;
    }

    // Initialize all services
    this.services = {
      ethTransaction: new EthTransactionService(this.config),
      dispute: new DisputeService(this.config),
      arbitrator: new ArbitratorService(this.config),
      ethEvent: new EthEventService(),
      ipfs: new IPFSService(this.config.ipfsGateway || DEFAULT_IPFS_GATEWAY),
    };

    // Initialize actions if a signer is provided
    if (signer) {
      this.actions = {
        transaction: new TransactionActions(this.config, signer),
        dispute: new DisputeActions(this.config, signer),
        evidence: new EvidenceActions(this.config, signer),
      };
    }
  }

  /**
   * Gets the configuration used by this client
   * @returns The Kleros Escrow configuration
   */
  getConfig(): KlerosEscrowConfig {
    return this.config;
  }

  /**
   * Checks if this client has write capabilities
   * @returns True if the client can perform write operations
   */
  canWrite(): boolean {
    return !!this.actions;
  }

  /**
   * Convenience method to get an ETH transaction by ID
   * @param transactionId The ID of the transaction to fetch
   * @returns The ETH transaction data
   */
  async getEthTransaction(transactionId: string) {
    return this.services.ethTransaction.getEthTransaction(transactionId);
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
   * Get all ETH transaction details from subgraph
   * @param transactionId The transaction ID
   * @returns Combined ETH transaction details with events
   */
  async getEthTransactionDetails(transactionId: string) {
    return this.services.ethEvent.getEthTransactionDetails(transactionId);
  }

  /**
   * Get all ETH meta evidence from subgraph
   * @returns Array of all ETH meta evidence
   */
  async getAllEthMetaEvidence() {
    return this.services.ethEvent.getAllEthMetaEvidence();
  }

  /**
   * Get ETH transactions by address
   * @param address The address to get transactions for
   * @returns Array of ETH transactions for the address
   */
  async getEthTransactionsByAddress(address: string) {
    return this.services.ethTransaction.getEthTransactionsByAddress(address);
  }
} 