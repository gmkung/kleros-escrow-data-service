import { ethers } from 'ethers';
import { ArbitrationFeePaymentParams, AppealParams } from '../types/dispute';
import { KlerosEscrowConfig } from '../types/config';
/**
 * Service for dispute-related actions in the Kleros Escrow contract
 */
export declare class DisputeActions {
    private provider;
    private contract;
    /**
     * Creates a new DisputeActions instance
     * @param config The Kleros Escrow configuration
     * @param signerOrProvider A signer or provider
     */
    constructor(config: KlerosEscrowConfig, signerOrProvider: ethers.Signer | ethers.providers.Provider);
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
