export * from "./types";
export * from "./services";
export * from "./actions";
export * from "./client/KlerosEscrowClient";
import { ethers } from "ethers";
import { KlerosEscrowConfig } from "./types/config";
import { KlerosEscrowClient } from "./client/KlerosEscrowClient";
/**
 * Creates a Kleros Escrow client
 * @param config The Kleros Escrow configuration
 * @param signer Optional signer for write operations
 * @returns A client for interacting with Kleros Escrow
 */
export declare function createKlerosEscrowClient(config: KlerosEscrowConfig, signer?: ethers.Signer): KlerosEscrowClient;
