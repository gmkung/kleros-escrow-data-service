import { Arbitrator as ArbitratorType } from "../types/arbitrator";
import { KlerosEscrowConfig } from "../types/config";
/**
 * Service for reading arbitrator data
 */
export declare class ArbitratorService {
    private provider;
    private escrowContract;
    private arbitratorContract;
    /**
     * Creates a new ArbitratorService instance
     * @param config The Kleros Escrow configuration
     */
    constructor(config: KlerosEscrowConfig);
    /**
     * Gets information about the arbitrator
     * @returns The arbitrator information
     */
    getArbitrator(): Promise<ArbitratorType>;
    /**
     * Gets the fee timeout period
     * @returns The fee timeout in seconds
     */
    getFeeTimeout(): Promise<number>;
    /**
     * Gets the arbitrator address
     * @returns The address of the arbitrator contract
     */
    getArbitratorAddress(): Promise<string>;
    /**
     * Gets the arbitrator extra data
     * @returns The extra data used when creating disputes
     */
    getArbitratorExtraData(): Promise<string>;
    /**
     * Gets the subcourt ID used for disputes
     * @returns The subcourt ID
     */
    getSubcourt(): Promise<number>;
}
