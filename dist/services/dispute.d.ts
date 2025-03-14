import { Dispute } from '../types/dispute';
import { KlerosEscrowConfig } from '../types/config';
/**
 * Service for reading dispute data from the Kleros Escrow contract
 */
export declare class DisputeService {
    private provider;
    private escrowContract;
    private arbitratorContract;
    /**
     * Creates a new DisputeService instance
     * @param config The Kleros Escrow configuration
     */
    constructor(config: KlerosEscrowConfig);
    /**
     * Gets dispute information for a transaction
     * @param transactionId The ID of the transaction
     * @returns The dispute data if it exists
     */
    getDispute(transactionId: string): Promise<Dispute | null>;
    /**
     * Gets the arbitration cost for creating a dispute
     * @returns The arbitration cost in wei as a string
     */
    getArbitrationCost(): Promise<string>;
    /**
     * Gets the appeal cost for a dispute
     * @param disputeId The ID of the dispute
     * @returns The appeal cost in wei as a string
     */
    getAppealCost(disputeId: number): Promise<string>;
    /**
     * Maps numeric dispute status from arbitrator to enum
     * @param status The numeric status from the contract
     * @returns The corresponding DisputeStatus enum value
     */
    private mapDisputeStatus;
    /**
     * Maps numeric ruling from arbitrator to enum
     * @param ruling The numeric ruling from the contract
     * @returns The corresponding Ruling enum value
     */
    private mapRuling;
    /**
     * Gets the fee timeout period
     * @returns The fee timeout in seconds
     */
    getFeeTimeout(): Promise<number>;
}
