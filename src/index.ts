/**
 * Types for Kleros Escrow data service
 */
export interface EscrowTransaction {
  id: string;
  sender: string;
  receiver: string;
  amount: string;
  status: EscrowStatus;
  timeoutPayment: number;
  disputeId?: number;
  createdAt: number;
}

export enum EscrowStatus {
  Created = 'Created',
  Ongoing = 'Ongoing',
  Resolved = 'Resolved',
  Disputed = 'Disputed'
}

/**
 * Fetches an escrow transaction by ID
 * @param id The transaction ID to fetch
 * @returns The escrow transaction data
 */
export async function getEscrowById(id: string): Promise<EscrowTransaction | null> {
  // In a real implementation, this would query an API or blockchain
  // This is a placeholder implementation
  console.log(`Fetching escrow with ID: ${id}`);
  return null;
}

/**
 * Fetches all escrow transactions for a specific address
 * @param address The Ethereum address to query
 * @returns Array of escrow transactions
 */
export async function getEscrowsByAddress(address: string): Promise<EscrowTransaction[]> {
  // In a real implementation, this would query an API or blockchain
  // This is a placeholder implementation
  console.log(`Fetching escrows for address: ${address}`);
  return [];
}

// Export all types
export * from './types';

// Export all services (read functions)
export * from './services';

// Export all actions (write functions)
export * from './actions';

// Export a convenience function to create a complete Kleros Escrow client
import { ethers } from 'ethers';
import { KlerosEscrowConfig } from './types/config';
import { TransactionService, DisputeService, ArbitratorService, EventService } from './services';
import { TransactionActions, DisputeActions, EvidenceActions } from './actions';

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
  
  // Create write actions
  const transactionActions = new TransactionActions(config, signerOrProvider);
  const disputeActions = new DisputeActions(config, signerOrProvider);
  const evidenceActions = new EvidenceActions(config, signerOrProvider);
  
  return {
    // Read services
    services: {
      transaction: transactionService,
      dispute: disputeService,
      arbitrator: arbitratorService,
      event: eventService
    },
    
    // Write actions
    actions: {
      transaction: transactionActions,
      dispute: disputeActions,
      evidence: evidenceActions
    }
  };
} 