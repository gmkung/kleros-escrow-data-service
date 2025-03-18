// Export all types
export * from "./types";

// Export GraphQL response types
// export type { SubgraphResponse, RulingResponse } from "./services/event";

// Export all services (read functions)
export * from "./services";

// Export all actions (write functions)
export * from "./actions";

// Export the client
export * from "./client/KlerosEscrowClient";

// Export a convenience function to create a complete Kleros Escrow client
import { ethers } from "ethers";
import { KlerosEscrowConfig } from "./types/config";
import { KlerosEscrowClient } from "./client/KlerosEscrowClient";

/**
 * Creates a Kleros Escrow client
 * @param config The Kleros Escrow configuration
 * @param signer Optional signer for write operations
 * @returns A client for interacting with Kleros Escrow
 */
export function createKlerosEscrowClient(
  config: KlerosEscrowConfig,
  signer?: ethers.Signer
): KlerosEscrowClient {
  return new KlerosEscrowClient(config, signer);
}
