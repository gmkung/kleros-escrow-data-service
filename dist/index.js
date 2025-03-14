"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKlerosEscrowClient = createKlerosEscrowClient;
// Export all types
__exportStar(require("./types"), exports);
// Export all services (read functions)
__exportStar(require("./services"), exports);
// Export all actions (write functions)
__exportStar(require("./actions"), exports);
// Export event listeners
__exportStar(require("./listeners"), exports);
const services_1 = require("./services");
const actions_1 = require("./actions");
const listeners_1 = require("./listeners");
const ipfs_1 = require("./services/ipfs");
/**
 * Creates a complete Kleros Escrow client with all services and actions
 * @param config The Kleros Escrow configuration
 * @param signerOrProvider A signer or provider
 * @returns An object containing all services and actions
 */
function createKlerosEscrowClient(config, signerOrProvider) {
    // Create read-only services
    const transactionService = new services_1.TransactionService(config);
    const disputeService = new services_1.DisputeService(config);
    const arbitratorService = new services_1.ArbitratorService(config);
    const eventService = new services_1.EventService(config);
    const ipfsService = new ipfs_1.IPFSService(config.ipfsGateway);
    // Create write actions
    const transactionActions = new actions_1.TransactionActions(config, signerOrProvider);
    const disputeActions = new actions_1.DisputeActions(config, signerOrProvider);
    const evidenceActions = new actions_1.EvidenceActions(config, signerOrProvider);
    // Create event listeners
    const eventListeners = new listeners_1.EventListeners(config);
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
