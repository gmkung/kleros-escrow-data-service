import { EventEmitter } from "events";
import { KlerosEscrowConfig } from "../types/config";
/**
 * Service for listening to events from the Kleros Escrow contract
 */
export declare class EventListeners {
    private provider;
    private contract;
    private eventEmitter;
    private activeListeners;
    /**
     * Creates a new EventListeners instance
     * @param config The Kleros Escrow configuration
     */
    constructor(config: KlerosEscrowConfig);
    /**
     * Starts listening for MetaEvidence events
     * @param filter Optional filter for specific transaction IDs
     * @returns The event emitter
     */
    listenForMetaEvidence: (filter?: {
        transactionId?: string;
    }) => EventEmitter;
    /**
     * Starts listening for Payment events
     * @param filter Optional filter for specific transaction IDs or parties
     * @returns The event emitter
     */
    listenForPayment: (filter?: {
        transactionId?: string;
        party?: string;
    }) => EventEmitter;
    /**
     * Starts listening for HasToPayFee events
     * @param filter Optional filter for specific transaction IDs or parties
     * @returns The event emitter
     */
    listenForHasToPayFee: (filter?: {
        transactionId?: string;
        party?: string;
    }) => EventEmitter;
    /**
     * Starts listening for Dispute events
     * @param filter Optional filter for specific arbitrators or transaction IDs
     * @returns The event emitter
     */
    listenForDispute: (filter?: {
        arbitrator?: string;
        disputeId?: number;
    }) => EventEmitter;
    /**
     * Starts listening for Evidence events
     * @param filter Optional filter for specific arbitrators, parties, or evidence group IDs
     * @returns The event emitter
     */
    listenForEvidence: (filter?: {
        arbitrator?: string;
        party?: string;
        evidenceGroupId?: string;
    }) => EventEmitter;
    /**
     * Starts listening for Ruling events
     * @param filter Optional filter for specific arbitrators or dispute IDs
     * @returns The event emitter
     */
    listenForRuling: (filter?: {
        arbitrator?: string;
        disputeId?: number;
    }) => EventEmitter;
    /**
     * Stops listening for a specific event type with the given filter
     * @param eventType The type of event to stop listening for
     * @param filter The filter that was used when starting the listener
     */
    stopListening: (eventName: string, filter?: any) => void;
    /**
     * Stops all active event listeners
     */
    stopAllListeners: () => void;
    /**
     * Process a MetaEvidence event and emit it
     */
    private processMetaEvidenceEvent;
    /**
     * Process a Payment event and emit it
     */
    private processPaymentEvent;
    /**
     * Process a HasToPayFee event and emit it
     */
    private processHasToPayFeeEvent;
    /**
     * Process a Dispute event and emit it
     */
    private processDisputeEvent;
    /**
     * Process an Evidence event and emit it
     */
    private processEvidenceEvent;
    /**
     * Process a Ruling event and emit it
     */
    private processRulingEvent;
}
