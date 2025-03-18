# 🤝 Kleros Escrow Transaction Explorer

A lovable web app to explore and manage Kleros escrow transactions. View all transactions or look up specific ones by ID.

## 🚀 Quick Start

```bash
# Install dependencies
npm install kleros-escrow-data-service ethers@5 graphql-request graphql
```

## 📦 Initialize Kleros Client

```typescript
import { createKlerosEscrowClient } from "kleros-escrow-data-service";

const config = {
  provider: {
    url: "https://ethereum.publicnode.com",
    networkId: 1, // Ethereum mainnet
  },
  multipleArbitrableTransaction: {
    address: "0x0d67440946949FE293B45c52eFD8A9b3d51e2522",
  },
  ipfsGateway: "https://cdn.kleros.link",
};

// For read-only operations
const readOnlyClient = createKlerosEscrowClient(config);

// For transactions (with wallet)
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const signerClient = createKlerosEscrowClient(config, signer);
```

## 🔍 Core Functions & Types

### 1. Get All Transactions
```typescript
// Fetch all transactions from the subgraph
const allTransactions = await klerosClient.services.event.getAllMetaEvidence();

interface MetaEvidenceEvent {
  id: string;
  blockTimestamp: string;
  transactionHash: string;
  _evidence: string;
  blockNumber: string;
  _metaEvidenceID: string;
}

// IPFS Content Type
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

### 2. Get Transaction Details
```typescript
// Get all events for a specific transaction
const details = await klerosClient.services.event.getTransactionDetails(transactionId);

interface TransactionEvents {
  metaEvidences: {
    id: string;
    blockTimestamp: string;
    transactionHash: string;
    _evidence: string;
    blockNumber: string;
  }[];
  payments: {
    id: string;
    _transactionID: string;
    _amount: string;
    _party: string;
    blockNumber: string;
    blockTimestamp: string;
    transactionHash: string;
  }[];
  evidences: {
    _arbitrator: string;
    _party: string;
    _evidence: string;
    _evidenceGroupID: string;
    blockNumber: string;
    transactionHash: string;
  }[];
  disputes: {
    _arbitrator: string;
    _disputeID: string;
    blockNumber: string;
    blockTimestamp: string;
    _metaEvidenceID: string;
    _evidenceGroupID: string;
    transactionHash: string;
  }[];
  hasToPayFees: {
    _transactionID: string;
    blockNumber: string;
    blockTimestamp: string;
    _party: string;
    transactionHash: string;
  }[];
  rulings: {
    _arbitrator: string;
    _disputeID: string;
    blockNumber: string;
    blockTimestamp: string;
    _ruling: string;
    transactionHash: string;
  }[];
}
```

## 🏠 Implementation Guide

### Transaction List Component
```typescript
function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const allTx = await klerosClient.services.event.getAllMetaEvidence();
        const processedTx = await Promise.all(
          allTx.map(async (tx) => {
            const metaData = await safeLoadIPFS(tx._evidence);
            return {
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
            };
          })
        );
        setTransactions(processedTx);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  return (
    <div className="transaction-grid">
      {transactions.map(tx => (
        <TransactionCard
          key={tx.id}
          transaction={tx}
          onClick={() => openTransactionModal(tx.id)}
        />
      ))}
    </div>
  );
}
```

### Utility Functions
```typescript
// Safe IPFS Loading
const safeLoadIPFS = async (uri: string) => {
  try {
    return await klerosClient.services.ipfs.fetchFromIPFS(uri);
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

// Sorting and Filtering
const sortByDate = (tx) => [...tx].sort((a, b) => b.timestamp - a.timestamp);
const filterByCategory = (tx, category) => tx.filter(t => t.category === category);
const searchTransactions = (tx, term) => tx.filter(t => 
  t.title.toLowerCase().includes(term) || 
  t.description.toLowerCase().includes(term)
);
```

### Styling
```css
.transaction-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1rem;
  transition: transform 0.2s;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
```

## 💡 Best Practices

1. **Performance**
   - Use virtual scrolling for large lists
   - Cache IPFS responses
   - Implement batch loading
   - Add debounced search

2. **UI/UX**
   - Show loading states and error messages
   - Color-code transaction statuses
   - Support dark/light mode
   - Add ENS support for addresses
   - Format timestamps and amounts consistently
