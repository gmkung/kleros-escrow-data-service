"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KlerosEscrowClient = void 0;
const transaction_1 = require("../services/transaction");
const dispute_1 = require("../services/dispute");
const arbitrator_1 = require("../services/arbitrator");
const event_1 = require("../services/event");
const ipfs_1 = require("../services/ipfs");
//actions imports
const transaction_2 = require("../actions/transaction");
const dispute_2 = require("../actions/dispute");
const evidence_1 = require("../actions/evidence");
// Import ABIs
const MultipleArbitrableTransaction_ABI_json_1 = __importDefault(require("../reference/MultipleArbitrableTransaction_ABI.json"));
const KlerosLiquid_ABI_json_1 = __importDefault(require("../reference/KlerosLiquid/KlerosLiquid_ABI.json"));
/**
 * Client for interacting with Kleros Escrow services
 */
class KlerosEscrowClient {
    /**
     * Creates a new KlerosEscrowClient
     * @param config The Kleros Escrow configuration
     * @param signer Optional signer for write operations
     */
    constructor(config, signer) {
        this.config = config;
        // Ensure the config has the necessary ABIs
        this.ensureConfigHasABIs();
        // Initialize all services
        this.services = {
            transaction: new transaction_1.TransactionService(config),
            dispute: new dispute_1.DisputeService(config),
            arbitrator: new arbitrator_1.ArbitratorService(config),
            event: new event_1.EventService(config),
            ipfs: new ipfs_1.IPFSService(config.ipfsGateway || "https://cdn.kleros.link"),
        };
        // Initialize actions if a signer is provided
        if (signer) {
            this.actions = {
                transaction: new transaction_2.TransactionActions(config, signer),
                dispute: new dispute_2.DisputeActions(config, signer),
                evidence: new evidence_1.EvidenceActions(config, signer),
            };
        }
    }
    /**
     * Ensures the configuration has the necessary ABIs
     * If ABIs are not provided, uses the default ones from the reference directory
     */
    ensureConfigHasABIs() {
        // Ensure MultipleArbitrableTransaction ABI
        if (!this.config.multipleArbitrableTransaction.abi) {
            this.config.multipleArbitrableTransaction.abi =
                MultipleArbitrableTransaction_ABI_json_1.default;
        }
        // Ensure Arbitrator ABI if it exists in the config
        if (this.config.arbitrator && !this.config.arbitrator.abi) {
            this.config.arbitrator.abi = KlerosLiquid_ABI_json_1.default;
        }
    }
    /**
     * Gets the configuration used by this client
     * @returns The Kleros Escrow configuration
     */
    getConfig() {
        return this.config;
    }
    /**
     * Checks if this client has write capabilities
     * @returns True if the client can perform write operations
     */
    canWrite() {
        return !!this.actions;
    }
    /**
     * Convenience method to get a transaction by ID
     * @param transactionId The ID of the transaction to fetch
     * @returns The transaction data
     */
    async getTransaction(transactionId) {
        return this.services.transaction.getTransaction(transactionId);
    }
    /**
     * Convenience method to get a dispute by transaction ID
     * @param transactionId The ID of the transaction
     * @returns The dispute data if it exists
     */
    async getDispute(transactionId) {
        return this.services.dispute.getDispute(transactionId);
    }
    /**
     * Convenience method to get the arbitrator information
     * @returns The arbitrator information
     */
    async getArbitrator() {
        return this.services.arbitrator.getArbitrator();
    }
    /**
     * Convenience method to fetch data from IPFS
     * @param path The IPFS path or CID
     * @returns The data from IPFS
     */
    async fetchFromIPFS(path) {
        return this.services.ipfs.fetchFromIPFS(path);
    }
}
exports.KlerosEscrowClient = KlerosEscrowClient;
