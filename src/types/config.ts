/**
 * Interface for provider configuration
 */
export interface ProviderConfig {
  url: string;
  networkId: number;
  timeout?: number;
}

/**
 * Interface for contract configuration
 */
export interface ContractConfig {
  address: string;
  abi: any;
}

/**
 * Interface for service configuration
 */
export interface KlerosEscrowConfig {
  provider: ProviderConfig;
  multipleArbitrableTransaction?: ContractConfig;
  arbitrator?: ContractConfig;
  ipfsGateway?: string;
} 