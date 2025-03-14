import { Party } from './transaction';
import { Ruling } from './dispute';
/**
 * Base interface for all events
 */
export interface BaseEvent {
    transactionId: string;
    blockNumber: number;
    transactionHash: string;
    timestamp: number;
}
/**
 * Interface for transaction creation events
 */
export interface TransactionCreatedEvent extends BaseEvent {
    sender: string;
    receiver: string;
    amount: string;
    timeoutPayment: number;
}
/**
 * Interface for payment events
 */
export interface PaymentEvent extends BaseEvent {
    amount: string;
    party: string;
}
/**
 * Interface for fee payment requirement events
 */
export interface HasToPayFeeEvent extends BaseEvent {
    party: Party;
}
/**
 * Interface for dispute creation events
 */
export interface DisputeEvent extends BaseEvent {
    disputeId: number;
    arbitrator: string;
    metaEvidenceId: string;
    evidenceGroupId: string;
}
/**
 * Interface for evidence submission events
 */
export interface EvidenceEvent extends BaseEvent {
    party: string;
    evidence: string;
    arbitrator: string;
    evidenceGroupId: string;
}
/**
 * Interface for ruling events
 */
export interface RulingEvent extends BaseEvent {
    disputeId: number;
    ruling: Ruling;
    arbitrator: string;
}
/**
 * Interface for meta-evidence events
 */
export interface MetaEvidenceEvent extends BaseEvent {
    metaEvidenceId: string;
    evidence: string;
}
