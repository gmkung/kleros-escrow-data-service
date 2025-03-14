"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const BaseService_1 = require("../base/BaseService");
const transaction_1 = require("../types/transaction");
/**
 * Service for retrieving events from the Kleros Escrow contract
 */
class EventService extends BaseService_1.BaseService {
    /**
     * Creates a new EventService instance
     * @param config The Kleros Escrow configuration
     * @param provider Optional provider for read operations
     */
    constructor(config, provider) {
        super(config, provider);
    }
    /**
     * Gets all events for a specific transaction
     * @param transactionId The ID of the transaction
     * @param fromBlock The starting block to search from (optional)
     * @returns All events related to the transaction
     */
    async getEventsForTransaction(transactionId, fromBlock = 0) {
        try {
            // Get the latest block number to limit the search range
            let toBlock;
            try {
                const latestBlock = await this.provider.getBlock("latest");
                toBlock = latestBlock.number;
            }
            catch (error) {
                console.warn("Error getting latest block, using a default range:", error);
                // If we can't get the latest block, use a reasonable default
                toBlock = fromBlock + 1000000; // ~1 million blocks (~6 months)
            }
            // Limit the block range to prevent timeouts (max 100,000 blocks at a time)
            const MAX_BLOCK_RANGE = 100000;
            const effectiveToBlock = Math.min(fromBlock + MAX_BLOCK_RANGE, toBlock);
            console.log(`Searching for events from block ${fromBlock} to ${effectiveToBlock} (limited range)`);
            const events = [];
            // Get all relevant event types with error handling
            let metaEvidenceEvents = [];
            let paymentEvents = [];
            let hasToPayFeeEvents = [];
            let disputeEvents = [];
            let evidenceEvents = [];
            let rulingEvents = [];
            try {
                metaEvidenceEvents = await this.getMetaEvidenceEvents(transactionId, fromBlock, effectiveToBlock);
                console.log(`Found ${metaEvidenceEvents.length} MetaEvidence events`);
            }
            catch (error) {
                console.warn("Error fetching MetaEvidence events:", error);
                metaEvidenceEvents = [];
            }
            try {
                paymentEvents = await this.getPaymentEvents(transactionId, fromBlock, effectiveToBlock);
                console.log(`Found ${paymentEvents.length} Payment events`);
            }
            catch (error) {
                console.warn("Error fetching Payment events:", error);
                paymentEvents = [];
            }
            try {
                hasToPayFeeEvents = await this.getHasToPayFeeEvents(transactionId, fromBlock, effectiveToBlock);
                console.log(`Found ${hasToPayFeeEvents.length} HasToPayFee events`);
            }
            catch (error) {
                console.warn("Error fetching HasToPayFee events:", error);
                hasToPayFeeEvents = [];
            }
            try {
                disputeEvents = await this.getDisputeEvents(transactionId, fromBlock, effectiveToBlock);
                console.log(`Found ${disputeEvents.length} Dispute events`);
            }
            catch (error) {
                console.warn("Error fetching Dispute events:", error);
                disputeEvents = [];
            }
            try {
                evidenceEvents = await this.getEvidenceEvents(transactionId, fromBlock, effectiveToBlock);
                console.log(`Found ${evidenceEvents.length} Evidence events`);
            }
            catch (error) {
                console.warn("Error fetching Evidence events:", error);
                evidenceEvents = [];
            }
            try {
                rulingEvents = await this.getRulingEvents(transactionId, fromBlock, effectiveToBlock);
                console.log(`Found ${rulingEvents.length} Ruling events`);
            }
            catch (error) {
                console.warn("Error fetching Ruling events:", error);
                rulingEvents = [];
            }
            // Ensure all event arrays are valid before combining
            const allEvents = [
                ...(Array.isArray(metaEvidenceEvents) ? metaEvidenceEvents : []),
                ...(Array.isArray(paymentEvents) ? paymentEvents : []),
                ...(Array.isArray(hasToPayFeeEvents) ? hasToPayFeeEvents : []),
                ...(Array.isArray(disputeEvents) ? disputeEvents : []),
                ...(Array.isArray(evidenceEvents) ? evidenceEvents : []),
                ...(Array.isArray(rulingEvents) ? rulingEvents : []),
            ];
            // Sort events by block number if they have one
            return allEvents
                .filter(event => event && typeof event.blockNumber === 'number')
                .sort((a, b) => a.blockNumber - b.blockNumber);
        }
        catch (error) {
            console.error("Error in getEventsForTransaction:", error);
            return [];
        }
    }
    /**
     * Gets transaction creation events
     * @param fromBlock The block to start searching from
     * @param toBlock The block to end searching at
     * @returns An array of transaction creation events
     */
    async getTransactionCreationEvents(fromBlock, toBlock) {
        const filter = this.escrowContract.filters.TransactionCreated();
        return await this.escrowContract.queryFilter(filter, fromBlock, toBlock);
    }
    /**
     * Gets MetaEvidence events for a transaction
     * @param transactionId The ID of the transaction
     * @param fromBlock The starting block to search from
     * @param toBlock The ending block to search to
     * @returns Array of MetaEvidence events
     */
    async getMetaEvidenceEvents(transactionId, fromBlock = 0, toBlock) {
        var _a, _b, _c, _d;
        try {
            const filter = this.escrowContract.filters.MetaEvidence(transactionId);
            const events = await this.escrowContract.queryFilter(filter, fromBlock, toBlock);
            const results = [];
            for (const event of events) {
                try {
                    const block = await event.getBlock();
                    results.push({
                        transactionId,
                        blockNumber: event.blockNumber,
                        transactionHash: event.transactionHash,
                        timestamp: block.timestamp,
                        metaEvidenceId: (_a = event.args) === null || _a === void 0 ? void 0 : _a._metaEvidenceID.toString(),
                        evidence: (_b = event.args) === null || _b === void 0 ? void 0 : _b._evidence,
                    });
                }
                catch (error) {
                    console.warn(`Error processing MetaEvidence event at block ${event.blockNumber}:`, error);
                    // Add the event with minimal information
                    results.push({
                        transactionId,
                        blockNumber: event.blockNumber,
                        transactionHash: event.transactionHash,
                        timestamp: 0, // Unknown timestamp
                        metaEvidenceId: (_c = event.args) === null || _c === void 0 ? void 0 : _c._metaEvidenceID.toString(),
                        evidence: (_d = event.args) === null || _d === void 0 ? void 0 : _d._evidence,
                    });
                }
            }
            return results;
        }
        catch (error) {
            console.error("Error in getMetaEvidenceEvents:", error);
            return [];
        }
    }
    /**
     * Gets payment events
     * @param transactionId The ID of the transaction
     * @param fromBlock The block to start searching from
     * @param toBlock The block to end searching at
     * @returns An array of payment events
     */
    async getPaymentEvents(transactionId, fromBlock, toBlock) {
        var _a, _b, _c, _d, _e, _f;
        try {
            const filter = this.escrowContract.filters.Payment(transactionId);
            const events = await this.escrowContract.queryFilter(filter, fromBlock, toBlock);
            const results = [];
            for (const event of events) {
                try {
                    const block = await event.getBlock();
                    results.push({
                        transactionId: (_a = event.args) === null || _a === void 0 ? void 0 : _a._transactionID.toString(),
                        blockNumber: event.blockNumber,
                        transactionHash: event.transactionHash,
                        timestamp: block.timestamp,
                        amount: (_b = event.args) === null || _b === void 0 ? void 0 : _b._amount.toString(),
                        party: (_c = event.args) === null || _c === void 0 ? void 0 : _c._party,
                    });
                }
                catch (error) {
                    console.warn(`Error processing Payment event at block ${event.blockNumber}:`, error);
                    // Add the event with minimal information
                    results.push({
                        transactionId: (_d = event.args) === null || _d === void 0 ? void 0 : _d._transactionID.toString(),
                        blockNumber: event.blockNumber,
                        transactionHash: event.transactionHash,
                        timestamp: 0, // Unknown timestamp
                        amount: (_e = event.args) === null || _e === void 0 ? void 0 : _e._amount.toString(),
                        party: (_f = event.args) === null || _f === void 0 ? void 0 : _f._party,
                    });
                }
            }
            return results;
        }
        catch (error) {
            console.error("Error in getPaymentEvents:", error);
            return [];
        }
    }
    /**
     * Gets HasToPayFee events for a transaction
     * @param transactionId The ID of the transaction
     * @param fromBlock The starting block to search from
     * @param toBlock The ending block to search to
     * @returns Array of HasToPayFee events
     */
    async getHasToPayFeeEvents(transactionId, fromBlock, toBlock) {
        var _a, _b, _c, _d;
        try {
            const filter = this.escrowContract.filters.HasToPayFee(transactionId);
            const events = await this.escrowContract.queryFilter(filter, fromBlock, toBlock);
            const results = [];
            for (const event of events) {
                try {
                    const block = await event.getBlock();
                    results.push({
                        transactionId: (_a = event.args) === null || _a === void 0 ? void 0 : _a._transactionID.toString(),
                        blockNumber: event.blockNumber,
                        transactionHash: event.transactionHash,
                        timestamp: block.timestamp,
                        party: ((_b = event.args) === null || _b === void 0 ? void 0 : _b._party) === 0 ? transaction_1.Party.Sender : transaction_1.Party.Receiver,
                    });
                }
                catch (error) {
                    console.warn(`Error processing HasToPayFee event at block ${event.blockNumber}:`, error);
                    // Add the event with minimal information
                    results.push({
                        transactionId: (_c = event.args) === null || _c === void 0 ? void 0 : _c._transactionID.toString(),
                        blockNumber: event.blockNumber,
                        transactionHash: event.transactionHash,
                        timestamp: 0, // Unknown timestamp
                        party: ((_d = event.args) === null || _d === void 0 ? void 0 : _d._party) === 0 ? transaction_1.Party.Sender : transaction_1.Party.Receiver,
                    });
                }
            }
            return results;
        }
        catch (error) {
            console.error("Error in getHasToPayFeeEvents:", error);
            return [];
        }
    }
    /**
     * Gets dispute creation events
     * @param transactionId The ID of the transaction
     * @param fromBlock The block to start searching from
     * @param toBlock The block to end searching at
     * @returns An array of dispute creation events
     */
    async getDisputeEvents(transactionId, fromBlock, toBlock) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        try {
            // For Dispute events, we need to filter by _metaEvidenceID which is the transactionId
            const filter = this.escrowContract.filters.Dispute(null, transactionId);
            const events = await this.escrowContract.queryFilter(filter, fromBlock, toBlock);
            // If transactionId is provided, filter events by metaEvidenceID
            const relevantEvents = transactionId
                ? events.filter((event) => { var _a; return ((_a = event.args) === null || _a === void 0 ? void 0 : _a._metaEvidenceID.toString()) === transactionId; })
                : events;
            const results = [];
            for (const event of relevantEvents) {
                try {
                    const block = await event.getBlock();
                    results.push({
                        transactionId: (_a = event.args) === null || _a === void 0 ? void 0 : _a._metaEvidenceID.toString(),
                        blockNumber: event.blockNumber,
                        transactionHash: event.transactionHash,
                        timestamp: block.timestamp,
                        disputeId: (_b = event.args) === null || _b === void 0 ? void 0 : _b._disputeID.toNumber(),
                        arbitrator: (_c = event.args) === null || _c === void 0 ? void 0 : _c._arbitrator,
                        metaEvidenceId: (_d = event.args) === null || _d === void 0 ? void 0 : _d._metaEvidenceID.toString(),
                        evidenceGroupId: (_e = event.args) === null || _e === void 0 ? void 0 : _e._evidenceGroupID.toString(),
                    });
                }
                catch (error) {
                    console.warn(`Error processing Dispute event at block ${event.blockNumber}:`, error);
                    // Add the event with minimal information
                    results.push({
                        transactionId: (_f = event.args) === null || _f === void 0 ? void 0 : _f._metaEvidenceID.toString(),
                        blockNumber: event.blockNumber,
                        transactionHash: event.transactionHash,
                        timestamp: 0, // Unknown timestamp
                        disputeId: (_g = event.args) === null || _g === void 0 ? void 0 : _g._disputeID.toNumber(),
                        arbitrator: (_h = event.args) === null || _h === void 0 ? void 0 : _h._arbitrator,
                        metaEvidenceId: (_j = event.args) === null || _j === void 0 ? void 0 : _j._metaEvidenceID.toString(),
                        evidenceGroupId: (_k = event.args) === null || _k === void 0 ? void 0 : _k._evidenceGroupID.toString(),
                    });
                }
            }
            return results;
        }
        catch (error) {
            console.error("Error in getDisputeEvents:", error);
            return [];
        }
    }
    /**
     * Gets evidence submission events
     * @param transactionId The ID of the transaction
     * @param fromBlock The block to start searching from
     * @param toBlock The block to end searching at
     * @returns An array of evidence submission events
     */
    async getEvidenceEvents(transactionId, fromBlock, toBlock) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        try {
            // For Evidence events, we need to filter by _evidenceGroupID which is the transactionId
            // Handle the case where transactionId is "0" specially to avoid invalid address errors
            let filter;
            if (transactionId === "0") {
                // For transaction ID 0, we need a special approach
                // First get all Evidence events and then filter manually
                filter = this.escrowContract.filters.Evidence();
            }
            else {
                filter = this.escrowContract.filters.Evidence(null, null, transactionId);
            }
            const events = await this.escrowContract.queryFilter(filter, fromBlock, toBlock);
            // If transactionId is provided, filter events by evidenceGroupID
            const relevantEvents = transactionId
                ? events.filter((event) => { var _a; return ((_a = event.args) === null || _a === void 0 ? void 0 : _a._evidenceGroupID.toString()) === transactionId; })
                : events;
            const results = [];
            for (const event of relevantEvents) {
                try {
                    const block = await event.getBlock();
                    results.push({
                        transactionId: (_a = event.args) === null || _a === void 0 ? void 0 : _a._evidenceGroupID.toString(),
                        blockNumber: event.blockNumber,
                        transactionHash: event.transactionHash,
                        timestamp: block.timestamp,
                        party: (_b = event.args) === null || _b === void 0 ? void 0 : _b._party,
                        evidence: (_c = event.args) === null || _c === void 0 ? void 0 : _c._evidence,
                        arbitrator: (_d = event.args) === null || _d === void 0 ? void 0 : _d._arbitrator,
                        evidenceGroupId: (_e = event.args) === null || _e === void 0 ? void 0 : _e._evidenceGroupID.toString(),
                    });
                }
                catch (error) {
                    console.warn(`Error processing Evidence event at block ${event.blockNumber}:`, error);
                    // Add the event with minimal information
                    results.push({
                        transactionId: (_f = event.args) === null || _f === void 0 ? void 0 : _f._evidenceGroupID.toString(),
                        blockNumber: event.blockNumber,
                        transactionHash: event.transactionHash,
                        timestamp: 0, // Unknown timestamp
                        party: (_g = event.args) === null || _g === void 0 ? void 0 : _g._party,
                        evidence: (_h = event.args) === null || _h === void 0 ? void 0 : _h._evidence,
                        arbitrator: (_j = event.args) === null || _j === void 0 ? void 0 : _j._arbitrator,
                        evidenceGroupId: (_k = event.args) === null || _k === void 0 ? void 0 : _k._evidenceGroupID.toString(),
                    });
                }
            }
            return results;
        }
        catch (error) {
            console.error("Error in getEvidenceEvents:", error);
            return [];
        }
    }
    /**
     * Gets ruling events
     * @param transactionId The ID of the transaction
     * @param fromBlock The block to start searching from
     * @param toBlock The block to end searching at
     * @returns An array of ruling events
     */
    async getRulingEvents(transactionId, fromBlock, toBlock) {
        var _a, _b, _c, _d, _e, _f, _g;
        try {
            let disputeId;
            // If transactionId is provided, get the disputeId
            if (transactionId) {
                try {
                    const tx = await this.escrowContract.transactions(transactionId);
                    disputeId = tx.disputeId.toNumber();
                    if (disputeId === 0) {
                        return [];
                    }
                }
                catch (error) {
                    console.warn(`Error getting transaction ${transactionId} for dispute ID:`, error);
                    return [];
                }
            }
            const filter = this.escrowContract.filters.Ruling(null, disputeId);
            const events = await this.escrowContract.queryFilter(filter, fromBlock, toBlock);
            const results = [];
            for (const event of events) {
                try {
                    const block = await event.getBlock();
                    // If we don't have a transactionId, we need to find it
                    let txId = transactionId;
                    if (!txId) {
                        try {
                            // This is a simplified approach - in a real implementation, you might want to use a more efficient method
                            // Limit the search to a reasonable number to prevent timeouts
                            const MAX_TX_TO_CHECK = 100;
                            const count = await this.escrowContract.getCountTransactions();
                            const txCount = Math.min(count.toNumber(), MAX_TX_TO_CHECK);
                            for (let i = 0; i < txCount; i++) {
                                const tx = await this.escrowContract.transactions(i);
                                if (tx.disputeId.eq((_a = event.args) === null || _a === void 0 ? void 0 : _a._disputeID)) {
                                    txId = i.toString();
                                    break;
                                }
                            }
                        }
                        catch (error) {
                            console.error("Error finding transaction ID for dispute:", error);
                            txId = "unknown";
                        }
                    }
                    results.push({
                        transactionId: txId || "unknown",
                        blockNumber: event.blockNumber,
                        transactionHash: event.transactionHash,
                        timestamp: block.timestamp,
                        disputeId: (_b = event.args) === null || _b === void 0 ? void 0 : _b._disputeID.toNumber(),
                        ruling: (_c = event.args) === null || _c === void 0 ? void 0 : _c._ruling.toNumber(),
                        arbitrator: (_d = event.args) === null || _d === void 0 ? void 0 : _d._arbitrator,
                    });
                }
                catch (error) {
                    console.warn(`Error processing Ruling event at block ${event.blockNumber}:`, error);
                    // Add the event with minimal information
                    results.push({
                        transactionId: transactionId || "unknown",
                        blockNumber: event.blockNumber,
                        transactionHash: event.transactionHash,
                        timestamp: 0, // Unknown timestamp
                        disputeId: (_e = event.args) === null || _e === void 0 ? void 0 : _e._disputeID.toNumber(),
                        ruling: (_f = event.args) === null || _f === void 0 ? void 0 : _f._ruling.toNumber(),
                        arbitrator: (_g = event.args) === null || _g === void 0 ? void 0 : _g._arbitrator,
                    });
                }
            }
            return results;
        }
        catch (error) {
            console.error("Error in getRulingEvents:", error);
            return [];
        }
    }
}
exports.EventService = EventService;
