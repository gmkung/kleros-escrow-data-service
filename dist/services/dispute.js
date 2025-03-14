"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisputeService = void 0;
const ethers_1 = require("ethers");
const dispute_1 = require("../types/dispute");
/**
 * Service for reading dispute data from the Kleros Escrow contract
 */
class DisputeService {
    /**
     * Creates a new DisputeService instance
     * @param config The Kleros Escrow configuration
     */
    constructor(config) {
        this.arbitratorContract = null;
        this.provider = new ethers_1.ethers.providers.JsonRpcProvider(config.provider.url, config.provider.networkId);
        this.escrowContract = new ethers_1.ethers.Contract(config.multipleArbitrableTransaction.address, config.multipleArbitrableTransaction.abi, this.provider);
        if (config.arbitrator) {
            this.arbitratorContract = new ethers_1.ethers.Contract(config.arbitrator.address, config.arbitrator.abi, this.provider);
        }
    }
    /**
     * Gets dispute information for a transaction
     * @param transactionId The ID of the transaction
     * @returns The dispute data if it exists
     */
    async getDispute(transactionId) {
        const tx = await this.escrowContract.transactions(transactionId);
        if (tx.disputeId.toNumber() === 0) {
            return null;
        }
        const disputeId = tx.disputeId.toNumber();
        const arbitrator = await this.escrowContract.arbitrator();
        let status = dispute_1.DisputeStatus.Waiting;
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
            }
            catch (e) {
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
    async getArbitrationCost() {
        const arbitrator = await this.escrowContract.arbitrator();
        const arbitratorExtraData = await this.escrowContract.arbitratorExtraData();
        // Create a contract instance for the arbitrator if we don't have one
        if (!this.arbitratorContract) {
            // This is a simplified approach - in a real implementation, you'd need the ABI
            const arbitratorAbi = ["function arbitrationCost(bytes) view returns (uint)"];
            const tempArbitratorContract = new ethers_1.ethers.Contract(arbitrator, arbitratorAbi, this.provider);
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
    async getAppealCost(disputeId) {
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
    mapDisputeStatus(status) {
        const statusMap = {
            0: dispute_1.DisputeStatus.Waiting,
            1: dispute_1.DisputeStatus.Appealable,
            2: dispute_1.DisputeStatus.Solved
        };
        return statusMap[status] || dispute_1.DisputeStatus.Waiting;
    }
    /**
     * Maps numeric ruling from arbitrator to enum
     * @param ruling The numeric ruling from the contract
     * @returns The corresponding Ruling enum value
     */
    mapRuling(ruling) {
        const rulingMap = {
            0: dispute_1.Ruling.RefusedToRule,
            1: dispute_1.Ruling.SenderWins,
            2: dispute_1.Ruling.ReceiverWins
        };
        return rulingMap[ruling] || dispute_1.Ruling.RefusedToRule;
    }
    /**
     * Gets the fee timeout period
     * @returns The fee timeout in seconds
     */
    async getFeeTimeout() {
        const timeout = await this.escrowContract.feeTimeout();
        return timeout.toNumber();
    }
}
exports.DisputeService = DisputeService;
