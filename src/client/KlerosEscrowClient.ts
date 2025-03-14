//read/listen imports
import { ethers } from "ethers";
import { KlerosEscrowConfig } from "../types/config";
import { TransactionService } from "../services/transaction";
import { DisputeService } from "../services/dispute";
import { ArbitratorService } from "../services/arbitrator";
import { EventService } from "../services/event";
import { IPFSService } from "../services/ipfs";

//actions imports
import { TransactionActions } from "../actions/transaction";
import { DisputeActions } from "../actions/dispute";
import { EvidenceActions } from "../actions/evidence";

// Import ABIs
import MultipleArbitrableTransactionABI from "../reference/MultipleArbitrableTransaction_ABI.json";
import KlerosLiquidABI from "../reference/KlerosLiquid/KlerosLiquid_ABI.json";

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
    // Ensure the config has the necessary ABIs
    this.ensureConfigHasABIs();

    // Initialize all services
    this.services = {
      transaction: new TransactionService(config),
      dispute: new DisputeService(config),
      arbitrator: new ArbitratorService(config),
      event: new EventService(config),
      ipfs: new IPFSService(config.ipfsGateway || "https://cdn.kleros.link"),
    };

    // Initialize actions if a signer is provided
    if (signer) {
      this.actions = {
        transaction: new TransactionActions(config, signer),
        dispute: new DisputeActions(config, signer),
        evidence: new EvidenceActions(config, signer),
      };
    }
  }

  /**
   * Ensures the configuration has the necessary ABIs
   * If ABIs are not provided, uses the default ones from the reference directory
   */
  private ensureConfigHasABIs(): void {
    // Ensure MultipleArbitrableTransaction ABI
    if (!this.config.multipleArbitrableTransaction.abi) {
      this.config.multipleArbitrableTransaction.abi =
        MultipleArbitrableTransactionABI;
    }

    // Ensure Arbitrator ABI if it exists in the config
    if (this.config.arbitrator && !this.config.arbitrator.abi) {
      this.config.arbitrator.abi = KlerosLiquidABI;
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
}
