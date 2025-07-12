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
  abi?: any; // Optional - clients will use default ABIs if not provided
}

/**
 * Interface for service configuration
 */
export interface KlerosEscrowConfig {
  provider: ProviderConfig;
  multipleArbitrableTransactionEth?: ContractConfig;
  multipleArbitrableTransactionToken?: ContractConfig;
  arbitrator?: ContractConfig;
  ipfsGateway?: string;
  subgraphUrl?: string;
} 