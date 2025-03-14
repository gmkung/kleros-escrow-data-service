import { ethers } from "ethers";
import { EventEmitter } from "events";
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
import { KlerosEscrowConfig } from "../types/config";

/**
 * Service for listening to events from the Kleros Escrow contract
 */
export class EventListeners {
  private provider: ethers.providers.Provider;
  private contract: ethers.Contract;
  private eventEmitter: EventEmitter;
  private activeListeners: { [key: string]: ethers.providers.Listener } = {};

  /**
   * Creates a new EventListeners instance
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

    this.eventEmitter = new EventEmitter();
  }

  /**
   * Starts listening for MetaEvidence events
   * @param filter Optional filter for specific transaction IDs
   * @returns The event emitter
   */
  listenForMetaEvidence = (filter?: {
    transactionId?: string;
  }): EventEmitter => {
    // Create filter based on indexed fields
    const eventFilter = this.contract.filters.MetaEvidence(
      filter?.transactionId ? ethers.BigNumber.from(filter.transactionId) : null
    );

    // Set up the listener
    const listener = (
      _metaEvidenceID: ethers.BigNumber,
      _evidence: string,
      event: ethers.Event
    ) => {
      this.processMetaEvidenceEvent(_metaEvidenceID, _evidence, event);
    };

    // Register the listener
    this.contract.on(eventFilter, listener);

    // Store the listener for later removal
    const key = `MetaEvidence:${filter?.transactionId || "all"}`;
    this.activeListeners[key] = listener;

    return this.eventEmitter;
  };

  /**
   * Starts listening for Payment events
   * @param filter Optional filter for specific transaction IDs or parties
   * @returns The event emitter
   */
  listenForPayment = (filter?: {
    transactionId?: string;
    party?: string;
  }): EventEmitter => {
    // Create filter based on indexed fields
    const eventFilter = this.contract.filters.Payment(
      filter?.transactionId
        ? ethers.BigNumber.from(filter.transactionId)
        : null,
      filter?.party || null
    );

    // Set up the listener
    const listener = (
      _transactionID: ethers.BigNumber,
      _party: string,
      _amount: ethers.BigNumber,
      event: ethers.Event
    ) => {
      this.processPaymentEvent(_transactionID, _party, _amount, event);
    };

    // Register the listener
    this.contract.on(eventFilter, listener);

    // Store the listener for later removal
    const key = `Payment:${filter?.transactionId || "all"}:${filter?.party || "all"}`;
    this.activeListeners[key] = listener;

    return this.eventEmitter;
  };

  /**
   * Starts listening for HasToPayFee events
   * @param filter Optional filter for specific transaction IDs or parties
   * @returns The event emitter
   */
  listenForHasToPayFee = (filter?: {
    transactionId?: string;
    party?: string;
  }): EventEmitter => {
    // Create filter based on indexed fields
    const eventFilter = this.contract.filters.HasToPayFee(
      filter?.transactionId
        ? ethers.BigNumber.from(filter.transactionId)
        : null,
      filter?.party || null
    );

    // Set up the listener
    const listener = (
      _transactionID: ethers.BigNumber,
      _party: string,
      event: ethers.Event
    ) => {
      this.processHasToPayFeeEvent(_transactionID, _party, event);
    };

    // Register the listener
    this.contract.on(eventFilter, listener);

    // Store the listener for later removal
    const key = `HasToPayFee:${filter?.transactionId || "all"}:${filter?.party || "all"}`;
    this.activeListeners[key] = listener;

    return this.eventEmitter;
  };

  /**
   * Starts listening for Dispute events
   * @param filter Optional filter for specific arbitrators or transaction IDs
   * @returns The event emitter
   */
  listenForDispute = (filter?: {
    arbitrator?: string;
    disputeId?: number;
  }): EventEmitter => {
    // Create filter based on indexed fields
    const eventFilter = this.contract.filters.Dispute(
      filter?.arbitrator || null,
      filter?.disputeId !== undefined
        ? ethers.BigNumber.from(filter.disputeId)
        : null
    );

    // Set up the listener
    const listener = (
      _arbitrator: string,
      _disputeID: ethers.BigNumber,
      _metaEvidenceID: ethers.BigNumber,
      _evidenceGroupID: ethers.BigNumber,
      event: ethers.Event
    ) => {
      this.processDisputeEvent(
        _arbitrator,
        _disputeID,
        _metaEvidenceID,
        _evidenceGroupID,
        event
      );
    };

    // Register the listener
    this.contract.on(eventFilter, listener);

    // Store the listener for later removal
    const key = `Dispute:${filter?.arbitrator || "all"}:${filter?.disputeId || "all"}`;
    this.activeListeners[key] = listener;

    return this.eventEmitter;
  };

  /**
   * Starts listening for Evidence events
   * @param filter Optional filter for specific arbitrators, parties, or evidence group IDs
   * @returns The event emitter
   */
  listenForEvidence = (filter?: {
    arbitrator?: string;
    party?: string;
    evidenceGroupId?: string;
  }): EventEmitter => {
    // Create filter based on indexed fields
    const eventFilter = this.contract.filters.Evidence(
      filter?.arbitrator || null,
      filter?.party || null,
      filter?.evidenceGroupId
        ? ethers.BigNumber.from(filter.evidenceGroupId)
        : null
    );

    // Set up the listener
    const listener = (
      _arbitrator: string,
      _party: string,
      _evidenceGroupID: ethers.BigNumber,
      _evidence: string,
      event: ethers.Event
    ) => {
      this.processEvidenceEvent(
        _arbitrator,
        _party,
        _evidenceGroupID,
        _evidence,
        event
      );
    };

    // Register the listener
    this.contract.on(eventFilter, listener);

    // Store the listener for later removal
    const key = `Evidence:${filter?.arbitrator || "all"}:${filter?.party || "all"}:${filter?.evidenceGroupId || "all"}`;
    this.activeListeners[key] = listener;

    return this.eventEmitter;
  };

  /**
   * Starts listening for Ruling events
   * @param filter Optional filter for specific arbitrators or dispute IDs
   * @returns The event emitter
   */
  listenForRuling = (filter?: {
    arbitrator?: string;
    disputeId?: number;
  }): EventEmitter => {
    // Create filter based on indexed fields
    const eventFilter = this.contract.filters.Ruling(
      filter?.arbitrator || null,
      filter?.disputeId !== undefined
        ? ethers.BigNumber.from(filter.disputeId)
        : null
    );

    // Set up the listener
    const listener = (
      _arbitrator: string,
      _disputeID: ethers.BigNumber,
      _ruling: ethers.BigNumber,
      event: ethers.Event
    ) => {
      this.processRulingEvent(_arbitrator, _disputeID, _ruling, event);
    };

    // Register the listener
    this.contract.on(eventFilter, listener);

    // Store the listener for later removal
    const key = `Ruling:${filter?.arbitrator || "all"}:${filter?.disputeId || "all"}`;
    this.activeListeners[key] = listener;

    return this.eventEmitter;
  };

  /**
   * Stops listening for a specific event type with the given filter
   * @param eventType The type of event to stop listening for
   * @param filter The filter that was used when starting the listener
   */
  stopListening = (eventName: string, filter?: any): void => {
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
    } else {
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
  stopAllListeners = (): void => {
    for (const key in this.activeListeners) {
      const [eventName] = key.split(":");
      this.contract.off(eventName, this.activeListeners[key]);
    }
    this.activeListeners = {};
  };

  /**
   * Process a MetaEvidence event and emit it
   */
  private processMetaEvidenceEvent = async (
    _metaEvidenceID: ethers.BigNumber,
    _evidence: string,
    event: ethers.Event
  ): Promise<void> => {
    const block = await event.getBlock();

    const metaEvidenceEvent: MetaEvidenceEvent = {
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
  private processPaymentEvent = async (
    _transactionID: ethers.BigNumber,
    _party: string,
    _amount: ethers.BigNumber,
    event: ethers.Event
  ): Promise<void> => {
    const block = await event.getBlock();

    const paymentEvent: PaymentEvent = {
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
  private processHasToPayFeeEvent = async (
    _transactionID: ethers.BigNumber,
    _party: string,
    event: ethers.Event
  ): Promise<void> => {
    const block = await event.getBlock();

    const hasToPayFeeEvent: HasToPayFeeEvent = {
      transactionId: _transactionID.toString(),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      timestamp: block.timestamp,
      party: _party as any, // Cast to Party enum
    };

    this.eventEmitter.emit("HasToPayFee", hasToPayFeeEvent);
  };

  /**
   * Process a Dispute event and emit it
   */
  private processDisputeEvent = async (
    _arbitrator: string,
    _disputeID: ethers.BigNumber,
    _metaEvidenceID: ethers.BigNumber,
    _evidenceGroupID: ethers.BigNumber,
    event: ethers.Event
  ): Promise<void> => {
    const block = await event.getBlock();

    const disputeEvent: DisputeEvent = {
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
  private processEvidenceEvent = async (
    _arbitrator: string,
    _party: string,
    _evidenceGroupID: ethers.BigNumber,
    _evidence: string,
    event: ethers.Event
  ): Promise<void> => {
    const block = await event.getBlock();

    const evidenceEvent: EvidenceEvent = {
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
  private processRulingEvent = async (
    _arbitrator: string,
    _disputeID: ethers.BigNumber,
    _ruling: ethers.BigNumber,
    event: ethers.Event
  ): Promise<void> => {
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
    } catch (error) {
      console.error("Error finding transaction ID for dispute:", error);
    }

    const rulingEvent: RulingEvent = {
      transactionId,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      timestamp: block.timestamp,
      disputeId: _disputeID.toNumber(),
      ruling: _ruling.toNumber() as any, // Cast to Ruling enum
      arbitrator: _arbitrator,
    };

    this.eventEmitter.emit("Ruling", rulingEvent);
  };
}
