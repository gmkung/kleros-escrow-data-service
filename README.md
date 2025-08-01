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
    address: "0x0d67440946949FE293B45c52eFD8A9b3d51e2522", // Optional - has default
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
    address: "0xBCf0d1AD453728F75e9cFD4358ED187598A45e6c", // Optional - has default
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

## 🔍 Complete API Reference

### 1. ETH Client Methods

#### Client Creation
```typescript
const ethClient = createKlerosEscrowEthClient(config, signer?);
```

#### Core ETH Transaction Methods
```typescript
// Get ETH transaction by ID
const ethTransaction = await ethClient.getEthTransaction(transactionId);

interface Transaction {
  id: string;
  sender: string;
  receiver: string;
  amount: string; // Amount in Wei
  status: TransactionStatus;
  timeoutPayment: number;
  lastInteraction: number;
  createdAt: number;
  disputeId?: number;
  senderFee: string; // Amount in Wei
  receiverFee: string; // Amount in Wei
  metaEvidence?: string;
}

// Get ETH transactions by address
const ethTransactions = await ethClient.getEthTransactionsByAddress(address);
// Returns: Transaction[]
```

#### ETH Event/Subgraph Methods
```typescript
// Get all ETH meta evidence from subgraph
const allEthMetaEvidence = await ethClient.getAllEthMetaEvidence();

interface MetaEvidenceEvent {
  id: string;
  blockTimestamp: string;
  transactionHash: string;
  _evidence: string;
  blockNumber: string;
  _metaEvidenceID: string;
}

// Get complete ETH transaction details with all events
const ethDetails = await ethClient.getEthTransactionDetails(transactionId);

interface TransactionDetails {
  metaEvidences: MetaEvidenceEvent[];
  payments: PaymentEvent[];
  evidences: EvidenceEvent[];
  disputes: DisputeEvent[];
  hasToPayFees: HasToPayFeesEvent[];
  rulings: RulingEvent[];
}
```

### 2. Token Client Methods

#### Client Creation
```typescript
const tokenClient = createKlerosEscrowTokenClient(config, signer?);
```

#### Core Token Transaction Methods
```typescript
// Get token transaction by ID
const tokenTransaction = await tokenClient.getTokenTransaction(transactionId);

interface TokenTransaction {
  id: string;
  sender: string;
  receiver: string;
  amount: string; // Amount in token's smallest unit
  token: string; // ERC20 token contract address
  status: TokenTransactionStatus;
  timeoutPayment: number;
  lastInteraction: number;
  createdAt: number;
  disputeId?: number;
  senderFee: string; // Amount in Wei (for arbitration fees)
  receiverFee: string; // Amount in Wei (for arbitration fees)
  metaEvidence?: string;
}

// Get token transactions by address
const tokenTransactions = await tokenClient.getTransactionsByAddress(address);
// Returns: TokenTransaction[]

// Get token information
const tokenInfo = await tokenClient.getTokenInfo(tokenAddress);

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
}
```

#### Token Event/Subgraph Methods
```typescript
// Get all token meta evidence from subgraph
const allTokenMetaEvidence = await tokenClient.services.tokenEvent.getAllTokenMetaEvidence();

interface MetaEvidenceEvent {
  id: string;
  blockTimestamp: string;
  transactionHash: string;
  _evidence: string;
  blockNumber: string;
  _metaEvidenceID: string;
  _token?: string; // ERC20 token contract address (for token transactions)
}

// Get all token transactions from subgraph
const allTokenTransactions = await tokenClient.getAllTokenTransactions();

interface TokenSubgraphTransaction {
  id: string;
  _transactionID: string;
  _sender: string;
  _receiver: string;
  _token: string;
  _amount: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

// Get token transaction details with all events
const tokenDetails = await tokenClient.getTokenTransactionDetails(transactionId);
// Returns: TransactionDetails (same as ETH)

// Get token transactions by address from subgraph
const tokenTxByAddress = await tokenClient.getTokenTransactionsByAddress(address);
// Returns: TokenSubgraphTransaction[]

// Get transactions by token contract
const tokenTxByContract = await tokenClient.getTransactionsByToken(tokenAddress);
// Returns: TokenSubgraphTransaction[]

// Get enhanced token transaction (contract + subgraph + token info)
const enhancedTx = await tokenClient.getEnhancedTokenTransaction(transactionId);

interface EnhancedTokenTransaction extends TokenTransaction {
  tokenInfo?: TokenInfo;
  events: TransactionDetails;
}
```

### 3. Shared Client Methods

Both ETH and Token clients have these common methods:

```typescript
// Dispute methods
const dispute = await client.getDispute(transactionId);

interface Dispute {
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

// Arbitrator methods
const arbitrator = await client.getArbitrator();

interface Arbitrator {
  address: string;
  arbitrationCost: string;
  appealCost: string;
}

// IPFS methods
const ipfsData = await client.fetchFromIPFS(ipfsPath);
// Returns: any (parsed JSON data)

// Configuration
const config = client.getConfig();
// Returns: KlerosEscrowConfig

// Check write capabilities
const hasWriteAccess = client.canWrite();
// Returns: boolean (true if client was created with a signer)
```

### 4. Write Operations (Actions)

When either client is created with a signer, these write methods are available through the `actions` property. Both ETH and Token clients now support full write capabilities.

#### ETH Client Actions
```typescript
// Create ETH transaction
const result = await ethClient.actions.transaction.createTransaction({
  receiver: "0x...",
  timeoutPayment: 86400, // 24 hours
  metaEvidence: "ipfs://...",
  value: "1000000000000000000" // 1 ETH in Wei
});

interface CreateTransactionResult {
  transactionResponse: ethers.providers.TransactionResponse;
  transactionId: string;
}

// Payment actions
await ethClient.actions.transaction.pay({
  transactionId: "1",
  amount: "1000000000000000000" // Wei
});

await ethClient.actions.transaction.reimburse({
  transactionId: "1",
  amount: "1000000000000000000" // Wei
});

// Execution
await ethClient.actions.transaction.executeTransaction(transactionId);
await ethClient.actions.transaction.timeOutBySender(transactionId);
await ethClient.actions.transaction.timeOutByReceiver(transactionId);

// Dispute actions
await ethClient.actions.dispute.payArbitrationFeeBySender({
  transactionId: "1",
  value: "1000000000000000" // Wei
});

await ethClient.actions.dispute.payArbitrationFeeByReceiver({
  transactionId: "1",
  value: "1000000000000000" // Wei
});

await ethClient.actions.dispute.appeal({
  transactionId: "1",
  value: "2000000000000000" // Wei
});

// Evidence actions
await ethClient.actions.evidence.submitEvidence({
  transactionId: "1",
  evidence: "ipfs://..." // IPFS URI
});

// Gas estimation
const gasEstimate = await ethClient.actions.transaction.estimateGasForCreateTransaction(params);
// Returns: ethers.BigNumber

// Check if client has write capabilities
if (ethClient.canWrite()) {
  // Client has actions available
}
```

#### Token Client Actions

Token client now supports the same write operations as ETH client when created with a signer:

```typescript
// Create token transaction (requires prior token approval)
const result = await tokenClient.actions.transaction.createTransaction({
  receiver: "0x...",
  timeoutPayment: 86400, // 24 hours
  metaEvidence: "ipfs://...",
  amount: "1000000000000000000", // Token amount in smallest unit
  tokenAddress: "0x..." // ERC20 token contract address
});

// Payment actions (same interface as ETH client)
await tokenClient.actions.transaction.pay({
  transactionId: "1",
  amount: "1000000000000000000" // Token amount
});

await tokenClient.actions.transaction.reimburse({
  transactionId: "1", 
  amount: "1000000000000000000" // Token amount
});

// Execution and timeout actions
await tokenClient.actions.transaction.executeTransaction(transactionId);
await tokenClient.actions.transaction.timeOutBySender(transactionId);
await tokenClient.actions.transaction.timeOutByReceiver(transactionId);

// Dispute actions (arbitration fees paid in ETH)
await tokenClient.actions.dispute.payArbitrationFeeBySender({
  transactionId: "1",
  value: "1000000000000000" // Wei (arbitration fees always in ETH)
});

await tokenClient.actions.dispute.payArbitrationFeeByReceiver({
  transactionId: "1",
  value: "1000000000000000" // Wei
});

await tokenClient.actions.dispute.appeal({
  transactionId: "1",
  value: "2000000000000000" // Wei
});

// Evidence actions
await tokenClient.actions.evidence.submitEvidence({
  transactionId: "1",
  evidence: "ipfs://..." // IPFS URI
});

// Check write capabilities
if (tokenClient.canWrite()) {
  // Token client has full actions available
}
```

### 5. IPFS Data Structures

#### Meta Evidence (from IPFS)
```typescript
interface MetaEvidence {
  title: string;
  description: string;
  category: string;
  question: string;
  rulingOptions: {
    titles: string[];
    descriptions: string[];
  };
  fileURI?: string;
  fileTypeExtension?: string;
}

// Upload meta evidence to IPFS
const ipfsUri = await client.services.ipfs.uploadMetaEvidence({
  title: "Escrow Transaction",
  description: "Payment for services",
  category: "Service",
  question: "Should the receiver get the payment?",
  rulingOptions: {
    titles: ["Refund Sender", "Pay Receiver"],
    descriptions: ["Refund the sender", "Pay the receiver"]
  },
  fileURI: "https://...",
  fileTypeExtension: "pdf"
});
```

#### Evidence (from IPFS)
```typescript
interface Evidence {
  name: string;
  description: string;
  fileURI?: string;
  fileTypeExtension?: string;
}

// Upload evidence to IPFS
const evidenceUri = await client.services.ipfs.uploadEvidence({
  name: "Proof of Work",
  description: "Documentation showing work was completed",
  fileURI: "https://...",
  fileTypeExtension: "pdf"
});
```

### 6. Event Data Structures

```typescript
interface PaymentEvent {
  id: string;
  _transactionID: string;
  _amount: string;
  _party: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

interface EvidenceEvent {
  _arbitrator: string;
  _party: string;
  _evidence: string;
  _evidenceGroupID: string;
  blockNumber: string;
  transactionHash: string;
}

interface DisputeEvent {
  _arbitrator: string;
  _disputeID: string;
  blockNumber: string;
  blockTimestamp: string;
  _metaEvidenceID: string;
  _evidenceGroupID: string;
  transactionHash: string;
}

interface HasToPayFeesEvent {
  _transactionID: string;
  blockNumber: string;
  blockTimestamp: string;
  _party: string;
  transactionHash: string;
}

interface RulingEvent {
  _arbitrator: string;
  _disputeID: string;
  _ruling: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}
```

### 7. Enums & Constants

```typescript
enum TransactionStatus {
  NoDispute = 'NoDispute',
  WaitingSender = 'WaitingSender',
  WaitingReceiver = 'WaitingReceiver',
  DisputeCreated = 'DisputeCreated',
  Resolved = 'Resolved'
}

enum TokenTransactionStatus {
  NoDispute = 'NoDispute',
  WaitingSender = 'WaitingSender',
  WaitingReceiver = 'WaitingReceiver',
  DisputeCreated = 'DisputeCreated',
  Resolved = 'Resolved'
}

enum DisputeStatus {
  Waiting = 'Waiting',
  Appealable = 'Appealable',
  Solved = 'Solved'
}

enum Ruling {
  RefusedToRule = 0,
  SenderWins = 1,
  ReceiverWins = 2
}

enum Party {
  Sender = 'Sender',
  Receiver = 'Receiver'
}
```

### 8. Direct Service Access

If you need to access services directly instead of using client convenience methods:

```typescript
// ETH Client Services
const ethTransactionService = ethClient.services.ethTransaction;
const ethEventService = ethClient.services.ethEvent;
const disputeService = ethClient.services.dispute;
const arbitratorService = ethClient.services.arbitrator;
const ipfsService = ethClient.services.ipfs;

// Token Client Services
const tokenTransactionService = tokenClient.services.tokenTransaction;
const tokenEventService = tokenClient.services.tokenEvent;
// + same dispute, arbitrator, ipfs services

// Example: Direct service method calls
const ethTransaction = await ethTransactionService.getEthTransaction(transactionId);
const tokenTransaction = await tokenTransactionService.getTokenTransaction(transactionId);
const allEthMetaEvidence = await ethEventService.getAllEthMetaEvidence();
const allTokenMetaEvidence = await tokenEventService.getAllTokenMetaEvidence();
```

### 9. Configuration Interface

```typescript
interface KlerosEscrowConfig {
  provider: {
    url: string;
    networkId: number;
  };
  multipleArbitrableTransactionEth?: {
    address: string;
    abi?: any; // Optional - client uses default ABI
  };
  multipleArbitrableTransactionToken?: {
    address: string;
    abi?: any; // Optional - client uses default ABI
  };
  arbitrator?: {
    address: string;
    abi?: any; // Optional - client uses default ABI
  };
  ipfsGateway?: string; // Default: "https://cdn.kleros.link"
  subgraphUrl?: string; // Required for subgraph operations
}
```

### 10. Key Method Distinctions

**Contract vs Subgraph Methods:**
- **Contract methods** (e.g., `getEthTransaction`, `getTokenTransaction`) - Read from blockchain contracts, return structured data
- **Subgraph methods** (e.g., `getAllEthMetaEvidence`, `getAllTokenTransactions`) - Query GraphQL subgraph, return raw event data
- **Enhanced methods** (e.g., `getEnhancedTokenTransaction`) - Combine contract + subgraph + additional data

**Direct vs Convenience Methods:**
- **Client convenience methods** (e.g., `client.getEthTransaction()`) - Simplified access to common operations
- **Service methods** (e.g., `client.services.ethTransaction.getEthTransaction()`) - Direct service access with full control

**Read vs Write Operations:**
- **Read operations** - Available on all clients, query blockchain state
- **Write operations** (actions) - Only available when client created with signer, modify blockchain state

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
        // Load ETH meta evidence
        const ethMetaEvidence = await ethClient.getAllEthMetaEvidence();
        const processedEthTx = await Promise.all(
          ethMetaEvidence.map(async (tx) => {
            const metaData = await safeLoadIPFS(tx._evidence);
            return {
              ...processTransactionData(tx, metaData),
              type: 'ETH',
              token: null,
            };
          })
        );

        // Load Token meta evidence  
        const tokenMetaEvidence = await tokenClient.services.tokenEvent.getAllTokenMetaEvidence();
        const processedTokenTx = await Promise.all(
          tokenMetaEvidence.map(async (tx) => {
            const metaData = await safeLoadIPFS(tx._evidence);
            const tokenInfo = await tokenClient.getTokenInfo(tx._token);
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
    return await client.fetchFromIPFS(uri);
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
