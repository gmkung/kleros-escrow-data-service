import { ethers } from "ethers";
import { Arbitrator as ArbitratorType } from "../types/arbitrator";
import { KlerosEscrowConfig } from "../types/config";

/**
 * Service for reading arbitrator data
 */
export class ArbitratorService {
  private provider: ethers.providers.Provider;
  private escrowContract: ethers.Contract;
  private arbitratorContract: ethers.Contract | null = null;

  /**
   * Creates a new ArbitratorService instance
   * @param config The Kleros Escrow configuration
   */
  constructor(config: KlerosEscrowConfig) {
    this.provider = new ethers.providers.JsonRpcProvider(
      config.provider.url,
      config.provider.networkId
    );

    this.escrowContract = new ethers.Contract(
      config.multipleArbitrableTransaction.address,
      config.multipleArbitrableTransaction.abi,
      this.provider
    );

    if (config.arbitrator) {
      this.arbitratorContract = new ethers.Contract(
        config.arbitrator.address,
        config.arbitrator.abi,
        this.provider
      );
    }
  }

  /**
   * Gets information about the arbitrator
   * @returns The arbitrator information
   */
  async getArbitrator(): Promise<ArbitratorType> {
    const arbitratorAddress = await this.escrowContract.arbitrator();
    const arbitratorExtraData = await this.escrowContract.arbitratorExtraData();

    // Create a minimal arbitrator interface if we don't have the full contract
    if (!this.arbitratorContract) {
      const minimalAbi = [
        "function arbitrationCost(bytes) view returns (uint)",
        "function appealCost(uint, bytes) view returns (uint)",
      ];

      this.arbitratorContract = new ethers.Contract(
        arbitratorAddress,
        minimalAbi,
        this.provider
      );
    }

    // Get the arbitration cost
    const arbitrationCost =
      await this.arbitratorContract.arbitrationCost(arbitratorExtraData);

    // For appeal cost, we need a dispute ID, but we don't have one here
    // In a real implementation, you might want to handle this differently
    const appealCost = "0"; // Placeholder

    return {
      address: arbitratorAddress,
      arbitrationCost: arbitrationCost.toString(),
      appealCost,
    };
  }

  /**
   * Gets the fee timeout period
   * @returns The fee timeout in seconds
   */
  async getFeeTimeout(): Promise<number> {
    const timeout = await this.escrowContract.feeTimeout();
    return timeout.toNumber();
  }

  /**
   * Gets the arbitrator address
   * @returns The address of the arbitrator contract
   */
  async getArbitratorAddress(): Promise<string> {
    return await this.escrowContract.arbitrator();
  }

  /**
   * Gets the arbitrator extra data
   * @returns The extra data used when creating disputes
   */
  async getArbitratorExtraData(): Promise<string> {
    return await this.escrowContract.arbitratorExtraData();
  }

  /**
   * Gets the subcourt ID used for disputes
   * @returns The subcourt ID
   */
  async getSubcourt(): Promise<number> {
    const subcourt = await this.escrowContract.getSubcourt();
    return subcourt.toNumber();
  }
}
