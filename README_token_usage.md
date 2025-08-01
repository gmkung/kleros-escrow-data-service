# Kleros Escrow Data Service - Token Support

This package supports both ETH and ERC20 token transactions through separate clients. Both clients now provide full read and write capabilities when created with a signer.

## Installation

```bash
npm install kleros-escrow-data-service
```

## ETH Transactions (Original)

```typescript
import { createKlerosEscrowClient, KlerosEscrowConfig } from 'kleros-escrow-data-service';

const config: KlerosEscrowConfig = {
  provider: {
    url: 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
    networkId: 1
  },
  multipleArbitrableTransaction: {
    address: '0x0d67440946949FE293B45c52eFD8A9b3d51e2522',
    abi: MultipleArbitrableTransactionABI
  }
};

const client = createKlerosEscrowClient(config);

// Get ETH transaction
const transaction = await client.getTransaction('123');
console.log('ETH Amount:', transaction.amount);
```

## ERC20 Token Transactions (New)

```typescript
import { createKlerosEscrowTokenClient, KlerosEscrowConfig } from 'kleros-escrow-data-service';

const tokenConfig: KlerosEscrowConfig = {
  provider: {
    url: 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
    networkId: 1
  },
  multipleArbitrableTransactionToken: {
    address: '0x...',  // Token contract address
    abi: MultipleArbitrableTransactionTokenABI
  }
};

const tokenClient = createKlerosEscrowTokenClient(tokenConfig);

// Get token transaction
const tokenTransaction = await tokenClient.getTransaction('456');
console.log('Token Address:', tokenTransaction.token);
console.log('Token Amount:', tokenTransaction.amount);

// Get token information
const tokenInfo = await tokenClient.getTokenInfo(tokenTransaction.token);
console.log('Token Name:', tokenInfo.name);
console.log('Token Symbol:', tokenInfo.symbol);
console.log('Token Decimals:', tokenInfo.decimals);

// Check if client has write capabilities
if (tokenClient.canWrite()) {
  console.log('Token client has write access');
}
```

## Write Operations (New!)

Both ETH and Token clients now support write operations when created with a signer:

```typescript
import { ethers } from 'ethers';

// Create client with signer for write operations
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const tokenClientWithSigner = createKlerosEscrowTokenClient(tokenConfig, signer);

// Create token transaction (requires ERC20 approval first)
const result = await tokenClientWithSigner.actions.transaction.createTransaction({
  receiver: '0x...',
  timeoutPayment: 86400, // 24 hours
  metaEvidence: 'ipfs://...',
  amount: '1000000000000000000', // Token amount in smallest unit
  tokenAddress: '0x...' // ERC20 token contract
});

// Payment operations
await tokenClientWithSigner.actions.transaction.pay({
  transactionId: '1',
  amount: '500000000000000000' // Partial payment
});

// Dispute operations (fees paid in ETH)
await tokenClientWithSigner.actions.dispute.payArbitrationFeeBySender({
  transactionId: '1',
  value: '100000000000000000' // ETH for arbitration fees
});

// Evidence submission
await tokenClientWithSigner.actions.evidence.submitEvidence({
  transactionId: '1',
  evidence: 'ipfs://evidence-hash'
});
```

## Key Differences

Both clients now provide identical capabilities - the main difference is the type of assets they handle:

### Token Transaction Interface
```typescript
interface TokenTransaction {
  id: string;
  sender: string;
  receiver: string;
  amount: string;        // Amount in token's smallest unit
  token: string;         // ERC20 token contract address (NEW)
  status: TokenTransactionStatus;
  // ... other fields
}
```

### Additional Methods

**Token-specific methods:**
- `getTokenInfo(tokenAddress)` - Get ERC20 token details
- `getTransactionsByToken(tokenAddress)` - Filter by token contract
- `getAllTokenTransactions()` - Get all token transactions from subgraph

**Enhanced data:**
- `getEnhancedTokenTransaction(transactionId)` - Combines contract data with token info and events

**Write operations:**
- All transaction actions (create, pay, reimburse, execute, timeout)
- All dispute actions (arbitration fees, appeals)
- Evidence submission
- Full parity with ETH client capabilities

## Subgraph Integration

The token client automatically queries the token-specific subgraph:
- **ETH endpoint**: `https://api.studio.thegraph.com/query/74379/kleros-escrow-v1/version/latest`
- **Token endpoint**: `https://api.studio.thegraph.com/query/74379/kleros-escrow-v1-erc20-subgraph/version/latest`

## Examples

### Get all DAI transactions
```typescript
const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const daiTransactions = await tokenClient.getTransactionsByToken(daiAddress);
console.log(`Found ${daiTransactions.length} DAI transactions`);
```

### Get transactions by user address
```typescript
const userAddress = '0x...';
const userTransactions = await tokenClient.getTokenTransactionsByAddress(userAddress);
console.log(`User has ${userTransactions.length} token transactions`);
```

### Get enhanced transaction data
```typescript
const enhanced = await tokenClient.getEnhancedTokenTransaction('123');
console.log('Transaction:', enhanced);
console.log('Token Info:', enhanced.tokenInfo);
console.log('Events:', enhanced.events);
```

## Backward Compatibility

Existing code using `createKlerosEscrowClient()` continues to work without changes. The new token functionality is completely separate and opt-in.

## Type Safety

Both clients provide full TypeScript support with proper typing for ETH vs token transactions. 