export * from "./types";
export * from "./services";
export * from "./actions";
export * from "./listeners";
import { ethers } from "ethers";
import { KlerosEscrowConfig } from "./types/config";
import { TransactionService, DisputeService, ArbitratorService, EventService } from "./services";
import { TransactionActions, DisputeActions, EvidenceActions } from "./actions";
import { EventListeners } from "./listeners";
import { IPFSService } from "./services/ipfs";
/**
 * Creates a complete Kleros Escrow client with all services and actions
 * @param config The Kleros Escrow configuration
 * @param signerOrProvider A signer or provider
 * @returns An object containing all services and actions
 */
export declare function createKlerosEscrowClient(config: KlerosEscrowConfig, signerOrProvider: ethers.Signer | ethers.providers.Provider): {
    services: {
        transaction: TransactionService;
        dispute: DisputeService;
        arbitrator: ArbitratorService;
        event: EventService;
        ipfs: IPFSService;
    };
    actions: {
        transaction: TransactionActions;
        dispute: DisputeActions;
        evidence: EvidenceActions;
    };
    listeners: EventListeners;
};
