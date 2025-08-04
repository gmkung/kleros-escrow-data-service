import { ethers } from "ethers";
import { KlerosEscrowConfig } from "../types/config";
import MultipleArbitrableTransactionABI from "../reference/MultipleArbitrableTransaction_ABI.json";
import MultipleArbitrableTransactionTokenABI from "../reference/MultipleArbitrableTransactionToken_ABI.json";

const DEFAULT_ETH_CONTRACT_ADDRESS = "0x0d67440946949FE293B45c52eFD8A9b3d51e2522";
const DEFAULT_TOKEN_CONTRACT_ADDRESS = "0xBCf0d1AD453728F75e9cFD4358ED187598A45e6c";

/**
 * Base class for all Kleros Escrow services and actions
 * Handles common initialization and provides shared utilities
 */
export abstract class BaseService {
  protected provider: ethers.providers.Provider;
  protected signer: ethers.Signer | null = null;
  protected escrowContract: ethers.Contract;
  protected arbitratorContract: ethers.Contract | null = null;
  protected isReadOnly: boolean;

  /**
   * Creates a new BaseService instance
   * @param config The Kleros Escrow configuration
   * @param signerOrProvider Optional signer for write operations, or provider for read-only operations
   */
  constructor(
    protected config: KlerosEscrowConfig,
    signerOrProvider?: ethers.Signer | ethers.providers.Provider
  ) {
    // If no signer or provider is provided, create a read-only provider
    if (!signerOrProvider) {
      this.provider = new ethers.providers.JsonRpcProvider(
        config.provider.url,
        config.provider.networkId
      );
      this.isReadOnly = true;
    }
    // If a signer is provided, use it and its provider
    else if (signerOrProvider instanceof ethers.Signer) {
      this.signer = signerOrProvider;
      this.provider = signerOrProvider.provider!;
      this.isReadOnly = false;
    }
    // If a provider is provided, use it
    else {
      this.provider = signerOrProvider;
      this.isReadOnly = true;
    }

    // Initialize the escrow contract with the appropriate signer or provider
    const contractProvider = this.signer || this.provider;
    
    // Determine which contract configuration to use (ETH or Token)
    let contractAddress: string;
    let contractABI: any[];
    
    if (config.multipleArbitrableTransactionToken) {
      // Use token contract configuration
      contractAddress = config.multipleArbitrableTransactionToken.address || DEFAULT_TOKEN_CONTRACT_ADDRESS;
      contractABI = config.multipleArbitrableTransactionToken.abi || MultipleArbitrableTransactionTokenABI;
    } else {
      // Use ETH contract configuration (default)
      contractAddress = config.multipleArbitrableTransactionEth?.address || DEFAULT_ETH_CONTRACT_ADDRESS;
      contractABI = config.multipleArbitrableTransactionEth?.abi || MultipleArbitrableTransactionABI;
    }

    console.log('Contract initialization:', {
      address: contractAddress,
      abiLength: contractABI.length,
      networkId: config.provider.networkId,
      isReadOnly: this.isReadOnly
    });

    this.escrowContract = new ethers.Contract(
      contractAddress,
      contractABI,
      contractProvider
    );

    // Verify contract initialization
    console.log('Contract functions available:', 
      Object.keys(this.escrowContract.functions).join(', ')
    );
  }

  /**
   * Gets the arbitrator address from the escrow contract
   * @returns The arbitrator address
   */
  protected async getArbitratorAddress(): Promise<string> {
    return await this.escrowContract.arbitrator();
  }

  /**
   * Gets the arbitrator extra data from the escrow contract
   * @returns The arbitrator extra data
   */
  protected async getArbitratorExtraData(): Promise<string> {
    return await this.escrowContract.arbitratorExtraData();
  }

  /**
   * Gets or initializes the arbitrator contract
   * @param abi The ABI to use for the arbitrator contract
   * @returns The arbitrator contract instance
   */
  protected async getArbitratorContract(
    abi: string[]
  ): Promise<ethers.Contract> {
    if (!this.arbitratorContract) {
      const arbitratorAddress = await this.getArbitratorAddress();
      const contractProvider = this.signer || this.provider;
      this.arbitratorContract = new ethers.Contract(
        arbitratorAddress,
        abi,
        contractProvider
      );
    }
    return this.arbitratorContract;
  }

  /**
   * Checks if this service can perform write operations
   * @returns True if the service has a signer and can perform write operations
   */
  protected canWrite(): boolean {
    return !this.isReadOnly && !!this.signer;
  }

  /**
   * Ensures that this service can perform write operations
   * @throws Error if the service is read-only
   */
  protected ensureCanWrite(): void {
    if (!this.canWrite()) {
      throw new Error(
        "This operation requires a signer. The service is in read-only mode."
      );
    }
  }
}
