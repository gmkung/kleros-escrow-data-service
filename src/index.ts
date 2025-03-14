// Export all types
export * from "./types";

// Export all services (read functions)
export * from "./services";

// Export all actions (write functions)
export * from "./actions";

// Export event listeners
export * from "./listeners";

// Export a convenience function to create a complete Kleros Escrow client
import { ethers } from "ethers";
import { KlerosEscrowConfig } from "./types/config";
import {
  TransactionService,
  DisputeService,
  ArbitratorService,
  EventService,
} from "./services";
import { TransactionActions, DisputeActions, EvidenceActions } from "./actions";
import { EventListeners } from "./listeners";
import { IPFSService } from "./services/ipfs";

/**
 * Creates a complete Kleros Escrow client with all services and actions
 * @param config The Kleros Escrow configuration
 * @param signerOrProvider A signer or provider
 * @returns An object containing all services and actions
 */
export function createKlerosEscrowClient(
  config: KlerosEscrowConfig,
  signerOrProvider: ethers.Signer | ethers.providers.Provider
) {
  // Create read-only services
  const transactionService = new TransactionService(config);
  const disputeService = new DisputeService(config);
  const arbitratorService = new ArbitratorService(config);
  const eventService = new EventService(config);
  const ipfsService = new IPFSService(config.ipfsGateway);

  // Create write actions
  const transactionActions = new TransactionActions(config, signerOrProvider);
  const disputeActions = new DisputeActions(config, signerOrProvider);
  const evidenceActions = new EvidenceActions(config, signerOrProvider);

  // Create event listeners
  const eventListeners = new EventListeners(config);

  return {
    // Read services
    services: {
      transaction: transactionService,
      dispute: disputeService,
      arbitrator: arbitratorService,
      event: eventService,
      ipfs: ipfsService,
    },

    // Write actions
    actions: {
      transaction: transactionActions,
      dispute: disputeActions,
      evidence: evidenceActions,
    },

    // Event listeners
    listeners: eventListeners,
  };
}
