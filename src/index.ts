// Export all types
export * from "./types";

// Export GraphQL response types
// export type { SubgraphResponse, RulingResponse } from "./services/event";

// Export all services (read functions)
export * from "./services";

// Export all actions (write functions)
export * from "./actions";

// Export the clients
export * from "./client/KlerosEscrowEthClient";
export * from "./client/KlerosEscrowTokenClient";

// Export convenience functions to create clients
import { ethers } from "ethers";
import { KlerosEscrowConfig } from "./types/config";
import { KlerosEscrowEthClient } from "./client/KlerosEscrowEthClient";
import { KlerosEscrowTokenClient } from "./client/KlerosEscrowTokenClient";

/**
 * Creates a Kleros Escrow ETH client for ETH transactions
 * @param config The Kleros Escrow configuration
 * @param signer Optional signer for write operations
 * @returns A client for interacting with Kleros Escrow ETH transactions
 */
export function createKlerosEscrowEthClient(
  config: KlerosEscrowConfig,
  signer?: ethers.Signer
): KlerosEscrowEthClient {
  return new KlerosEscrowEthClient(config, signer);
}

/**
 * Creates a Kleros Escrow Token client for ERC20 token transactions
 * @param config The Kleros Escrow configuration (must include multipleArbitrableTransactionToken)
 * @param signer Optional signer for write operations
 * @returns A client for interacting with Kleros Escrow Token transactions
 */
export function createKlerosEscrowTokenClient(
  config: KlerosEscrowConfig,
  signer?: ethers.Signer
): KlerosEscrowTokenClient {
  return new KlerosEscrowTokenClient(config, signer);
}
