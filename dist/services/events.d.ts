import { BaseEvent, PaymentEvent, HasToPayFeeEvent, DisputeEvent, EvidenceEvent, RulingEvent, MetaEvidenceEvent } from '../types/events';
import { KlerosEscrowConfig } from '../types/config';
/**
 * Service for fetching events from the Kleros Escrow contract
 */
export declare class EventService {
    private provider;
    private contract;
    /**
     * Creates a new EventService instance
     * @param config The Kleros Escrow configuration
     */
    constructor(config: KlerosEscrowConfig);
    /**
     * Gets all events for a specific transaction
     * @param transactionId The ID of the transaction
     * @param fromBlock The starting block to search from (optional)
     * @returns All events related to the transaction
     */
    getEventsForTransaction(transactionId: string, fromBlock?: number): Promise<BaseEvent[]>;
    /**
     * Gets MetaEvidence events for a transaction
     * @param transactionId The ID of the transaction
     * @param fromBlock The starting block to search from
     * @returns Array of MetaEvidence events
     */
    getMetaEvidenceEvents(transactionId: string, fromBlock?: number): Promise<MetaEvidenceEvent[]>;
    /**
     * Gets Payment events for a transaction
     * @param transactionId The ID of the transaction
     * @param fromBlock The starting block to search from
     * @returns Array of Payment events
     */
    getPaymentEvents(transactionId: string, fromBlock?: number): Promise<PaymentEvent[]>;
    /**
     * Gets HasToPayFee events for a transaction
     * @param transactionId The ID of the transaction
     * @param fromBlock The starting block to search from
     * @returns Array of HasToPayFee events
     */
    getHasToPayFeeEvents(transactionId: string, fromBlock?: number): Promise<HasToPayFeeEvent[]>;
    /**
     * Gets Dispute events for a transaction
     * @param transactionId The ID of the transaction
     * @param fromBlock The starting block to search from
     * @returns Array of Dispute events
     */
    getDisputeEvents(transactionId: string, fromBlock?: number): Promise<DisputeEvent[]>;
    /**
     * Gets Evidence events for a transaction
     * @param transactionId The ID of the transaction
     * @param fromBlock The starting block to search from
     * @returns Array of Evidence events
     */
    getEvidenceEvents(transactionId: string, fromBlock?: number): Promise<EvidenceEvent[]>;
    /**
     * Gets Ruling events for a transaction
     * @param transactionId The ID of the transaction
     * @param fromBlock The starting block to search from
     * @returns Array of Ruling events
     */
    getRulingEvents(transactionId: string, fromBlock?: number): Promise<RulingEvent[]>;
}
