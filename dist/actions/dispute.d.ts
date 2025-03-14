import { ethers } from "ethers";
import { ArbitrationFeePaymentParams, AppealParams } from "../types/dispute";
import { KlerosEscrowConfig } from "../types/config";
import { BaseService } from "../base/BaseService";
/**
 * Service for dispute-related actions in the Kleros Escrow contract
 */
export declare class DisputeActions extends BaseService {
    /**
     * Creates a new DisputeActions instance
     * @param config The Kleros Escrow configuration
     * @param signer A signer for write operations
     */
    constructor(config: KlerosEscrowConfig, signer: ethers.Signer);
    /**
     * Pays arbitration fee as the sender to raise a dispute
     * @param params Parameters for paying the arbitration fee
     * @returns The transaction response
     */
    payArbitrationFeeBySender(params: ArbitrationFeePaymentParams): Promise<ethers.providers.TransactionResponse>;
    /**
     * Pays arbitration fee as the receiver to raise a dispute
     * @param params Parameters for paying the arbitration fee
     * @returns The transaction response
     */
    payArbitrationFeeByReceiver(params: ArbitrationFeePaymentParams): Promise<ethers.providers.TransactionResponse>;
    /**
     * Appeals a ruling
     * @param params Parameters for appealing
     * @returns The transaction response
     */
    appeal(params: AppealParams): Promise<ethers.providers.TransactionResponse>;
    /**
     * Estimates gas for paying arbitration fee as sender
     * @param params Parameters for paying the arbitration fee
     * @returns The estimated gas
     */
    estimateGasForPayArbitrationFeeBySender(params: ArbitrationFeePaymentParams): Promise<ethers.BigNumber>;
    /**
     * Estimates gas for paying arbitration fee as receiver
     * @param params Parameters for paying the arbitration fee
     * @returns The estimated gas
     */
    estimateGasForPayArbitrationFeeByReceiver(params: ArbitrationFeePaymentParams): Promise<ethers.BigNumber>;
    /**
     * Estimates gas for appealing a ruling
     * @param params Parameters for appealing
     * @returns The estimated gas
     */
    estimateGasForAppeal(params: AppealParams): Promise<ethers.BigNumber>;
}
