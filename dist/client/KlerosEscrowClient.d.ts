import { ethers } from "ethers";
import { KlerosEscrowConfig } from "../types/config";
import { TransactionService } from "../services/transaction";
import { DisputeService } from "../services/dispute";
import { ArbitratorService } from "../services/arbitrator";
import { EventService } from "../services/event";
import { IPFSService } from "../services/ipfs";
import { TransactionActions } from "../actions/transaction";
import { DisputeActions } from "../actions/dispute";
import { EvidenceActions } from "../actions/evidence";
/**
 * Client for interacting with Kleros Escrow services
 */
export declare class KlerosEscrowClient {
    private config;
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
    constructor(config: KlerosEscrowConfig, signer?: ethers.Signer);
    /**
     * Ensures the configuration has the necessary ABIs
     * If ABIs are not provided, uses the default ones from the reference directory
     */
    private ensureConfigHasABIs;
    /**
     * Gets the configuration used by this client
     * @returns The Kleros Escrow configuration
     */
    getConfig(): KlerosEscrowConfig;
    /**
     * Checks if this client has write capabilities
     * @returns True if the client can perform write operations
     */
    canWrite(): boolean;
    /**
     * Convenience method to get a transaction by ID
     * @param transactionId The ID of the transaction to fetch
     * @returns The transaction data
     */
    getTransaction(transactionId: string): Promise<import("..").Transaction>;
    /**
     * Convenience method to get a dispute by transaction ID
     * @param transactionId The ID of the transaction
     * @returns The dispute data if it exists
     */
    getDispute(transactionId: string): Promise<import("..").Dispute | null>;
    /**
     * Convenience method to get the arbitrator information
     * @returns The arbitrator information
     */
    getArbitrator(): Promise<import("..").Arbitrator>;
    /**
     * Convenience method to fetch data from IPFS
     * @param path The IPFS path or CID
     * @returns The data from IPFS
     */
    fetchFromIPFS(path: string): Promise<any>;
}
