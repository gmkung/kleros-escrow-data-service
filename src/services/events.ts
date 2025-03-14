import { ethers } from 'ethers';
import { 
  BaseEvent, 
  TransactionCreatedEvent, 
  PaymentEvent, 
  HasToPayFeeEvent,
  DisputeEvent,
  EvidenceEvent,
  RulingEvent,
  MetaEvidenceEvent
} from '../types/events';
import { Party } from '../types/transaction';
import { Ruling } from '../types/dispute';
import { KlerosEscrowConfig } from '../types/config';

/**
 * Service for fetching events from the Kleros Escrow contract
 */
export class EventService {
  private provider: ethers.providers.Provider;
  private contract: ethers.Contract;

  /**
   * Creates a new EventService instance
   * @param config The Kleros Escrow configuration
   */
  constructor(config: KlerosEscrowConfig) {
    this.provider = new ethers.providers.JsonRpcProvider(
      config.provider.url,
      config.provider.networkId
    );
    
    this.contract = new ethers.Contract(
      config.multipleArbitrableTransaction.address,
      config.multipleArbitrableTransaction.abi,
      this.provider
    );
  }

  /**
   * Gets all events for a specific transaction
   * @param transactionId The ID of the transaction
   * @param fromBlock The starting block to search from (optional)
   * @returns All events related to the transaction
   */
  async getEventsForTransaction(
    transactionId: string,
    fromBlock: number = 0
  ): Promise<BaseEvent[]> {
    const events: BaseEvent[] = [];
    
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
  async getMetaEvidenceEvents(
    transactionId: string,
    fromBlock: number = 0
  ): Promise<MetaEvidenceEvent[]> {
    const filter = this.contract.filters.MetaEvidence(transactionId);
    const events = await this.contract.queryFilter(filter, fromBlock);
    
    return Promise.all(events.map(async (event) => {
      const block = await event.getBlock();
      
      return {
        transactionId,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: block.timestamp,
        metaEvidenceId: event.args?._metaEvidenceID.toString(),
        evidence: event.args?._evidence
      };
    }));
  }

  /**
   * Gets Payment events for a transaction
   * @param transactionId The ID of the transaction
   * @param fromBlock The starting block to search from
   * @returns Array of Payment events
   */
  async getPaymentEvents(
    transactionId: string,
    fromBlock: number = 0
  ): Promise<PaymentEvent[]> {
    const filter = this.contract.filters.Payment(transactionId);
    const events = await this.contract.queryFilter(filter, fromBlock);
    
    return Promise.all(events.map(async (event) => {
      const block = await event.getBlock();
      
      return {
        transactionId,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: block.timestamp,
        amount: event.args?._amount.toString(),
        party: event.args?._party
      };
    }));
  }

  /**
   * Gets HasToPayFee events for a transaction
   * @param transactionId The ID of the transaction
   * @param fromBlock The starting block to search from
   * @returns Array of HasToPayFee events
   */
  async getHasToPayFeeEvents(
    transactionId: string,
    fromBlock: number = 0
  ): Promise<HasToPayFeeEvent[]> {
    const filter = this.contract.filters.HasToPayFee(transactionId);
    const events = await this.contract.queryFilter(filter, fromBlock);
    
    return Promise.all(events.map(async (event) => {
      const block = await event.getBlock();
      
      return {
        transactionId,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: block.timestamp,
        party: event.args?._party === 0 ? Party.Sender : Party.Receiver
      };
    }));
  }

  /**
   * Gets Dispute events for a transaction
   * @param transactionId The ID of the transaction
   * @param fromBlock The starting block to search from
   * @returns Array of Dispute events
   */
  async getDisputeEvents(
    transactionId: string,
    fromBlock: number = 0
  ): Promise<DisputeEvent[]> {
    // For Dispute events, we need to filter by _metaEvidenceID which is the transactionId
    // This is a bit more complex as we need to check all Dispute events
    const allDisputeEvents = await this.contract.queryFilter(
      this.contract.filters.Dispute(),
      fromBlock
    );
    
    const relevantEvents = allDisputeEvents.filter(
      event => event.args?._metaEvidenceID.toString() === transactionId
    );
    
    return Promise.all(relevantEvents.map(async (event) => {
      const block = await event.getBlock();
      
      return {
        transactionId,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: block.timestamp,
        disputeId: event.args?._disputeID.toNumber(),
        arbitrator: event.args?._arbitrator,
        metaEvidenceId: event.args?._metaEvidenceID.toString(),
        evidenceGroupId: event.args?._evidenceGroupID.toString()
      };
    }));
  }

  /**
   * Gets Evidence events for a transaction
   * @param transactionId The ID of the transaction
   * @param fromBlock The starting block to search from
   * @returns Array of Evidence events
   */
  async getEvidenceEvents(
    transactionId: string,
    fromBlock: number = 0
  ): Promise<EvidenceEvent[]> {
    // For Evidence events, we need to filter by _evidenceGroupID which is the transactionId
    const allEvidenceEvents = await this.contract.queryFilter(
      this.contract.filters.Evidence(),
      fromBlock
    );
    
    const relevantEvents = allEvidenceEvents.filter(
      event => event.args?._evidenceGroupID.toString() === transactionId
    );
    
    return Promise.all(relevantEvents.map(async (event) => {
      const block = await event.getBlock();
      
      return {
        transactionId,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: block.timestamp,
        party: event.args?._party,
        evidence: event.args?._evidence,
        arbitrator: event.args?._arbitrator,
        evidenceGroupId: event.args?._evidenceGroupID.toString()
      };
    }));
  }

  /**
   * Gets Ruling events for a transaction
   * @param transactionId The ID of the transaction
   * @param fromBlock The starting block to search from
   * @returns Array of Ruling events
   */
  async getRulingEvents(
    transactionId: string,
    fromBlock: number = 0
  ): Promise<RulingEvent[]> {
    // For Ruling events, we need to get the disputeId first
    const tx = await this.contract.transactions(transactionId);
    const disputeId = tx.disputeId.toNumber();
    
    if (disputeId === 0) {
      return [];
    }
    
    const filter = this.contract.filters.Ruling(null, disputeId);
    const events = await this.contract.queryFilter(filter, fromBlock);
    
    return Promise.all(events.map(async (event) => {
      const block = await event.getBlock();
      
      return {
        transactionId,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        timestamp: block.timestamp,
        disputeId: event.args?._disputeID.toNumber(),
        ruling: event.args?._ruling.toNumber() as Ruling,
        arbitrator: event.args?._arbitrator
      };
    }));
  }
} 