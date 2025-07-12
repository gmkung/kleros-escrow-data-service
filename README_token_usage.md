# Kleros Escrow Data Service - Token Support

This package now supports both ETH and ERC20 token transactions through separate clients.

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
```

## Key Differences

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
- `getEnhancedTransaction(transactionId)` - Combines contract data with token info and events

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
const enhanced = await tokenClient.getEnhancedTransaction('123');
console.log('Transaction:', enhanced);
console.log('Token Info:', enhanced.tokenInfo);
console.log('Events:', enhanced.events);
```

## Backward Compatibility

Existing code using `createKlerosEscrowClient()` continues to work without changes. The new token functionality is completely separate and opt-in.

## Type Safety

Both clients provide full TypeScript support with proper typing for ETH vs token transactions. 