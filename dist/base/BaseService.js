"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
const ethers_1 = require("ethers");
/**
 * Base class for all Kleros Escrow services and actions
 * Handles common initialization and provides shared utilities
 */
class BaseService {
    /**
     * Creates a new BaseService instance
     * @param config The Kleros Escrow configuration
     * @param signerOrProvider Optional signer for write operations, or provider for read-only operations
     */
    constructor(config, signerOrProvider) {
        this.config = config;
        this.signer = null;
        this.arbitratorContract = null;
        // If no signer or provider is provided, create a read-only provider
        if (!signerOrProvider) {
            this.provider = new ethers_1.ethers.providers.JsonRpcProvider(config.provider.url, config.provider.networkId);
            this.isReadOnly = true;
        }
        // If a signer is provided, use it and its provider
        else if (signerOrProvider instanceof ethers_1.ethers.Signer) {
            this.signer = signerOrProvider;
            this.provider = signerOrProvider.provider;
            this.isReadOnly = false;
        }
        // If a provider is provided, use it
        else {
            this.provider = signerOrProvider;
            this.isReadOnly = true;
        }
        // Initialize the escrow contract with the appropriate signer or provider
        const contractProvider = this.signer || this.provider;
        this.escrowContract = new ethers_1.ethers.Contract(config.multipleArbitrableTransaction.address, config.multipleArbitrableTransaction.abi, contractProvider);
    }
    /**
     * Gets the arbitrator address from the escrow contract
     * @returns The arbitrator address
     */
    async getArbitratorAddress() {
        return await this.escrowContract.arbitrator();
    }
    /**
     * Gets the arbitrator extra data from the escrow contract
     * @returns The arbitrator extra data
     */
    async getArbitratorExtraData() {
        return await this.escrowContract.arbitratorExtraData();
    }
    /**
     * Gets or initializes the arbitrator contract
     * @param abi The ABI to use for the arbitrator contract
     * @returns The arbitrator contract instance
     */
    async getArbitratorContract(abi) {
        if (!this.arbitratorContract) {
            const arbitratorAddress = await this.getArbitratorAddress();
            const contractProvider = this.signer || this.provider;
            this.arbitratorContract = new ethers_1.ethers.Contract(arbitratorAddress, abi, contractProvider);
        }
        return this.arbitratorContract;
    }
    /**
     * Checks if this service can perform write operations
     * @returns True if the service has a signer and can perform write operations
     */
    canWrite() {
        return !this.isReadOnly && !!this.signer;
    }
    /**
     * Ensures that this service can perform write operations
     * @throws Error if the service is read-only
     */
    ensureCanWrite() {
        if (!this.canWrite()) {
            throw new Error("This operation requires a signer. The service is in read-only mode.");
        }
    }
}
exports.BaseService = BaseService;
