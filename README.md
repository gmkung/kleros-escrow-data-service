# 🤝 Kleros Escrow Transaction Explorer

A comprehensive web app to explore and manage Kleros escrow transactions. Support for both ETH and ERC20 token transactions with dual client architecture.

## 🚀 Quick Start

```bash
# Install dependencies
yarn add kleros-escrow-data-service ethers@5 graphql-request graphql
```

## 📦 Initialize Kleros Clients

### ETH Transactions Client
```typescript
import { createKlerosEscrowEthClient } from "kleros-escrow-data-service";

const ethConfig = {
  provider: {
    url: "https://ethereum.publicnode.com",
    networkId: 1, // Ethereum mainnet
  },
  multipleArbitrableTransactionEth: {
    address: "0x0d67440946949FE293B45c52eFD8A9b3d51e2522",
  },
  ipfsGateway: "https://cdn.kleros.link",
  subgraphUrl: "https://api.studio.thegraph.com/query/74379/kleros-escrow-v1/version/latest",
};

const ethClient = createKlerosEscrowEthClient(ethConfig);
```

### Token Transactions Client
```typescript
import { createKlerosEscrowTokenClient } from "kleros-escrow-data-service";

const tokenConfig = {
  provider: {
    url: "https://ethereum.publicnode.com",
    networkId: 1,
  },
  multipleArbitrableTransactionToken: {
    address: "0x[TOKEN_CONTRACT_ADDRESS]",
  },
  ipfsGateway: "https://cdn.kleros.link",
  subgraphUrl: "https://api.studio.thegraph.com/query/74379/kleros-escrow-v1-erc20-subgraph/version/latest",
};

const tokenClient = createKlerosEscrowTokenClient(tokenConfig);
```

### With Wallet Support
```typescript
// For transactions requiring a signer
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const ethClientWithSigner = createKlerosEscrowEthClient(ethConfig, signer);
const tokenClientWithSigner = createKlerosEscrowTokenClient(tokenConfig, signer);
```

## 🔍 Core Functions & Types

### 1. ETH Transactions

#### Get All ETH Transactions
```typescript
const allEthTransactions = await ethClient.services.ethEvent.getAllEthMetaEvidence();

interface MetaEvidenceEvent {
  id: string;
  blockTimestamp: string;
  transactionHash: string;
  _evidence: string;
  blockNumber: string;
  _metaEvidenceID: string;
}
```

#### Get ETH Transaction Details
```typescript
const ethDetails = await ethClient.services.ethEvent.getEthTransactionDetails(transactionId);
```

### 2. Token Transactions

#### Get All Token Transactions
```typescript
const allTokenTransactions = await tokenClient.services.tokenEvent.getAllTokenTransactions();

interface TokenTransaction {
  id: string;
  blockTimestamp: string;
  transactionHash: string;
  _evidence: string;
  blockNumber: string;
  _metaEvidenceID: string;
  _token: string; // ERC20 token contract address
}
```

#### Get Token Transaction Details
```typescript
const tokenDetails = await tokenClient.services.tokenEvent.getTokenTransactionDetails(transactionId);
```

#### Get Transactions by Token Contract
```typescript
const usdcTransactions = await tokenClient.services.tokenEvent.getTransactionsByToken(
  "0xA0b86a33E6441000000"
);
```

#### Enhanced Token Transaction (with token info)
```typescript
const enhancedTx = await tokenClient.getEnhancedTokenTransaction(transactionId);

interface EnhancedTokenTransaction {
  transaction: TokenTransaction;
  metaEvidence: MetaEvidence;
  tokenInfo: {
    name: string;
    symbol: string;
    decimals: number;
  };
}
```

### 3. Shared Types

#### IPFS Meta Evidence
```typescript
interface MetaEvidence {
  category: string;
  title: string;
  description: string;
  question: string;
  rulingOptions: {
    type: string;
    titles: string[];
    descriptions: string[];
  };
  subCategory?: string;
  sender?: string;
  receiver?: string;
  amount?: string;
  timeout?: number;
  fileURI?: string;
  fileTypeExtension?: string;
}
```

#### Transaction Events
```typescript
interface TransactionEvents {
  metaEvidences: MetaEvidenceEvent[];
  payments: PaymentEvent[];
  evidences: EvidenceEvent[];
  disputes: DisputeEvent[];
  hasToPayFees: HasToPayFeesEvent[];
  rulings: RulingEvent[];
}
```

## 🏠 Implementation Guide

### Unified Transaction Explorer
```typescript
function UnifiedTransactionExplorer() {
  const [ethTransactions, setEthTransactions] = useState([]);
  const [tokenTransactions, setTokenTransactions] = useState([]);
  const [selectedType, setSelectedType] = useState('all'); // 'eth', 'token', 'all'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllTransactions = async () => {
      try {
        // Load ETH transactions
        const ethTx = await ethClient.services.ethEvent.getAllEthMetaEvidence();
        const processedEthTx = await Promise.all(
          ethTx.map(async (tx) => {
            const metaData = await safeLoadIPFS(tx._evidence);
            return {
              ...processTransactionData(tx, metaData),
              type: 'ETH',
              token: null,
            };
          })
        );

        // Load Token transactions
        const tokenTx = await tokenClient.services.tokenEvent.getAllTokenTransactions();
        const processedTokenTx = await Promise.all(
          tokenTx.map(async (tx) => {
            const metaData = await safeLoadIPFS(tx._evidence);
            const tokenInfo = await tokenClient.services.tokenTransaction.getTokenInfo(tx._token);
            return {
              ...processTransactionData(tx, metaData),
              type: 'TOKEN',
              token: {
                address: tx._token,
                ...tokenInfo,
              },
            };
          })
        );

        setEthTransactions(processedEthTx);
        setTokenTransactions(processedTokenTx);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    let transactions = [];
    
    if (selectedType === 'all' || selectedType === 'eth') {
      transactions = [...transactions, ...ethTransactions];
    }
    
    if (selectedType === 'all' || selectedType === 'token') {
      transactions = [...transactions, ...tokenTransactions];
    }
    
    return transactions.sort((a, b) => b.timestamp - a.timestamp);
  }, [ethTransactions, tokenTransactions, selectedType]);

  return (
    <div className="transaction-explorer">
      <div className="filter-controls">
        <button 
          className={selectedType === 'all' ? 'active' : ''}
          onClick={() => setSelectedType('all')}
        >
          All Transactions
        </button>
        <button 
          className={selectedType === 'eth' ? 'active' : ''}
          onClick={() => setSelectedType('eth')}
        >
          ETH Escrows
        </button>
        <button 
          className={selectedType === 'token' ? 'active' : ''}
          onClick={() => setSelectedType('token')}
        >
          Token Escrows
        </button>
      </div>

      <div className="transaction-grid">
        {filteredTransactions.map(tx => (
          <TransactionCard
            key={`${tx.type}-${tx.id}`}
            transaction={tx}
            onClick={() => openTransactionModal(tx)}
          />
        ))}
      </div>
    </div>
  );
}
```

### Transaction Card Component
```typescript
function TransactionCard({ transaction, onClick }) {
  const isToken = transaction.type === 'TOKEN';
  
  return (
    <div className={`card ${isToken ? 'token-card' : 'eth-card'}`} onClick={onClick}>
      <div className="card-header">
        <span className="transaction-type">
          {isToken ? transaction.token.symbol : 'ETH'}
        </span>
        <span className="transaction-id">#{transaction.id}</span>
      </div>
      
      <h3 className="transaction-title">{transaction.title}</h3>
      <p className="transaction-description">{transaction.description}</p>
      
      <div className="transaction-details">
        <div className="amount">
          <strong>
            {transaction.amount} {isToken ? transaction.token.symbol : 'ETH'}
          </strong>
        </div>
        <div className="category">{transaction.category}</div>
        {isToken && (
          <div className="token-info">
            <small>Token: {transaction.token.name}</small>
          </div>
        )}
      </div>
      
      <div className="card-footer">
        <time>{new Date(transaction.timestamp).toLocaleDateString()}</time>
        <span className="block-number">Block {transaction.blockNumber}</span>
      </div>
    </div>
  );
}
```

### Utility Functions
```typescript
// Safe IPFS Loading (shared for both clients)
const safeLoadIPFS = async (uri: string, client = ethClient) => {
  try {
    return await client.services.ipfs.fetchFromIPFS(uri);
  } catch (error) {
    console.error(`Failed to load IPFS content for ${uri}:`, error);
    return {
      title: 'Failed to load',
      description: 'Content unavailable',
      category: 'Unknown',
      amount: '0'
    };
  }
};

// Process transaction data (shared logic)
const processTransactionData = (tx, metaData) => ({
  id: tx._metaEvidenceID,
  timestamp: new Date(parseInt(tx.blockTimestamp) * 1000),
  title: metaData.title,
  description: metaData.description,
  amount: metaData.amount,
  category: metaData.category,
  sender: metaData.sender,
  receiver: metaData.receiver,
  transactionHash: tx.transactionHash,
  blockNumber: tx.blockNumber
});

// Token-specific utilities
const formatTokenAmount = (amount, decimals) => {
  return (parseFloat(amount) / Math.pow(10, decimals)).toFixed(4);
};

const getTokenDisplayInfo = (tokenAddress, tokenInfo) => ({
  displayAddress: `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`,
  displayName: `${tokenInfo.name} (${tokenInfo.symbol})`,
});
```

### Enhanced Styling
```css
.transaction-explorer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}

.filter-controls button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 6px;
  transition: all 0.2s;
}

.filter-controls button.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.transaction-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  border-color: var(--primary-color);
}

.eth-card {
  border-left: 4px solid #627eea;
}

.token-card {
  border-left: 4px solid #10b981;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.transaction-type {
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.token-info {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
  color: var(--text-secondary);
  font-size: 0.9rem;
}
```

## 💡 Best Practices

1. **Architecture**
   - Use separate clients for ETH and token transactions
   - Implement unified interfaces for shared functionality
   - Cache token info to avoid repeated contract calls
   - Handle both transaction types in UI components

2. **Performance**
   - Batch load transactions from both subgraphs
   - Implement virtual scrolling for large lists
   - Cache IPFS responses across both clients
   - Use token address as cache key for token info

3. **User Experience**
   - Visual distinction between ETH and token transactions
   - Show token symbols and names clearly
   - Format token amounts with correct decimals
   - Support filtering by transaction type and token

4. **Error Handling**
   - Graceful fallbacks for failed IPFS loads
   - Handle token contract call failures
   - Show loading states for both transaction types
   - Log errors with transaction type context

5. **Token-Specific Features**
   - Display token contract addresses
   - Show token metadata (name, symbol, decimals)
   - Group transactions by token type
   - Support token allowance checking for signers
