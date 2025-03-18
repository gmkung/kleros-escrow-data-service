//read/listen imports
import { ethers } from "ethers";
import {
  TransactionService,
  DisputeService,
  ArbitratorService,
  IPFSService,
  EventService
} from "../services";
import { KlerosEscrowConfig } from "../types";
import { TransactionActions, DisputeActions, EvidenceActions } from "../actions";

// Import ABIs
import MultipleArbitrableTransactionABI from "../reference/MultipleArbitrableTransaction_ABI.json";
import KlerosLiquidABI from "../reference/KlerosLiquid/KlerosLiquid_ABI.json";

const DEFAULT_CONTRACT_ADDRESS = "0x0d67440946949FE293B45c52eFD8A9b3d51e2522";
const DEFAULT_IPFS_GATEWAY = "https://cdn.kleros.link";

/**
 * Client for interacting with Kleros Escrow services
 */
export class KlerosEscrowClient {
  /**
   * Services for reading data
   */
  readonly services: {
    transaction: TransactionService;
    dispute: DisputeService;
    arbitrator: ArbitratorService;
    event: EventService;
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
   * Creates a new KlerosEscrowClient
   * @param config The Kleros Escrow configuration
   * @param signer Optional signer for write operations
   */
  constructor(
    private config: KlerosEscrowConfig,
    signer?: ethers.Signer
  ) {
    // Ensure the config has the necessary contract configuration
    if (!this.config.multipleArbitrableTransaction) {
      this.config.multipleArbitrableTransaction = {
        address: DEFAULT_CONTRACT_ADDRESS,
        abi: MultipleArbitrableTransactionABI,
      };
    } else {
      // Use defaults if not provided
      this.config.multipleArbitrableTransaction.address =
        this.config.multipleArbitrableTransaction.address ||
        DEFAULT_CONTRACT_ADDRESS;
      this.config.multipleArbitrableTransaction.abi =
        this.config.multipleArbitrableTransaction.abi ||
        MultipleArbitrableTransactionABI;
    }

    // Ensure arbitrator configuration if it exists
    if (this.config.arbitrator && !this.config.arbitrator.abi) {
      this.config.arbitrator.abi = KlerosLiquidABI;
    }

    // Initialize all services
    this.services = {
      transaction: new TransactionService(this.config),
      dispute: new DisputeService(this.config),
      arbitrator: new ArbitratorService(this.config),
      event: new EventService(),
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
   * Convenience method to get a transaction by ID
   * @param transactionId The ID of the transaction to fetch
   * @returns The transaction data
   */
  async getTransaction(transactionId: string) {
    return this.services.transaction.getTransaction(transactionId);
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

  // Get all transaction details from subgraph
  public async getTransactionDetails(transactionId: string) {
    return this.services.event.getTransactionDetails(transactionId);
  }
}
