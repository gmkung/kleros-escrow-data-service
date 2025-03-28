import { ethers } from 'ethers';

/**
 * Enum representing possible rulings in a dispute
 */
export enum Ruling {
  RefusedToRule = 0,
  SenderWins = 1,
  ReceiverWins = 2
}

/**
 * Enum representing the status of a dispute
 */
export enum DisputeStatus {
  Waiting = 'Waiting',
  Appealable = 'Appealable',
  Solved = 'Solved'
}

/**
 * Interface representing a dispute
 */
export interface Dispute {
  id: number;
  transactionId: string;
  status: DisputeStatus;
  ruling?: Ruling;
  arbitrator: string;
  arbitratorExtraData: string;
  evidenceGroupId: string;
  appealPeriodStart?: number;
  appealPeriodEnd?: number;
}

/**
 * Parameters for submitting evidence
 */
export interface EvidenceSubmissionParams {
  transactionId: string;
  evidence: string; // URI to evidence
}

/**
 * Parameters for paying arbitration fees
 */
export interface DisputeParams {
  transactionId: string;
  value: string; // Amount in Wei
}

/**
 * Parameters for appealing a ruling
 */
export interface AppealParams {
  transactionId: string;
  value: string; // Amount in Wei
} 