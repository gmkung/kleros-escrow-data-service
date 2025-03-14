"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventListeners = void 0;
const ethers_1 = require("ethers");
const events_1 = require("events");
/**
 * Service for listening to events from the Kleros Escrow contract
 */
class EventListeners {
    /**
     * Creates a new EventListeners instance
     * @param config The Kleros Escrow configuration
     */
    constructor(config) {
        this.activeListeners = {};
        /**
         * Starts listening for MetaEvidence events
         * @param filter Optional filter for specific transaction IDs
         * @returns The event emitter
         */
        this.listenForMetaEvidence = (filter) => {
            // Create filter based on indexed fields
            const eventFilter = this.contract.filters.MetaEvidence((filter === null || filter === void 0 ? void 0 : filter.transactionId) ? ethers_1.ethers.BigNumber.from(filter.transactionId) : null);
            // Set up the listener
            const listener = (_metaEvidenceID, _evidence, event) => {
                this.processMetaEvidenceEvent(_metaEvidenceID, _evidence, event);
            };
            // Register the listener
            this.contract.on(eventFilter, listener);
            // Store the listener for later removal
            const key = `MetaEvidence:${(filter === null || filter === void 0 ? void 0 : filter.transactionId) || "all"}`;
            this.activeListeners[key] = listener;
            return this.eventEmitter;
        };
        /**
         * Starts listening for Payment events
         * @param filter Optional filter for specific transaction IDs or parties
         * @returns The event emitter
         */
        this.listenForPayment = (filter) => {
            // Create filter based on indexed fields
            const eventFilter = this.contract.filters.Payment((filter === null || filter === void 0 ? void 0 : filter.transactionId)
                ? ethers_1.ethers.BigNumber.from(filter.transactionId)
                : null, (filter === null || filter === void 0 ? void 0 : filter.party) || null);
            // Set up the listener
            const listener = (_transactionID, _party, _amount, event) => {
                this.processPaymentEvent(_transactionID, _party, _amount, event);
            };
            // Register the listener
            this.contract.on(eventFilter, listener);
            // Store the listener for later removal
            const key = `Payment:${(filter === null || filter === void 0 ? void 0 : filter.transactionId) || "all"}:${(filter === null || filter === void 0 ? void 0 : filter.party) || "all"}`;
            this.activeListeners[key] = listener;
            return this.eventEmitter;
        };
        /**
         * Starts listening for HasToPayFee events
         * @param filter Optional filter for specific transaction IDs or parties
         * @returns The event emitter
         */
        this.listenForHasToPayFee = (filter) => {
            // Create filter based on indexed fields
            const eventFilter = this.contract.filters.HasToPayFee((filter === null || filter === void 0 ? void 0 : filter.transactionId)
                ? ethers_1.ethers.BigNumber.from(filter.transactionId)
                : null, (filter === null || filter === void 0 ? void 0 : filter.party) || null);
            // Set up the listener
            const listener = (_transactionID, _party, event) => {
                this.processHasToPayFeeEvent(_transactionID, _party, event);
            };
            // Register the listener
            this.contract.on(eventFilter, listener);
            // Store the listener for later removal
            const key = `HasToPayFee:${(filter === null || filter === void 0 ? void 0 : filter.transactionId) || "all"}:${(filter === null || filter === void 0 ? void 0 : filter.party) || "all"}`;
            this.activeListeners[key] = listener;
            return this.eventEmitter;
        };
        /**
         * Starts listening for Dispute events
         * @param filter Optional filter for specific arbitrators or transaction IDs
         * @returns The event emitter
         */
        this.listenForDispute = (filter) => {
            // Create filter based on indexed fields
            const eventFilter = this.contract.filters.Dispute((filter === null || filter === void 0 ? void 0 : filter.arbitrator) || null, (filter === null || filter === void 0 ? void 0 : filter.disputeId) !== undefined
                ? ethers_1.ethers.BigNumber.from(filter.disputeId)
                : null);
            // Set up the listener
            const listener = (_arbitrator, _disputeID, _metaEvidenceID, _evidenceGroupID, event) => {
                this.processDisputeEvent(_arbitrator, _disputeID, _metaEvidenceID, _evidenceGroupID, event);
            };
            // Register the listener
            this.contract.on(eventFilter, listener);
            // Store the listener for later removal
            const key = `Dispute:${(filter === null || filter === void 0 ? void 0 : filter.arbitrator) || "all"}:${(filter === null || filter === void 0 ? void 0 : filter.disputeId) || "all"}`;
            this.activeListeners[key] = listener;
            return this.eventEmitter;
        };
        /**
         * Starts listening for Evidence events
         * @param filter Optional filter for specific arbitrators, parties, or evidence group IDs
         * @returns The event emitter
         */
        this.listenForEvidence = (filter) => {
            // Create filter based on indexed fields
            const eventFilter = this.contract.filters.Evidence((filter === null || filter === void 0 ? void 0 : filter.arbitrator) || null, (filter === null || filter === void 0 ? void 0 : filter.party) || null, (filter === null || filter === void 0 ? void 0 : filter.evidenceGroupId)
                ? ethers_1.ethers.BigNumber.from(filter.evidenceGroupId)
                : null);
            // Set up the listener
            const listener = (_arbitrator, _party, _evidenceGroupID, _evidence, event) => {
                this.processEvidenceEvent(_arbitrator, _party, _evidenceGroupID, _evidence, event);
            };
            // Register the listener
            this.contract.on(eventFilter, listener);
            // Store the listener for later removal
            const key = `Evidence:${(filter === null || filter === void 0 ? void 0 : filter.arbitrator) || "all"}:${(filter === null || filter === void 0 ? void 0 : filter.party) || "all"}:${(filter === null || filter === void 0 ? void 0 : filter.evidenceGroupId) || "all"}`;
            this.activeListeners[key] = listener;
            return this.eventEmitter;
        };
        /**
         * Starts listening for Ruling events
         * @param filter Optional filter for specific arbitrators or dispute IDs
         * @returns The event emitter
         */
        this.listenForRuling = (filter) => {
            // Create filter based on indexed fields
            const eventFilter = this.contract.filters.Ruling((filter === null || filter === void 0 ? void 0 : filter.arbitrator) || null, (filter === null || filter === void 0 ? void 0 : filter.disputeId) !== undefined
                ? ethers_1.ethers.BigNumber.from(filter.disputeId)
                : null);
            // Set up the listener
            const listener = (_arbitrator, _disputeID, _ruling, event) => {
                this.processRulingEvent(_arbitrator, _disputeID, _ruling, event);
            };
            // Register the listener
            this.contract.on(eventFilter, listener);
            // Store the listener for later removal
            const key = `Ruling:${(filter === null || filter === void 0 ? void 0 : filter.arbitrator) || "all"}:${(filter === null || filter === void 0 ? void 0 : filter.disputeId) || "all"}`;
            this.activeListeners[key] = listener;
            return this.eventEmitter;
        };
        /**
         * Stops listening for a specific event type with the given filter
         * @param eventType The type of event to stop listening for
         * @param filter The filter that was used when starting the listener
         */
        this.stopListening = (eventName, filter) => {
            let key = eventName;
            if (filter) {
                if (filter.transactionId) {
                    key += `:${filter.transactionId}`;
                }
                if (filter.party) {
                    key += `:${filter.party}`;
                }
                if (filter.arbitrator) {
                    key += `:${filter.arbitrator}`;
                }
                if (filter.disputeId !== undefined) {
                    key += `:${filter.disputeId}`;
                }
            }
            else {
                key += `:all`;
            }
            if (this.activeListeners[key]) {
                this.contract.off(eventName, this.activeListeners[key]);
                delete this.activeListeners[key];
            }
        };
        /**
         * Stops all active event listeners
         */
        this.stopAllListeners = () => {
            for (const key in this.activeListeners) {
                const [eventName] = key.split(":");
                this.contract.off(eventName, this.activeListeners[key]);
            }
            this.activeListeners = {};
        };
        /**
         * Process a MetaEvidence event and emit it
         */
        this.processMetaEvidenceEvent = async (_metaEvidenceID, _evidence, event) => {
            const block = await event.getBlock();
            const metaEvidenceEvent = {
                transactionId: _metaEvidenceID.toString(),
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                timestamp: block.timestamp,
                metaEvidenceId: _metaEvidenceID.toString(),
                evidence: _evidence,
            };
            this.eventEmitter.emit("MetaEvidence", metaEvidenceEvent);
        };
        /**
         * Process a Payment event and emit it
         */
        this.processPaymentEvent = async (_transactionID, _party, _amount, event) => {
            const block = await event.getBlock();
            const paymentEvent = {
                transactionId: _transactionID.toString(),
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                timestamp: block.timestamp,
                party: _party,
                amount: _amount.toString(),
            };
            this.eventEmitter.emit("Payment", paymentEvent);
        };
        /**
         * Process a HasToPayFee event and emit it
         */
        this.processHasToPayFeeEvent = async (_transactionID, _party, event) => {
            const block = await event.getBlock();
            const hasToPayFeeEvent = {
                transactionId: _transactionID.toString(),
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                timestamp: block.timestamp,
                party: _party, // Cast to Party enum
            };
            this.eventEmitter.emit("HasToPayFee", hasToPayFeeEvent);
        };
        /**
         * Process a Dispute event and emit it
         */
        this.processDisputeEvent = async (_arbitrator, _disputeID, _metaEvidenceID, _evidenceGroupID, event) => {
            const block = await event.getBlock();
            const disputeEvent = {
                transactionId: _metaEvidenceID.toString(),
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                timestamp: block.timestamp,
                disputeId: _disputeID.toNumber(),
                arbitrator: _arbitrator,
                metaEvidenceId: _metaEvidenceID.toString(),
                evidenceGroupId: _evidenceGroupID.toString(),
            };
            this.eventEmitter.emit("Dispute", disputeEvent);
        };
        /**
         * Process an Evidence event and emit it
         */
        this.processEvidenceEvent = async (_arbitrator, _party, _evidenceGroupID, _evidence, event) => {
            const block = await event.getBlock();
            const evidenceEvent = {
                transactionId: _evidenceGroupID.toString(), // In this contract, evidenceGroupId is the same as transactionId
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                timestamp: block.timestamp,
                party: _party,
                evidence: _evidence,
                arbitrator: _arbitrator,
                evidenceGroupId: _evidenceGroupID.toString(),
            };
            this.eventEmitter.emit("Evidence", evidenceEvent);
        };
        /**
         * Process a Ruling event and emit it
         */
        this.processRulingEvent = async (_arbitrator, _disputeID, _ruling, event) => {
            const block = await event.getBlock();
            // We need to find the transaction ID for this dispute
            // This requires an additional call to the contract
            let transactionId = "0";
            try {
                // This is a simplified approach - in a real implementation, you might want to use a more efficient method
                const count = await this.contract.getCountTransactions();
                for (let i = 0; i < count.toNumber(); i++) {
                    const tx = await this.contract.transactions(i);
                    if (tx.disputeId.eq(_disputeID)) {
                        transactionId = i.toString();
                        break;
                    }
                }
            }
            catch (error) {
                console.error("Error finding transaction ID for dispute:", error);
            }
            const rulingEvent = {
                transactionId,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                timestamp: block.timestamp,
                disputeId: _disputeID.toNumber(),
                ruling: _ruling.toNumber(), // Cast to Ruling enum
                arbitrator: _arbitrator,
            };
            this.eventEmitter.emit("Ruling", rulingEvent);
        };
        this.provider = new ethers_1.ethers.providers.JsonRpcProvider(config.provider.url, config.provider.networkId);
        this.contract = new ethers_1.ethers.Contract(config.multipleArbitrableTransaction.address, config.multipleArbitrableTransaction.abi, this.provider);
        this.eventEmitter = new events_1.EventEmitter();
    }
}
exports.EventListeners = EventListeners;
