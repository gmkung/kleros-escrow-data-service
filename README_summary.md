# 🤝 Kleros Escrow Transaction Explorer

A lovable web app to explore and manage Kleros escrow transactions. View your transactions or look up specific ones by ID.

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

## 🔍 Core Functions

### 1. Get User's Transactions
```typescript
// Fetch all transactions for the connected wallet
const transactions = await klerosClient.services.transaction.getTransactionsByAddress(address);

// Response type:
interface Transaction {
  id: string;
  sender: string;
  receiver: string;
  amount: string;
  status: TransactionStatus; // NoDispute, WaitingSender, WaitingReceiver, DisputeCreated, Resolved
  timeoutPayment: number;
  lastInteraction: number;
  createdAt: number;
  disputeId?: number;
  senderFee: string;
  receiverFee: string;
}
```

### 2. Get Single Transaction
```typescript
// Look up specific transaction by ID
const transaction = await klerosClient.services.transaction.getTransaction(transactionId);
```

### 3. Get Transaction Details with Events
```typescript
// Get all events and details for a transaction
const details = await klerosClient.services.event.getTransactionDetails(transactionId);

// Response type:
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

### 4. Fetch IPFS Content
```typescript
// Get content from IPFS URI
const ipfsContent = await klerosClient.services.ipfs.fetchFromIPFS(uri);

// Meta Evidence Response Type:
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

// Evidence Response Type:
interface Evidence {
  name: string;
  description: string;
  fileURI?: string;
  fileTypeExtension?: string;
}
```

## 💡 Implementation Tips

1. **Transaction List View**
   - Display transactions in a card format with key details
   - Show status with color coding (green: NoDispute, yellow: Waiting, orange: DisputeCreated, blue: Resolved)
   - Add filters for transaction status
   - Sort by date, amount, or status

2. **Transaction Detail Modal**
   - Show full transaction details when a card is clicked
   - Display events in a chronological timeline
   - Add icons for different event types
   - Show IPFS content in a formatted way
   - Include links to Etherscan for transaction hashes

3. **User Experience**
   - Add loading states with friendly animations
   - Show error messages with helpful suggestions
   - Implement infinite scroll for transaction list
   - Add search/filter functionality
   - Support dark/light mode

## 🎨 UI Components Needed

1. **Transaction List**
   - Search/filter bar
   - Transaction cards
   - Pagination/infinite scroll

2. **Transaction Modal**
   - Transaction details section
   - Events timeline
   - IPFS content display
   - Evidence viewer
   - Status indicator

3. **Common Elements**
   - Loading spinners
   - Error messages
   - Address display with ENS support
   - Timestamp formatter
   - Amount formatter (ETH/Wei conversion) 