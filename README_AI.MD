# Kleros Escrow Interface Development Guide for AI

This guide breaks down the development of the Kleros Escrow interface into 6 manageable prompts, making it easier for AI to generate detailed and accurate responses incrementally.

## Prompt 1: Client Initialization and Configuration

### Overview

Create the foundation for the Kleros Escrow interface by implementing client initialization and configuration. This includes setting up the necessary connections to the blockchain and IPFS.

### Installing the Package

```bash
npm install kleros-escrow-data-service
# or
yarn add kleros-escrow-data-service
```

### Initializing the Client

```typescript
import { createKlerosEscrowClient } from 'kleros-escrow-data-service';
import { ethers } from 'ethers';

// Configuration for the Kleros Escrow client
const config = {
  provider: {
    url: "https://ethereum.publicnode.com",
    networkId: 1, // Ethereum mainnet
  },
  multipleArbitrableTransaction: {
    address: "0x0d67440946949FE293B45c52eFD8A9b3d51e2522", // Contract address
    abi: [], // Optional: will use default ABI if not provided
  },
  arbitrator: {
    // Optional: only needed for advanced arbitrator interactions
    address: "0x988b3A538b618C7A603e1c11Ab82Cd16dbE28069", // KlerosLiquid address
    abi: [], // Optional: will use default ABI if not provided
  },
  ipfsGateway: "https://cdn.kleros.link", // Default IPFS gateway
};

// For read-only operations
const readOnlyClient = createKlerosEscrowClient(config);

// For transactions (using browser wallet)
if (window.ethereum) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const signerClient = createKlerosEscrowClient(config, signer);

  // Use signerClient for transactions
  // Use readOnlyClient for queries and event monitoring
}
```

### Connecting Wallet for Transactions

```typescript
async function connectWalletAndGetClient() {
  if (window.ethereum) {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Get signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    // Create client with signer
    return createKlerosEscrowClient(config, signer);
  }
  throw new Error("No Ethereum wallet detected");
}

// Usage
try {
  const client = await connectWalletAndGetClient();
  // Now use client for transactions
} catch (error) {
  console.error("Failed to connect wallet:", error);
}
```

### Configuration Options

| Option                               | Description                                             | Required |
| ------------------------------------ | ------------------------------------------------------- | -------- |
| `provider.url`                       | RPC URL for the Ethereum network                        | Yes      |
| `provider.networkId`                 | Ethereum network ID (1 for Mainnet, 5 for Goerli, etc.) | Yes      |
| `multipleArbitrableTransaction.address` | Address of the MultipleArbitrableTransaction contract   | Yes      |
| `multipleArbitrableTransaction.abi`  | ABI for the contract (optional, uses default if omitted)| No       |
| `arbitrator.address`                 | Address of the arbitrator contract                      | No       |
| `arbitrator.abi`                     | ABI for the arbitrator (optional, uses default if omitted) | No    |
| `ipfsGateway`                        | IPFS gateway URL (defaults to "https://cdn.kleros.link")| No       |

## Prompt 2: Dashboard Screen - Data Retrieval

### Overview

Create the data retrieval functionality for the Dashboard screen, which displays all escrow transactions associated with the user's address. This includes fetching transactions and implementing event monitoring.

### Data Retrieval Functions

#### Get All User Transactions

```typescript
// Function to call
const transactions = await klerosClient.services.transaction.getTransactionsByAddress(userAddress);

// Input:
// - userAddress: string - The Ethereum address of the current user

// Output: Array of Transaction objects with the following structure:
// {
//   id: string,                    // Unique identifier for the transaction
//   sender: string,                // Address of the sender (payer)
//   receiver: string,              // Address of the receiver (payee)
//   amount: string,                // Current amount in escrow (in wei)
//   status: TransactionStatus,     // Enum: NoDispute, WaitingSender, WaitingReceiver, DisputeCreated, Resolved
//   timeoutPayment: number,        // Timeout period in seconds
//   lastInteraction: number,       // Timestamp of the last interaction (Unix timestamp)
//   createdAt: number,             // Timestamp when the transaction was created
//   disputeId?: number,            // ID of the dispute if one exists
//   senderFee: string,             // Arbitration fee paid by sender (in wei)
//   receiverFee: string            // Arbitration fee paid by receiver (in wei)
// }
```

#### Get Transaction Count

```typescript
// Function to call
const count = await klerosClient.services.transaction.getTransactionCount();

// Input: None

// Output:
// - count: number - The total number of transactions in the contract
// This can be used for pagination or displaying stats
```

### Event Monitoring for Real-time Updates

#### Retrieving Transaction Events

```typescript
// Function to call
const events = await klerosClient.services.event.getEventsForTransaction(transactionId);

// Input:
// - transactionId: string - The ID of the transaction
// - fromBlock: number - (Optional) The starting block to search from

// Output:
// - events: BaseEvent[] - Array of all events related to the transaction, sorted by block number
// Each event has common properties:
// {
//   transactionId: string,       // ID of the transaction
//   blockNumber: number,         // Block number when the event was emitted
//   transactionHash: string,     // Hash of the transaction that emitted the event
//   timestamp: number,           // Timestamp when the event was emitted
//   ...specific event properties
// }
```

#### Retrieving MetaEvidence Events

```typescript
// Function to call
const metaEvidenceEvents = await klerosClient.services.event.getMetaEvidenceEvents(transactionId);

// Output:
// - metaEvidenceEvents: MetaEvidenceEvent[] - Array with structure:
// {
//   transactionId: string,       // ID of the transaction
//   blockNumber: number,         // Block number when the event was emitted
//   transactionHash: string,     // Hash of the transaction that emitted the event
//   timestamp: number,           // Timestamp when the event was emitted
//   _metaEvidenceID: string,     // ID of the meta-evidence (same as transactionId)
//   _evidence: string            // IPFS URI to the meta-evidence JSON
// }

// Fetch meta-evidence data
const metaEvidenceURI = metaEvidenceEvents[0]?._evidence;
const metaEvidenceData = await klerosClient.services.ipfs.fetchFromIPFS(metaEvidenceURI);
```

#### Retrieving Payment Events

```typescript
// Function to call
const paymentEvents = await klerosClient.services.event.getPaymentEvents(transactionId);

// Output:
// - paymentEvents: PaymentEvent[] - Array with structure:
// {
//   transactionId: string,       // ID of the transaction
//   blockNumber: number,         // Block number when the event was emitted
//   transactionHash: string,     // Hash of the transaction that emitted the event
//   timestamp: number,           // Timestamp when the event was emitted
//   _transactionID: string,      // ID of the transaction (redundant)
//   _amount: string,             // Amount paid in wei
//   _party: string               // Address of the party who made/received the payment
// }
```

#### Retrieving Dispute Events

```typescript
// Function to call
const disputeEvents = await klerosClient.services.event.getDisputeEvents(transactionId);

// Output:
// - disputeEvents: DisputeEvent[] - Array with structure:
// {
//   transactionId: string,       // ID of the transaction
//   blockNumber: number,         // Block number when the event was emitted
//   transactionHash: string,     // Hash of the transaction that emitted the event
//   timestamp: number,           // Timestamp when the event was emitted
//   _arbitrator: string,         // Address of the arbitrator contract
//   _disputeID: string,          // ID of the created dispute
//   _metaEvidenceID: string,     // Same as transactionId
//   _evidenceGroupID: string     // ID of the evidence group (same as transactionId)
// }
```

#### Retrieving Evidence Events

```typescript
// Function to call
const evidenceEvents = await klerosClient.services.event.getEvidenceEvents(transactionId);

// Output:
// - evidenceEvents: EvidenceEvent[] - Array with structure:
// {
//   transactionId: string,       // ID of the transaction
//   blockNumber: number,         // Block number when the event was emitted
//   transactionHash: string,     // Hash of the transaction that emitted the event
//   timestamp: number,           // Timestamp when the event was emitted
//   _arbitrator: string,         // Address of the arbitrator
//   _evidenceGroupID: string,    // ID of the evidence group (same as transactionId)
//   _party: string,              // Address of the party who submitted evidence
//   _evidence: string            // IPFS URI to the evidence
// }
```

#### Retrieving Ruling Events

```typescript
// Function to call
const rulingEvents = await klerosClient.services.event.getRulingEvents(transactionId);

// Output:
// - rulingEvents: RulingEvent[] - Array with structure:
// {
//   transactionId: string,       // ID of the transaction
//   blockNumber: number,         // Block number when the event was emitted
//   transactionHash: string,     // Hash of the transaction that emitted the event
//   timestamp: number,           // Timestamp when the event was emitted
//   _arbitrator: string,         // Address of the arbitrator
//   _disputeID: string,          // ID of the dispute
//   _ruling: string              // The ruling given (0: Refused, 1: Sender wins, 2: Receiver wins)
// }
```

#### Implementing Event Polling

```typescript
// Example of polling for new events
function setupEventPolling(transactionId, pollingInterval = 30000) {
  let lastCheckedBlock = 0;
  
  const intervalId = setInterval(async () => {
    try {
      // Get events since the last checked block
      const newEvents = await klerosClient.services.event.getEventsForTransaction(
        transactionId, 
        lastCheckedBlock
      );
      
      if (newEvents.length > 0) {
        console.log(`Found ${newEvents.length} new events`);
        // Process new events
        newEvents.forEach(event => {
          // Handle each event type
          if ('_amount' in event && '_party' in event) {
            // This is a payment event
            console.log(`Payment of ${event._amount} made by ${event._party}`);
          } else if ('_disputeID' in event && '_evidenceGroupID' in event) {
            // This is a dispute event
            console.log(`Dispute ${event._disputeID} created for transaction ${event.transactionId}`);
          } else if ('_evidence' in event && '_party' in event) {
            // This is an evidence event
            console.log(`Evidence ${event._evidence} submitted by ${event._party}`);
          } else if ('_ruling' in event) {
            // This is a ruling event
            console.log(`Ruling ${event._ruling} given for dispute ${event._disputeID}`);
          }
          
          // Update the last checked block
          lastCheckedBlock = Math.max(lastCheckedBlock, event.blockNumber);
        });
      }
    } catch (error) {
      console.error("Error polling for events:", error);
    }
  }, pollingInterval);
  
  // Return a function to stop polling
  return () => clearInterval(intervalId);
}
```

## Prompt 3: Dashboard Screen - Transaction Creation

### Overview

Implement the transaction creation functionality for the Dashboard screen, including the creation form, gas estimation, and meta-evidence handling.

### Create Transaction Modal

#### Estimate Gas for Transaction Creation

```typescript
// Function to call
const gasEstimate = await klerosClient.actions.transaction.estimateGasForCreateTransaction({
  receiver: receiverAddress,
  value: amountInEth,
  timeoutPayment: timeoutInSeconds,
  metaEvidence: metaEvidenceURI,
});

// Input:
// - receiverAddress: string - Address of the receiver
// - amountInEth: string - Amount to send in ETH (e.g., "1.0")
// - timeoutInSeconds: number - Timeout period in seconds (e.g., 86400 for 1 day)
// - metaEvidenceURI: string - IPFS URI to the meta-evidence JSON

// Output:
// - gasEstimate: ethers.BigNumber - Estimated gas cost for the transaction
```

#### Upload Meta-Evidence to IPFS

```typescript
// Function to call
const metaEvidenceURI = await klerosClient.services.ipfs.uploadMetaEvidence({
  title: "Transaction Title",
  description: "Detailed description of the transaction",
  category: "Services", // or "Physical goods", "Digital goods", etc.
  question: "Should the payment be released to the receiver?",
  rulingOptions: {
    titles: ["Release to receiver", "Return to sender"],
    descriptions: [
      "Funds will be sent to the receiver",
      "Funds will be returned to the sender",
    ],
  },
  // Optional fields
  fileURI: "/ipfs/QmFileHash", // If there's an attached file
  fileTypeExtension: "pdf", // File type if applicable
});

// Output:
// - metaEvidenceURI: string - IPFS URI of the uploaded meta-evidence
```

#### Create Transaction

```typescript
// Function to call
const result = await klerosClient.actions.transaction.createTransaction({
  receiver: receiverAddress,
  value: amountInEth,
  timeoutPayment: timeoutInSeconds,
  metaEvidence: metaEvidenceURI,
});

// Output:
// {
//   transactionResponse: ethers.providers.TransactionResponse,
//   transactionId: string // The ID of the created transaction
// }
```

### UI Components to Include

1. **Transaction List**
   - Display all transactions with:
     - Transaction ID (shortened)
     - Status indicator (color-coded)
     - Amount
     - Counterparty (sender or receiver)
     - Creation date
     - Action buttons based on status

2. **Filters and Search**
   - Filter by status, role, date range
   - Search by transaction ID or counterparty address

3. **Create Transaction Button**
   - Opens the Create Transaction modal

4. **Transaction Summary Stats**
   - Total number of transactions
   - Total value in escrow
   - Number of disputes

5. **Notifications Area**
   - Show real-time updates from event monitoring

### User Interactions

1. **Create Transaction Flow**
   - Click "Create Transaction" button
   - Fill out transaction details form
   - Review estimated gas cost
   - Confirm and submit transaction
   - Show success/failure notification
   - Add new transaction to list when confirmed

2. **Real-time Updates**
   - Highlight transactions that have changed status
   - Show notification for new events
   - Update transaction amounts when payments occur

### Error Handling and Responsive Design

- Display appropriate error messages for network issues and transaction failures
- Implement loading states with skeleton screens
- Create responsive layouts for both desktop and mobile views

## Prompt 4: Transaction Details Screen

### Overview

Create a detailed view for a specific escrow transaction. This screen should display comprehensive information about the transaction, its current status, and provide appropriate action buttons.

### Data Retrieval Functions

#### Get Transaction Details

```typescript
// Function to call
const transaction = await klerosClient.services.transaction.getTransaction(transactionId);

// Input:
// - transactionId: string - The ID of the transaction to fetch

// Output: Transaction object with details
```

#### Get Amount Paid by a Party

```typescript
// Function to call
const amountPaid = await klerosClient.services.transaction.getAmountPaid(
  transactionId,
  partyAddress
);

// Input:
// - transactionId: string - The ID of the transaction
// - partyAddress: string - The Ethereum address of the party (sender or receiver)

// Output:
// - amountPaid: string - The amount paid by the specified party in wei
```

#### Check if Transaction Can Be Executed

```typescript
// Function to call
const canExecute = await klerosClient.services.transaction.canExecuteTransaction(transactionId);

// Output:
// - canExecute: boolean - True if the transaction can be executed
```

#### Check if Timeout Can Be Applied

```typescript
// Function to call
const timeoutStatus = await klerosClient.services.transaction.canTimeOut(transactionId);

// Output:
// {
//   canSenderTimeOut: boolean,     // True if the receiver hasn't paid the fee within the timeout period
//   canReceiverTimeOut: boolean    // True if the sender hasn't paid the fee within the timeout period
// }
```

#### Get Meta-Evidence and Dispute Details

```typescript
// Get meta-evidence data
const metaEvidenceEvents = await klerosClient.services.event.getMetaEvidenceEvents(transactionId);
const metaEvidenceURI = metaEvidenceEvents[0]?.evidence;
const metaEvidenceData = await klerosClient.services.ipfs.fetchFromIPFS(metaEvidenceURI);

// Get dispute details (if exists)
const dispute = await klerosClient.services.dispute.getDispute(transactionId);
```

### Event Monitoring for Transaction Updates

Implement polling for transaction events to update the UI in real-time:

```typescript
// Example of polling for specific transaction events
function monitorTransactionEvents(transactionId, pollingInterval = 15000) {
  let lastCheckedBlock = 0;
  
  const intervalId = setInterval(async () => {
    try {
      // Get all new events since the last checked block
      const newEvents = await klerosClient.services.event.getEventsForTransaction(
        transactionId, 
        lastCheckedBlock
      );
      
      if (newEvents.length > 0) {
        // Update the UI based on event types
        newEvents.forEach(event => {
          // Update last checked block
          lastCheckedBlock = Math.max(lastCheckedBlock, event.blockNumber);
          
          // Handle different event types
          if ('_amount' in event && '_party' in event) {
            // Payment event
            updatePaymentDisplay(event);
          } else if ('_disputeID' in event && !('_ruling' in event)) {
            // Dispute creation event
            updateDisputeStatus(event);
          } else if ('_evidence' in event && '_party' in event) {
            // Evidence submission event
            addNewEvidence(event);
          } else if ('_ruling' in event) {
            // Ruling event
            updateRulingDisplay(event);
          }
        });
      }
    } catch (error) {
      console.error("Error polling for transaction events:", error);
    }
  }, pollingInterval);
  
  // Return a function to stop polling
  return () => clearInterval(intervalId);
}
```

### UI Components to Include

1. **Transaction Header**
   - Transaction ID, status badge, creation date, timeout countdown

2. **Transaction Details Panel**
   - Sender and receiver addresses
   - Current amount in escrow
   - Transaction terms from meta-evidence
   - Attached files (if any)

3. **Action Panel**
   - Context-aware buttons based on transaction status and user role
   - Payment/reimbursement form (when applicable)

4. **Evidence Panel**
   - List of submitted evidence from both parties
   - Evidence submission form
   - Preview of evidence contents

5. **Dispute Panel** (when a dispute exists)
   - Dispute status, arbitration fee information, ruling (if available)

6. **Transaction Timeline**
   - Chronological display of all transaction events

## Prompt 5: Transaction Actions and Dispute Creation

### Overview

Implement the action functions for transactions, including payment, reimbursement, dispute creation, and evidence submission.

### Action Functions

#### Pay (Release Funds)

```typescript
// Function to call
await klerosClient.actions.transaction.pay({
  transactionId: transactionId,
  amount: amountToRelease,
});

// Input:
// - transactionId: string - The ID of the transaction
// - amount: string - Amount to release in ETH (e.g., "0.5")

// Output:
// - ethers.providers.TransactionResponse - The blockchain transaction details
// Only available to the sender of the transaction
```

#### Reimburse

```typescript
// Function to call
await klerosClient.actions.transaction.reimburse({
  transactionId: transactionId,
  amount: amountToReimburse,
});

// Input:
// - transactionId: string - The ID of the transaction
// - amount: string - Amount to reimburse in ETH (e.g., "0.5")

// Output:
// - ethers.providers.TransactionResponse - The blockchain transaction details
// Only available to the receiver of the transaction
```

#### Execute Transaction (after timeout)

```typescript
// Function to call
await klerosClient.actions.transaction.executeTransaction(transactionId);

// Input:
// - transactionId: string - The ID of the transaction to execute

// Output:
// - ethers.providers.TransactionResponse - The blockchain transaction details
// Available to anyone after the timeout period has passed
```

#### Pay Arbitration Fee (Raise Dispute)

```typescript
// Get arbitration cost
const arbitrationCost = await klerosClient.services.dispute.getArbitrationCost();

// Function to call - for sender
await klerosClient.actions.dispute.payArbitrationFeeBySender({
  transactionId: transactionId,
  value: arbitrationCost,
});

// Function to call - for receiver
await klerosClient.actions.dispute.payArbitrationFeeByReceiver({
  transactionId: transactionId,
  value: arbitrationCost,
});

// Input:
// - transactionId: string - The ID of the transaction
// - value: string - The arbitration fee amount in ETH

// Output:
// - ethers.providers.TransactionResponse - The blockchain transaction details
// Use the appropriate function based on the user's role
```

#### Submit Evidence

```typescript
// Function to call
const evidenceURI = await klerosClient.services.ipfs.uploadEvidence({
  name: "Evidence Title",
  description: "Detailed description of the evidence",
  fileURI: "/ipfs/QmFileHash", // Optional
  fileTypeExtension: "pdf", // Optional
});

await klerosClient.actions.evidence.submitEvidence({
  transactionId: transactionId,
  evidence: evidenceURI,
});

// Input:
// - transactionId: string - The ID of the transaction
// - evidence: string - IPFS URI of the uploaded evidence

// Output:
// - ethers.providers.TransactionResponse - The blockchain transaction details
// Available to both sender and receiver
```

#### Execute Timeout (for dispute fee payment)

```typescript
// Function to call - if sender didn't pay
await klerosClient.actions.transaction.timeOutByReceiver(transactionId);

// Function to call - if receiver didn't pay
await klerosClient.actions.transaction.timeOutBySender(transactionId);

// Input:
// - transactionId: string - The ID of the transaction

// Output:
// - ethers.providers.TransactionResponse - The blockchain transaction details
// Use the appropriate function based on the user's role and which party failed to pay
```

### Conditional Rendering Logic

1. **Payment Actions**
   - Show to sender only
   - Only in NoDispute status
   - Disabled if amount is 0

2. **Reimbursement Actions**
   - Show to receiver only
   - Only in NoDispute status
   - Disabled if amount is 0

3. **Dispute Actions**
   - Show "Raise Dispute" when in NoDispute status
   - Show "Pay Arbitration Fee" when in WaitingSender/WaitingReceiver status
   - Show "Submit Evidence" when dispute exists and not resolved
   - Show "Appeal" when ruling is given and in appeal period

4. **Timeout Actions**
   - Show "Execute Transaction" when timeout period has passed and in NoDispute status
   - Show "Execute Timeout" to appropriate party when the other party hasn't paid arbitration fee within timeout

### Error Handling

1. **Insufficient Funds**
   - Check user balance before actions
   - Show helpful error messages

2. **Transaction Failures**
   - Provide clear error messages
   - Offer retry options

3. **Permission Errors**
   - Clearly indicate which actions are available to which party
   - Explain why certain actions are disabled

## Prompt 6: Dispute Details Screen and IPFS Data Formats

### Overview

Create a detailed view for an active dispute related to an escrow transaction, and implement the IPFS data formats for evidence and meta-evidence.

### Data Retrieval Functions

#### Get Dispute Information

```typescript
// Function to call
const dispute = await klerosClient.services.dispute.getDispute(transactionId);

// Input:
// - transactionId: string - The ID of the transaction with the dispute

// Output:
// - dispute: Dispute | null - A dispute object with details
```

#### Get Arbitrator Information and Appeal Cost

```typescript
// Get arbitrator information
const arbitrator = await klerosClient.services.arbitrator.getArbitrator();

// Get appeal cost
const appealCost = await klerosClient.services.dispute.getAppealCost(dispute.id);
```

#### Get Evidence Submissions and Fetch Content

```typescript
// Get evidence events
const evidenceEvents = await klerosClient.services.event.getEvidenceEvents(transactionId);

// Fetch evidence content
const evidenceData = await klerosClient.services.ipfs.fetchFromIPFS(evidenceURI);
```

### Event Monitoring for Dispute Updates

```typescript
// Example of polling for dispute-related events
function monitorDisputeEvents(transactionId, disputeId, pollingInterval = 15000) {
  let lastCheckedBlock = 0;
  
  const intervalId = setInterval(async () => {
    try {
      // Get all new events since the last checked block
      const newEvidenceEvents = await klerosClient.services.event.getEvidenceEvents(
        transactionId, 
        lastCheckedBlock
      );
      
      const newRulingEvents = await klerosClient.services.event.getRulingEvents(
        transactionId,
        lastCheckedBlock
      );
      
      // Process new evidence events
      if (newEvidenceEvents.length > 0) {
        newEvidenceEvents.forEach(event => {
          console.log(`New evidence submitted by ${event._party}`);
          // Update evidence list in UI
          updateEvidenceList(event);
          
          // Update last checked block
          lastCheckedBlock = Math.max(lastCheckedBlock, event.blockNumber);
        });
      }
      
      // Process new ruling events
      if (newRulingEvents.length > 0) {
        newRulingEvents.forEach(event => {
          if (event._disputeID === disputeId) {
            console.log(`Ruling ${event._ruling} given for dispute ${event._disputeID}`);
            // Update ruling display in UI
            updateRulingDisplay(event);
            
            // Update last checked block
            lastCheckedBlock = Math.max(lastCheckedBlock, event.blockNumber);
          }
        });
      }
    } catch (error) {
      console.error("Error polling for dispute events:", error);
    }
  }, pollingInterval);
  
  // Return a function to stop polling
  return () => clearInterval(intervalId);
}
```

### Action Functions

#### Submit Evidence

```typescript
// Function to call
const evidenceURI = await klerosClient.services.ipfs.uploadEvidence({
  name: "Evidence Title",
  description: "Detailed description of the evidence",
  fileURI: "/ipfs/QmFileHash", // Optional
  fileTypeExtension: "pdf", // Optional
});

await klerosClient.actions.evidence.submitEvidence({
  transactionId: transactionId,
  evidence: evidenceURI,
});
```

#### Upload File to IPFS

```typescript
// Function to call
const fileData = new Uint8Array([/* binary data */]);
const fileCid = await klerosClient.services.ipfs.uploadToIPFS(
  fileData,
  "document.pdf"
);
```

#### Appeal a Ruling

```typescript
// Function to call
await klerosClient.actions.dispute.appeal({
  transactionId: transactionId,
  value: appealCost,
});
```

### UI Components and User Interactions

1. **Dispute Header**
   - Dispute ID, status badge, creation date, appeal period countdown

2. **Transaction Context Panel**
   - Link back to transaction details, transaction summary

3. **Dispute Status Panel**
   - Current dispute phase, ruling, arbitrator information

4. **Evidence Panel**
   - Tabbed view of evidence from each party, evidence submission form

5. **Timeline Panel**
   - Chronological display of dispute events

6. **Action Panel**
   - Context-aware buttons based on dispute status and user role

### IPFS Data Formats

#### Evidence Format

Evidence is stored as a JSON object with the following structure:

```json
{
  "name": "Evidence Title",
  "description": "Detailed description of the evidence",
  "fileURI": "/ipfs/QmFileHash", // Optional
  "fileTypeExtension": "pdf" // Optional
}
```

#### MetaEvidence Format

MetaEvidence is a comprehensive JSON object that defines the terms and context of an escrow transaction:

```json
{
  "category": "Escrow",
  "title": "Transaction Title",
  "description": "Detailed description of the transaction terms",
  "question": "Which party abided by terms of the contract?",
  "rulingOptions": {
    "type": "single-select",
    "titles": ["Refund Sender", "Pay Receiver"],
    "descriptions": [
      "Select to return funds to the Sender",
      "Select to release funds to the Receiver"
    ]
  },
  // Optional fields
  "subCategory": "General Service",
  "sender": "0xSenderAddress",
  "receiver": "0xReceiverAddress",
  "amount": "1.0",
  "timeout": 86400,
  "token": {
    "name": "Ethereum",
    "ticker": "ETH",
    "symbolURI": "/path/to/eth/symbol.png",
    "address": null,
    "decimals": 18
  },
  "extraData": {
    "Contract Information": "Additional contract details can go here..."
  },
  "evidenceDisplayInterfaceURI": "/ipfs/QmEvidenceDisplayInterface",
  "aliases": {
    "0xSenderAddress": "sender",
    "0xReceiverAddress": "receiver"
  }
}
```

### File Upload Considerations

When uploading files to IPFS:

1. **File Size**: Keep files under 10MB when possible for faster loading
2. **Supported Formats**: Common web formats are recommended (Images: JPG, PNG, GIF, SVG; Documents: PDF, TXT, MD; Data: JSON, CSV)
3. **Compression**: Consider compressing large files before upload
4. **Persistence**: Important files should be pinned to ensure they remain available 