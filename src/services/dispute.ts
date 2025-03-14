import { ethers } from 'ethers';
import { Dispute, DisputeStatus, Ruling } from '../types/dispute';
import { KlerosEscrowConfig } from '../types/config';

/**
 * Service for reading dispute data from the Kleros Escrow contract
 */
export class DisputeService {
  private provider: ethers.providers.Provider;
  private escrowContract: ethers.Contract;
  private arbitratorContract: ethers.Contract | null = null;

  /**
   * Creates a new DisputeService instance
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
   * Gets dispute information for a transaction
   * @param transactionId The ID of the transaction
   * @returns The dispute data if it exists
   */
  async getDispute(transactionId: string): Promise<Dispute | null> {
    const tx = await this.escrowContract.transactions(transactionId);
    
    if (tx.disputeId.toNumber() === 0) {
      return null;
    }
    
    const disputeId = tx.disputeId.toNumber();
    const arbitrator = await this.escrowContract.arbitrator();
    
    let status = DisputeStatus.Waiting;
    let ruling = undefined;
    let appealPeriodStart = undefined;
    let appealPeriodEnd = undefined;
    
    // If we have access to the arbitrator contract, get more details
    if (this.arbitratorContract) {
      const disputeStatus = await this.arbitratorContract.disputeStatus(disputeId);
      status = this.mapDisputeStatus(disputeStatus);
      
      const currentRuling = await this.arbitratorContract.currentRuling(disputeId);
      ruling = this.mapRuling(currentRuling);
      
      // Try to get appeal period if available
      try {
        const appealPeriod = await this.arbitratorContract.appealPeriod(disputeId);
        appealPeriodStart = appealPeriod[0].toNumber();
        appealPeriodEnd = appealPeriod[1].toNumber();
      } catch (e) {
        // Appeal period might not be available for all arbitrators
      }
    }
    
    return {
      id: disputeId,
      transactionId,
      status,
      ruling,
      arbitrator,
      arbitratorExtraData: await this.escrowContract.arbitratorExtraData(),
      evidenceGroupId: transactionId, // In this contract, evidenceGroupId is the same as transactionId
      appealPeriodStart,
      appealPeriodEnd
    };
  }

  /**
   * Gets the arbitration cost for creating a dispute
   * @returns The arbitration cost in wei as a string
   */
  async getArbitrationCost(): Promise<string> {
    const arbitrator = await this.escrowContract.arbitrator();
    const arbitratorExtraData = await this.escrowContract.arbitratorExtraData();
    
    // Create a contract instance for the arbitrator if we don't have one
    if (!this.arbitratorContract) {
      // This is a simplified approach - in a real implementation, you'd need the ABI
      const arbitratorAbi = ["function arbitrationCost(bytes) view returns (uint)"];
      const tempArbitratorContract = new ethers.Contract(
        arbitrator,
        arbitratorAbi,
        this.provider
      );
      
      const cost = await tempArbitratorContract.arbitrationCost(arbitratorExtraData);
      return cost.toString();
    }
    
    const cost = await this.arbitratorContract.arbitrationCost(arbitratorExtraData);
    return cost.toString();
  }

  /**
   * Gets the appeal cost for a dispute
   * @param disputeId The ID of the dispute
   * @returns The appeal cost in wei as a string
   */
  async getAppealCost(disputeId: number): Promise<string> {
    if (!this.arbitratorContract) {
      throw new Error("Arbitrator contract not configured");
    }
    
    const arbitratorExtraData = await this.escrowContract.arbitratorExtraData();
    const cost = await this.arbitratorContract.appealCost(disputeId, arbitratorExtraData);
    return cost.toString();
  }

  /**
   * Maps numeric dispute status from arbitrator to enum
   * @param status The numeric status from the contract
   * @returns The corresponding DisputeStatus enum value
   */
  private mapDisputeStatus(status: number): DisputeStatus {
    const statusMap: Record<number, DisputeStatus> = {
      0: DisputeStatus.Waiting,
      1: DisputeStatus.Appealable,
      2: DisputeStatus.Solved
    };
    
    return statusMap[status] || DisputeStatus.Waiting;
  }

  /**
   * Maps numeric ruling from arbitrator to enum
   * @param ruling The numeric ruling from the contract
   * @returns The corresponding Ruling enum value
   */
  private mapRuling(ruling: number): Ruling {
    const rulingMap: Record<number, Ruling> = {
      0: Ruling.RefusedToRule,
      1: Ruling.SenderWins,
      2: Ruling.ReceiverWins
    };
    
    return rulingMap[ruling] || Ruling.RefusedToRule;
  }

  /**
   * Gets the fee timeout period
   * @returns The fee timeout in seconds
   */
  async getFeeTimeout(): Promise<number> {
    const timeout = await this.escrowContract.feeTimeout();
    return timeout.toNumber();
  }
} 