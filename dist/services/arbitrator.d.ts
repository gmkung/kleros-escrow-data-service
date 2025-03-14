import { ethers } from "ethers";
import { Arbitrator as ArbitratorType } from "../types/arbitrator";
import { KlerosEscrowConfig } from "../types/config";
import { BaseService } from "../base/BaseService";
/**
 * Service for reading arbitrator data
 */
export declare class ArbitratorService extends BaseService {
    /**
     * Creates a new ArbitratorService instance
     * @param config The Kleros Escrow configuration
     * @param provider Optional provider for read operations
     */
    constructor(config: KlerosEscrowConfig, provider?: ethers.providers.Provider);
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
     * Gets the subcourt ID used for disputes
     * @returns The subcourt ID
     */
    getSubcourt(): Promise<number>;
}
