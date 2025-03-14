import { ethers } from "ethers";
import { KlerosEscrowConfig } from "../types/config";
/**
 * Base class for all Kleros Escrow services and actions
 * Handles common initialization and provides shared utilities
 */
export declare abstract class BaseService {
    protected config: KlerosEscrowConfig;
    protected provider: ethers.providers.Provider;
    protected signer: ethers.Signer | null;
    protected escrowContract: ethers.Contract;
    protected arbitratorContract: ethers.Contract | null;
    protected isReadOnly: boolean;
    /**
     * Creates a new BaseService instance
     * @param config The Kleros Escrow configuration
     * @param signerOrProvider Optional signer for write operations, or provider for read-only operations
     */
    constructor(config: KlerosEscrowConfig, signerOrProvider?: ethers.Signer | ethers.providers.Provider);
    /**
     * Gets the arbitrator address from the escrow contract
     * @returns The arbitrator address
     */
    protected getArbitratorAddress(): Promise<string>;
    /**
     * Gets the arbitrator extra data from the escrow contract
     * @returns The arbitrator extra data
     */
    protected getArbitratorExtraData(): Promise<string>;
    /**
     * Gets or initializes the arbitrator contract
     * @param abi The ABI to use for the arbitrator contract
     * @returns The arbitrator contract instance
     */
    protected getArbitratorContract(abi: string[]): Promise<ethers.Contract>;
    /**
     * Checks if this service can perform write operations
     * @returns True if the service has a signer and can perform write operations
     */
    protected canWrite(): boolean;
    /**
     * Ensures that this service can perform write operations
     * @throws Error if the service is read-only
     */
    protected ensureCanWrite(): void;
}
