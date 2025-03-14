import { ethers } from "ethers";
import { KlerosEscrowConfig } from "../types/config";
import { BaseService } from "../base/BaseService";
import {
  BaseEvent,
  TransactionCreatedEvent,
  PaymentEvent,
  HasToPayFeeEvent,
  DisputeEvent,
  EvidenceEvent,
  RulingEvent,
  MetaEvidenceEvent,
} from "../types/events";
import { Party } from "../types/transaction";
import { Ruling } from "../types/dispute";

/**
 * Service for retrieving events from the Kleros Escrow contract
 */
export class EventService extends BaseService {
  /**
   * Creates a new EventService instance
   * @param config The Kleros Escrow configuration
   * @param provider Optional provider for read operations
   */
  constructor(
    config: KlerosEscrowConfig,
    provider?: ethers.providers.Provider
  ) {
    super(config, provider);
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
    try {
      // Get the latest block number to limit the search range
      let toBlock: number;
      try {
        const latestBlock = await this.provider.getBlock("latest");
        toBlock = latestBlock.number;
      } catch (error) {
        console.warn("Error getting latest block, using a default range:", error);
        // If we can't get the latest block, use a reasonable default
        toBlock = fromBlock + 1000000; // ~1 million blocks (~6 months)
      }

      // Limit the block range to prevent timeouts (max 100,000 blocks at a time)
      const MAX_BLOCK_RANGE = 100000;
      const effectiveToBlock = Math.min(fromBlock + MAX_BLOCK_RANGE, toBlock);
      
      console.log(`Searching for events from block ${fromBlock} to ${effectiveToBlock} (limited range)`);

      const events: BaseEvent[] = [];

      // Get all relevant event types with error handling
      let metaEvidenceEvents: MetaEvidenceEvent[] = [];
      let paymentEvents: PaymentEvent[] = [];
      let hasToPayFeeEvents: HasToPayFeeEvent[] = [];
      let disputeEvents: DisputeEvent[] = [];
      let evidenceEvents: EvidenceEvent[] = [];
      let rulingEvents: RulingEvent[] = [];

      try {
        metaEvidenceEvents = await this.getMetaEvidenceEvents(
          transactionId,
          fromBlock,
          effectiveToBlock
        );
        console.log(`Found ${metaEvidenceEvents.length} MetaEvidence events`);
      } catch (error) {
        console.warn("Error fetching MetaEvidence events:", error);
        metaEvidenceEvents = [];
      }

      try {
        paymentEvents = await this.getPaymentEvents(
          transactionId, 
          fromBlock,
          effectiveToBlock
        );
        console.log(`Found ${paymentEvents.length} Payment events`);
      } catch (error) {
        console.warn("Error fetching Payment events:", error);
        paymentEvents = [];
      }

      try {
        hasToPayFeeEvents = await this.getHasToPayFeeEvents(
          transactionId,
          fromBlock,
          effectiveToBlock
        );
        console.log(`Found ${hasToPayFeeEvents.length} HasToPayFee events`);
      } catch (error) {
        console.warn("Error fetching HasToPayFee events:", error);
        hasToPayFeeEvents = [];
      }

      try {
        disputeEvents = await this.getDisputeEvents(
          transactionId,
          fromBlock,
          effectiveToBlock
        );
        console.log(`Found ${disputeEvents.length} Dispute events`);
      } catch (error) {
        console.warn("Error fetching Dispute events:", error);
        disputeEvents = [];
      }

      try {
        evidenceEvents = await this.getEvidenceEvents(
          transactionId,
          fromBlock,
          effectiveToBlock
        );
        console.log(`Found ${evidenceEvents.length} Evidence events`);
      } catch (error) {
        console.warn("Error fetching Evidence events:", error);
        evidenceEvents = [];
      }

      try {
        rulingEvents = await this.getRulingEvents(
          transactionId,
          fromBlock,
          effectiveToBlock
        );
        console.log(`Found ${rulingEvents.length} Ruling events`);
      } catch (error) {
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
    } catch (error) {
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
  async getTransactionCreationEvents(
    fromBlock?: number,
    toBlock?: number
  ): Promise<ethers.Event[]> {
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
  async getMetaEvidenceEvents(
    transactionId: string,
    fromBlock: number = 0,
    toBlock?: number
  ): Promise<MetaEvidenceEvent[]> {
    try {
      const filter = this.escrowContract.filters.MetaEvidence(transactionId);
      const events = await this.escrowContract.queryFilter(filter, fromBlock, toBlock);

      const results: MetaEvidenceEvent[] = [];
      
      for (const event of events) {
        try {
          const block = await event.getBlock();
          
          results.push({
            transactionId,
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            timestamp: block.timestamp,
            metaEvidenceId: event.args?._metaEvidenceID.toString(),
            evidence: event.args?._evidence,
          });
        } catch (error) {
          console.warn(`Error processing MetaEvidence event at block ${event.blockNumber}:`, error);
          // Add the event with minimal information
          results.push({
            transactionId,
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            timestamp: 0, // Unknown timestamp
            metaEvidenceId: event.args?._metaEvidenceID.toString(),
            evidence: event.args?._evidence,
          });
        }
      }
      
      return results;
    } catch (error) {
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
  async getPaymentEvents(
    transactionId?: string,
    fromBlock?: number,
    toBlock?: number
  ): Promise<PaymentEvent[]> {
    try {
      const filter = this.escrowContract.filters.Payment(transactionId);
      const events = await this.escrowContract.queryFilter(
        filter,
        fromBlock,
        toBlock
      );

      const results: PaymentEvent[] = [];
      
      for (const event of events) {
        try {
          const block = await event.getBlock();
          
          results.push({
            transactionId: event.args?._transactionID.toString(),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            timestamp: block.timestamp,
            amount: event.args?._amount.toString(),
            party: event.args?._party,
          });
        } catch (error) {
          console.warn(`Error processing Payment event at block ${event.blockNumber}:`, error);
          // Add the event with minimal information
          results.push({
            transactionId: event.args?._transactionID.toString(),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            timestamp: 0, // Unknown timestamp
            amount: event.args?._amount.toString(),
            party: event.args?._party,
          });
        }
      }
      
      return results;
    } catch (error) {
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
  async getHasToPayFeeEvents(
    transactionId?: string,
    fromBlock?: number,
    toBlock?: number
  ): Promise<HasToPayFeeEvent[]> {
    try {
      const filter = this.escrowContract.filters.HasToPayFee(transactionId);
      const events = await this.escrowContract.queryFilter(
        filter,
        fromBlock,
        toBlock
      );

      const results: HasToPayFeeEvent[] = [];
      
      for (const event of events) {
        try {
          const block = await event.getBlock();
          
          results.push({
            transactionId: event.args?._transactionID.toString(),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            timestamp: block.timestamp,
            party: event.args?._party === 0 ? Party.Sender : Party.Receiver,
          });
        } catch (error) {
          console.warn(`Error processing HasToPayFee event at block ${event.blockNumber}:`, error);
          // Add the event with minimal information
          results.push({
            transactionId: event.args?._transactionID.toString(),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            timestamp: 0, // Unknown timestamp
            party: event.args?._party === 0 ? Party.Sender : Party.Receiver,
          });
        }
      }
      
      return results;
    } catch (error) {
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
  async getDisputeEvents(
    transactionId?: string,
    fromBlock?: number,
    toBlock?: number
  ): Promise<DisputeEvent[]> {
    try {
      // For Dispute events, we need to filter by _metaEvidenceID which is the transactionId
      const filter = this.escrowContract.filters.Dispute(null, transactionId);
      const events = await this.escrowContract.queryFilter(
        filter,
        fromBlock,
        toBlock
      );

      // If transactionId is provided, filter events by metaEvidenceID
      const relevantEvents = transactionId
        ? events.filter(
            (event) => event.args?._metaEvidenceID.toString() === transactionId
          )
        : events;

      const results: DisputeEvent[] = [];
      
      for (const event of relevantEvents) {
        try {
          const block = await event.getBlock();
          
          results.push({
            transactionId: event.args?._metaEvidenceID.toString(),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            timestamp: block.timestamp,
            disputeId: event.args?._disputeID.toNumber(),
            arbitrator: event.args?._arbitrator,
            metaEvidenceId: event.args?._metaEvidenceID.toString(),
            evidenceGroupId: event.args?._evidenceGroupID.toString(),
          });
        } catch (error) {
          console.warn(`Error processing Dispute event at block ${event.blockNumber}:`, error);
          // Add the event with minimal information
          results.push({
            transactionId: event.args?._metaEvidenceID.toString(),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            timestamp: 0, // Unknown timestamp
            disputeId: event.args?._disputeID.toNumber(),
            arbitrator: event.args?._arbitrator,
            metaEvidenceId: event.args?._metaEvidenceID.toString(),
            evidenceGroupId: event.args?._evidenceGroupID.toString(),
          });
        }
      }
      
      return results;
    } catch (error) {
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
  async getEvidenceEvents(
    transactionId?: string,
    fromBlock?: number,
    toBlock?: number
  ): Promise<EvidenceEvent[]> {
    try {
      // For Evidence events, we need to filter by _evidenceGroupID which is the transactionId
      // Handle the case where transactionId is "0" specially to avoid invalid address errors
      let filter;
      if (transactionId === "0") {
        // For transaction ID 0, we need a special approach
        // First get all Evidence events and then filter manually
        filter = this.escrowContract.filters.Evidence();
      } else {
        filter = this.escrowContract.filters.Evidence(
          null,
          null,
          transactionId
        );
      }
      
      const events = await this.escrowContract.queryFilter(
        filter,
        fromBlock,
        toBlock
      );

      // If transactionId is provided, filter events by evidenceGroupID
      const relevantEvents = transactionId
        ? events.filter(
            (event) => event.args?._evidenceGroupID.toString() === transactionId
          )
        : events;

      const results: EvidenceEvent[] = [];
      
      for (const event of relevantEvents) {
        try {
          const block = await event.getBlock();
          
          results.push({
            transactionId: event.args?._evidenceGroupID.toString(),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            timestamp: block.timestamp,
            party: event.args?._party,
            evidence: event.args?._evidence,
            arbitrator: event.args?._arbitrator,
            evidenceGroupId: event.args?._evidenceGroupID.toString(),
          });
        } catch (error) {
          console.warn(`Error processing Evidence event at block ${event.blockNumber}:`, error);
          // Add the event with minimal information
          results.push({
            transactionId: event.args?._evidenceGroupID.toString(),
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            timestamp: 0, // Unknown timestamp
            party: event.args?._party,
            evidence: event.args?._evidence,
            arbitrator: event.args?._arbitrator,
            evidenceGroupId: event.args?._evidenceGroupID.toString(),
          });
        }
      }
      
      return results;
    } catch (error) {
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
  async getRulingEvents(
    transactionId?: string,
    fromBlock?: number,
    toBlock?: number
  ): Promise<RulingEvent[]> {
    try {
      let disputeId: number | undefined;

      // If transactionId is provided, get the disputeId
      if (transactionId) {
        try {
          const tx = await this.escrowContract.transactions(transactionId);
          disputeId = tx.disputeId.toNumber();

          if (disputeId === 0) {
            return [];
          }
        } catch (error) {
          console.warn(`Error getting transaction ${transactionId} for dispute ID:`, error);
          return [];
        }
      }

      const filter = this.escrowContract.filters.Ruling(null, disputeId);
      const events = await this.escrowContract.queryFilter(
        filter,
        fromBlock,
        toBlock
      );

      const results: RulingEvent[] = [];
      
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
                if (tx.disputeId.eq(event.args?._disputeID)) {
                  txId = i.toString();
                  break;
                }
              }
            } catch (error) {
              console.error("Error finding transaction ID for dispute:", error);
              txId = "unknown";
            }
          }

          results.push({
            transactionId: txId || "unknown",
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            timestamp: block.timestamp,
            disputeId: event.args?._disputeID.toNumber(),
            ruling: event.args?._ruling.toNumber() as Ruling,
            arbitrator: event.args?._arbitrator,
          });
        } catch (error) {
          console.warn(`Error processing Ruling event at block ${event.blockNumber}:`, error);
          // Add the event with minimal information
          results.push({
            transactionId: transactionId || "unknown",
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            timestamp: 0, // Unknown timestamp
            disputeId: event.args?._disputeID.toNumber(),
            ruling: event.args?._ruling.toNumber() as Ruling,
            arbitrator: event.args?._arbitrator,
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error("Error in getRulingEvents:", error);
      return [];
    }
  }
}
