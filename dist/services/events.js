"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const ethers_1 = require("ethers");
const transaction_1 = require("../types/transaction");
/**
 * Service for fetching events from the Kleros Escrow contract
 */
class EventService {
    /**
     * Creates a new EventService instance
     * @param config The Kleros Escrow configuration
     */
    constructor(config) {
        this.provider = new ethers_1.ethers.providers.JsonRpcProvider(config.provider.url, config.provider.networkId);
        this.contract = new ethers_1.ethers.Contract(config.multipleArbitrableTransaction.address, config.multipleArbitrableTransaction.abi, this.provider);
    }
    /**
     * Gets all events for a specific transaction
     * @param transactionId The ID of the transaction
     * @param fromBlock The starting block to search from (optional)
     * @returns All events related to the transaction
     */
    async getEventsForTransaction(transactionId, fromBlock = 0) {
        const events = [];
        // Get all relevant event types
        const metaEvidenceEvents = await this.getMetaEvidenceEvents(transactionId, fromBlock);
        const paymentEvents = await this.getPaymentEvents(transactionId, fromBlock);
        const hasToPayFeeEvents = await this.getHasToPayFeeEvents(transactionId, fromBlock);
        const disputeEvents = await this.getDisputeEvents(transactionId, fromBlock);
        const evidenceEvents = await this.getEvidenceEvents(transactionId, fromBlock);
        const rulingEvents = await this.getRulingEvents(transactionId, fromBlock);
        // Combine all events
        return [
            ...metaEvidenceEvents,
            ...paymentEvents,
            ...hasToPayFeeEvents,
            ...disputeEvents,
            ...evidenceEvents,
            ...rulingEvents
        ].sort((a, b) => a.blockNumber - b.blockNumber);
    }
    /**
     * Gets MetaEvidence events for a transaction
     * @param transactionId The ID of the transaction
     * @param fromBlock The starting block to search from
     * @returns Array of MetaEvidence events
     */
    async getMetaEvidenceEvents(transactionId, fromBlock = 0) {
        const filter = this.contract.filters.MetaEvidence(transactionId);
        const events = await this.contract.queryFilter(filter, fromBlock);
        return Promise.all(events.map(async (event) => {
            var _a, _b;
            const block = await event.getBlock();
            return {
                transactionId,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                timestamp: block.timestamp,
                metaEvidenceId: (_a = event.args) === null || _a === void 0 ? void 0 : _a._metaEvidenceID.toString(),
                evidence: (_b = event.args) === null || _b === void 0 ? void 0 : _b._evidence
            };
        }));
    }
    /**
     * Gets Payment events for a transaction
     * @param transactionId The ID of the transaction
     * @param fromBlock The starting block to search from
     * @returns Array of Payment events
     */
    async getPaymentEvents(transactionId, fromBlock = 0) {
        const filter = this.contract.filters.Payment(transactionId);
        const events = await this.contract.queryFilter(filter, fromBlock);
        return Promise.all(events.map(async (event) => {
            var _a, _b;
            const block = await event.getBlock();
            return {
                transactionId,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                timestamp: block.timestamp,
                amount: (_a = event.args) === null || _a === void 0 ? void 0 : _a._amount.toString(),
                party: (_b = event.args) === null || _b === void 0 ? void 0 : _b._party
            };
        }));
    }
    /**
     * Gets HasToPayFee events for a transaction
     * @param transactionId The ID of the transaction
     * @param fromBlock The starting block to search from
     * @returns Array of HasToPayFee events
     */
    async getHasToPayFeeEvents(transactionId, fromBlock = 0) {
        const filter = this.contract.filters.HasToPayFee(transactionId);
        const events = await this.contract.queryFilter(filter, fromBlock);
        return Promise.all(events.map(async (event) => {
            var _a;
            const block = await event.getBlock();
            return {
                transactionId,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                timestamp: block.timestamp,
                party: ((_a = event.args) === null || _a === void 0 ? void 0 : _a._party) === 0 ? transaction_1.Party.Sender : transaction_1.Party.Receiver
            };
        }));
    }
    /**
     * Gets Dispute events for a transaction
     * @param transactionId The ID of the transaction
     * @param fromBlock The starting block to search from
     * @returns Array of Dispute events
     */
    async getDisputeEvents(transactionId, fromBlock = 0) {
        // For Dispute events, we need to filter by _metaEvidenceID which is the transactionId
        // This is a bit more complex as we need to check all Dispute events
        const allDisputeEvents = await this.contract.queryFilter(this.contract.filters.Dispute(), fromBlock);
        const relevantEvents = allDisputeEvents.filter(event => { var _a; return ((_a = event.args) === null || _a === void 0 ? void 0 : _a._metaEvidenceID.toString()) === transactionId; });
        return Promise.all(relevantEvents.map(async (event) => {
            var _a, _b, _c, _d;
            const block = await event.getBlock();
            return {
                transactionId,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                timestamp: block.timestamp,
                disputeId: (_a = event.args) === null || _a === void 0 ? void 0 : _a._disputeID.toNumber(),
                arbitrator: (_b = event.args) === null || _b === void 0 ? void 0 : _b._arbitrator,
                metaEvidenceId: (_c = event.args) === null || _c === void 0 ? void 0 : _c._metaEvidenceID.toString(),
                evidenceGroupId: (_d = event.args) === null || _d === void 0 ? void 0 : _d._evidenceGroupID.toString()
            };
        }));
    }
    /**
     * Gets Evidence events for a transaction
     * @param transactionId The ID of the transaction
     * @param fromBlock The starting block to search from
     * @returns Array of Evidence events
     */
    async getEvidenceEvents(transactionId, fromBlock = 0) {
        // For Evidence events, we need to filter by _evidenceGroupID which is the transactionId
        const allEvidenceEvents = await this.contract.queryFilter(this.contract.filters.Evidence(), fromBlock);
        const relevantEvents = allEvidenceEvents.filter(event => { var _a; return ((_a = event.args) === null || _a === void 0 ? void 0 : _a._evidenceGroupID.toString()) === transactionId; });
        return Promise.all(relevantEvents.map(async (event) => {
            var _a, _b, _c, _d;
            const block = await event.getBlock();
            return {
                transactionId,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                timestamp: block.timestamp,
                party: (_a = event.args) === null || _a === void 0 ? void 0 : _a._party,
                evidence: (_b = event.args) === null || _b === void 0 ? void 0 : _b._evidence,
                arbitrator: (_c = event.args) === null || _c === void 0 ? void 0 : _c._arbitrator,
                evidenceGroupId: (_d = event.args) === null || _d === void 0 ? void 0 : _d._evidenceGroupID.toString()
            };
        }));
    }
    /**
     * Gets Ruling events for a transaction
     * @param transactionId The ID of the transaction
     * @param fromBlock The starting block to search from
     * @returns Array of Ruling events
     */
    async getRulingEvents(transactionId, fromBlock = 0) {
        // For Ruling events, we need to get the disputeId first
        const tx = await this.contract.transactions(transactionId);
        const disputeId = tx.disputeId.toNumber();
        if (disputeId === 0) {
            return [];
        }
        const filter = this.contract.filters.Ruling(null, disputeId);
        const events = await this.contract.queryFilter(filter, fromBlock);
        return Promise.all(events.map(async (event) => {
            var _a, _b, _c;
            const block = await event.getBlock();
            return {
                transactionId,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                timestamp: block.timestamp,
                disputeId: (_a = event.args) === null || _a === void 0 ? void 0 : _a._disputeID.toNumber(),
                ruling: (_b = event.args) === null || _b === void 0 ? void 0 : _b._ruling.toNumber(),
                arbitrator: (_c = event.args) === null || _c === void 0 ? void 0 : _c._arbitrator
            };
        }));
    }
}
exports.EventService = EventService;
