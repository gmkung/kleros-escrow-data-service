import { DisputeStatus } from './dispute';

/**
 * Interface for arbitrator information
 */
export interface Arbitrator {
  address: string;
  arbitrationCost: string;
  appealCost: string;
}

/**
 * Interface for dispute information from arbitrator
 */
export interface ArbitratorDispute {
  id: number;
  status: DisputeStatus;
  ruling: number;
  appealPeriodStart: number;
  appealPeriodEnd: number;
  arbitrated: string;
} 