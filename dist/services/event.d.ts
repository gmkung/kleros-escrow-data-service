import { ethers } from "ethers";
import { KlerosEscrowConfig } from "../types/config";
import { BaseService } from "../base/BaseService";
import { BaseEvent, PaymentEvent, HasToPayFeeEvent, DisputeEvent, EvidenceEvent, RulingEvent, MetaEvidenceEvent } from "../types/events";
/**
 * Service for retrieving events from the Kleros Escrow contract
 */
export declare class EventService extends BaseService {
    /**
     * Creates a new EventService instance
     * @param config The Kleros Escrow configuration
     * @param provider Optional provider for read operations
     */
    constructor(config: KlerosEscrowConfig, provider?: ethers.providers.Provider);
    /**
     * Gets all events for a specific transaction
     * @param transactionId The ID of the transaction
     * @param fromBlock The starting block to search from (optional)
     * @returns All events related to the transaction
     */
    getEventsForTransaction(transactionId: string, fromBlock?: number): Promise<BaseEvent[]>;
    /**
     * Gets transaction creation events
     * @param fromBlock The block to start searching from
     * @param toBlock The block to end searching at
     * @returns An array of transaction creation events
     */
    getTransactionCreationEvents(fromBlock?: number, toBlock?: number): Promise<ethers.Event[]>;
    /**
     * Gets MetaEvidence events for a transaction
     * @param transactionId The ID of the transaction
     * @param fromBlock The starting block to search from
     * @param toBlock The ending block to search to
     * @returns Array of MetaEvidence events
     */
    getMetaEvidenceEvents(transactionId: string, fromBlock?: number, toBlock?: number): Promise<MetaEvidenceEvent[]>;
    /**
     * Gets payment events
     * @param transactionId The ID of the transaction
     * @param fromBlock The block to start searching from
     * @param toBlock The block to end searching at
     * @returns An array of payment events
     */
    getPaymentEvents(transactionId?: string, fromBlock?: number, toBlock?: number): Promise<PaymentEvent[]>;
    /**
     * Gets HasToPayFee events for a transaction
     * @param transactionId The ID of the transaction
     * @param fromBlock The starting block to search from
     * @param toBlock The ending block to search to
     * @returns Array of HasToPayFee events
     */
    getHasToPayFeeEvents(transactionId?: string, fromBlock?: number, toBlock?: number): Promise<HasToPayFeeEvent[]>;
    /**
     * Gets dispute creation events
     * @param transactionId The ID of the transaction
     * @param fromBlock The block to start searching from
     * @param toBlock The block to end searching at
     * @returns An array of dispute creation events
     */
    getDisputeEvents(transactionId?: string, fromBlock?: number, toBlock?: number): Promise<DisputeEvent[]>;
    /**
     * Gets evidence submission events
     * @param transactionId The ID of the transaction
     * @param fromBlock The block to start searching from
     * @param toBlock The block to end searching at
     * @returns An array of evidence submission events
     */
    getEvidenceEvents(transactionId?: string, fromBlock?: number, toBlock?: number): Promise<EvidenceEvent[]>;
    /**
     * Gets ruling events
     * @param transactionId The ID of the transaction
     * @param fromBlock The block to start searching from
     * @param toBlock The block to end searching at
     * @returns An array of ruling events
     */
    getRulingEvents(transactionId?: string, fromBlock?: number, toBlock?: number): Promise<RulingEvent[]>;
}
