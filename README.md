# Kleros Escrow Interface Development Guide

This guide provides detailed instructions for developing the Kleros Escrow interface using the Kleros Escrow Data Service. Each section outlines a specific screen with the required functions, data structures, and user interactions.

## Client Initialization

### Installing the Package

```bash
npm install kleros-escrow-data-service
# or
yarn add kleros-escrow-data-service
```

### Initializing the Client

Before implementing any of the screens, you need to initialize the Kleros Escrow client:

```typescript
import { createKlerosEscrowClient } from 'kleros-escrow-data-service';
import { ethers } from 'ethers';

// Configuration for the Kleros Escrow client
const config = {
  // Contract addresses
  arbitrableAddress: "0x...", // MultipleArbitrableTransaction contract address
  arbitratorAddress: "0x...", // Arbitrator contract address (e.g., KlerosLiquid)
  
  // Network configuration
  networkId: 1, // 1 for Ethereum Mainnet, 5 for Goerli, etc.
  
  // Optional: IPFS gateway for retrieving evidence and meta-evidence
  ipfsGateway: "https://cdn.kleros.io" // Default IPFS gateway
};

// For read-only operations (using Ankr's public RPC)
const readProvider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth');
const readOnlyClient = createKlerosEscrowClient(config, readProvider);

// For transactions (using browser wallet)
if (window.ethereum) {
  const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
  const signerClient = createKlerosEscrowClient(config, signer);
  
  // Use signerClient for transactions
  // Use readOnlyClient for queries and event listening
}

// Function to connect wallet when needed
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

## Prompt 1. Dashboard Screen

### Overview

Create a dashboard that displays all escrow transactions associated with the user's address. The dashboard should show transaction status, amounts, counterparties, and allow users to create new transactions.

### Data Retrieval Functions

#### Get All User Transactions

```typescript
// Function to call
const transactions =
  await klerosClient.services.transaction.getTransactionsByAddress(userAddress);

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

### Event Listeners for Real-time Updates

#### Listen for New Transactions (MetaEvidence Events)

```typescript
// Function to call
const emitter = klerosClient.listeners.listenForMetaEvidence({
  // Optional filter - if not provided, listens for all transactions
  // transactionId: "123"
});

// Input:
// - Optional filter object with transactionId

// Output:
// - EventEmitter that emits "MetaEvidence" events

// Event handler
emitter.on("MetaEvidence", (event) => {
  // event structure:
  // {
  //   transactionId: string,       // ID of the new transaction
  //   blockNumber: number,         // Block number when the event was emitted
  //   transactionHash: string,     // Hash of the transaction that emitted the event
  //   timestamp: number,           // Timestamp when the event was emitted
  //   metaEvidenceId: string,      // Same as transactionId
  //   evidence: string             // IPFS URI to the meta-evidence JSON
  // }
  // Use this to add new transactions to the dashboard in real-time
});
```

#### Listen for Payment Events

```typescript
// Function to call
const emitter = klerosClient.listeners.listenForPayment({
  // Optional filters
  // transactionId: "123",
  // party: "0xUserAddress"
});

// Input:
// - Optional filter object with transactionId and/or party address

// Output:
// - EventEmitter that emits "Payment" events

// Event handler
emitter.on("Payment", (event) => {
  // event structure:
  // {
  //   transactionId: string,       // ID of the transaction
  //   blockNumber: number,         // Block number when the event was emitted
  //   transactionHash: string,     // Hash of the transaction that emitted the event
  //   timestamp: number,           // Timestamp when the event was emitted
  //   party: string,               // Address of the party who made/received the payment
  //   amount: string               // Amount paid in wei
  // }
  // Use this to update transaction amounts in real-time
});
```

#### Listen for Dispute Events

```typescript
// Function to call
const emitter = klerosClient.listeners.listenForDispute();

// Input:
// - Optional filter object with arbitrator and/or disputeId

// Output:
// - EventEmitter that emits "Dispute" events

// Event handler
emitter.on("Dispute", (event) => {
  // event structure:
  // {
  //   transactionId: string,       // ID of the transaction
  //   blockNumber: number,         // Block number when the event was emitted
  //   transactionHash: string,     // Hash of the transaction that emitted the event
  //   timestamp: number,           // Timestamp when the event was emitted
  //   disputeId: number,           // ID of the created dispute
  //   arbitrator: string,          // Address of the arbitrator contract
  //   metaEvidenceId: string,      // Same as transactionId
  //   evidenceGroupId: string      // ID of the evidence group
  // }
  // Use this to update transaction status when disputes are created
});
```

### Create Transaction Modal

#### Estimate Gas for Transaction Creation

```typescript
// Function to call
const gasEstimate =
  await klerosClient.actions.transaction.estimateGasForCreateTransaction({
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
// Use this to display the estimated transaction cost to the user
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

// Input:
// - Meta-evidence object with transaction details

// Output:
// - metaEvidenceURI: string - IPFS URI of the uploaded meta-evidence (e.g., "/ipfs/QmT2o...")
// This URI will be stored on-chain to reference the transaction details
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

// Input:
// - receiverAddress: string - Address of the receiver
// - amountInEth: string - Amount to send in ETH (e.g., "1.0")
// - timeoutInSeconds: number - Timeout period in seconds (e.g., 86400 for 1 day)
// - metaEvidenceURI: string - IPFS URI to the meta-evidence JSON

// Output:
// {
//   transactionResponse: ethers.providers.TransactionResponse, // The blockchain transaction details
//   transactionId: string                                     // The ID of the created transaction
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

   - Filter by:
     - Status (All, No Dispute, Waiting, Disputed, Resolved)
     - Role (Sender, Receiver, Both)
     - Date range
   - Search by transaction ID or counterparty address

3. **Create Transaction Button**

   - Opens the Create Transaction modal

4. **Transaction Summary Stats**

   - Total number of transactions
   - Total value in escrow
   - Number of disputes

5. **Notifications Area**
   - Show real-time updates from event listeners

### User Interactions

1. **Clicking a Transaction**

   - Navigate to Transaction Details screen

2. **Create Transaction Flow**

   - Click "Create Transaction" button
   - Fill out transaction details form
   - Review estimated gas cost
   - Confirm and submit transaction
   - Show success/failure notification
   - Add new transaction to list when confirmed

3. **Real-time Updates**
   - Highlight transactions that have changed status
   - Show notification for new events
   - Update transaction amounts when payments occur

### Error Handling

1. **Network Errors**

   - Display appropriate error messages for network issues
   - Provide retry options

2. **Transaction Failures**

   - Show detailed error messages from failed transactions
   - Guide users on how to resolve common issues

3. **Data Loading States**
   - Show loading indicators while fetching transaction data
   - Implement skeleton screens for better UX during loading

### Responsive Design Considerations

1. **Desktop View**

   - Full table layout with all transaction details
   - Side-by-side panels for filters and transaction list

2. **Mobile View**
   - Card-based layout for transactions
   - Collapsible filters
   - Full-screen modal for transaction creation

## Prompt 2. Transaction Details Screen

### Overview

Create a detailed view for a specific escrow transaction. This screen should display comprehensive information about the transaction, its current status, and provide appropriate action buttons based on the transaction state and user role (sender or receiver).

### Data Retrieval Functions

#### Get Transaction Details

```typescript
// Function to call
const transaction = await klerosClient.services.transaction.getTransaction(transactionId);

// Input:
// - transactionId: string - The ID of the transaction to fetch

// Output: Transaction object with the following structure:
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
// This can be used to show payment history or calculate remaining amounts
```

#### Check if Transaction Can Be Executed

```typescript
// Function to call
const canExecute = await klerosClient.services.transaction.canExecuteTransaction(transactionId);

// Input:
// - transactionId: string - The ID of the transaction to check

// Output:
// - canExecute: boolean - True if the transaction can be executed (timeout has passed and no dispute exists)
// Use this to enable/disable the "Execute Transaction" button
```

#### Check if Timeout Can Be Applied

```typescript
// Function to call
const timeoutStatus = await klerosClient.services.transaction.canTimeOut(transactionId);

// Input:
// - transactionId: string - The ID of the transaction to check

// Output:
// {
//   canSenderTimeOut: boolean,     // True if the receiver hasn't paid the fee within the timeout period
//   canReceiverTimeOut: boolean    // True if the sender hasn't paid the fee within the timeout period
// }
// Use this to enable/disable timeout buttons based on user role
```

#### Get Transaction Events

```typescript
// Function to call
const events = await klerosClient.services.event.getEventsForTransaction(transactionId);

// Input:
// - transactionId: string - The ID of the transaction
// - fromBlock: number - (Optional) The starting block to search from

// Output:
// - events: BaseEvent[] - Array of all events related to the transaction, sorted by block number
// This includes payment events, dispute events, evidence events, etc.
// Use this to build a timeline of transaction activity
```

#### Get Meta-Evidence Data

```typescript
// Function to call
const metaEvidenceEvents = await klerosClient.services.event.getMetaEvidenceEvents(transactionId);
const metaEvidenceURI = metaEvidenceEvents[0]?.evidence;
const metaEvidenceData = await klerosClient.services.ipfs.fetchFromIPFS(metaEvidenceURI);

// Input:
// - transactionId: string - The ID of the transaction

// Output:
// - metaEvidenceData: object - The parsed JSON data from IPFS containing:
//   {
//     title: string,               // Title of the transaction
//     description: string,         // Detailed description
//     category: string,            // Category (e.g., "Services", "Goods")
//     question: string,            // The question for arbitrators
//     rulingOptions: {             // Options for ruling
//       titles: string[],          // Titles of ruling options
//       descriptions: string[]     // Descriptions of ruling options
//     },
//     fileURI?: string,            // Optional attached file
//     fileTypeExtension?: string   // File type if applicable
//   }
// Use this to display the original terms of the transaction
```

#### Get Dispute Details (if exists)

```typescript
// Function to call
const dispute = await klerosClient.services.dispute.getDispute(transactionId);

// Input:
// - transactionId: string - The ID of the transaction

// Output:
// - dispute: Dispute | null - A dispute object with the following structure (or null if no dispute exists):
//   {
//     id: number,                  // The dispute ID
//     transactionId: string,       // The ID of the transaction this dispute is for
//     status: DisputeStatus,       // Enum: Waiting, Appealable, Solved
//     ruling?: Ruling,             // Enum: RefusedToRule, SenderWins, ReceiverWins
//     arbitrator: string,          // Address of the arbitrator contract
//     arbitratorExtraData: string, // Extra data for the arbitrator
//     evidenceGroupId: string,     // ID of the evidence group
//     appealPeriodStart?: number,  // Timestamp when the appeal period starts
//     appealPeriodEnd?: number     // Timestamp when the appeal period ends
//   }
// Use this to display dispute information and enable dispute-related actions
```

### Event Listeners for Real-time Updates

#### Listen for Payment Events

```typescript
// Function to call
const emitter = klerosClient.listeners.listenForPayment({
  transactionId: transactionId
});

// Input:
// - transactionId: string - The ID of the transaction to monitor

// Output:
// - EventEmitter that emits "Payment" events

// Event handler
emitter.on("Payment", (event) => {
  // event structure:
  // {
  //   transactionId: string,       // ID of the transaction
  //   blockNumber: number,         // Block number when the event was emitted
  //   transactionHash: string,     // Hash of the transaction that emitted the event
  //   timestamp: number,           // Timestamp when the event was emitted
  //   party: string,               // Address of the party who made/received the payment
  //   amount: string               // Amount paid in wei
  // }
  
  // Use this to update transaction amount in real-time
});
```

#### Listen for Dispute Events

```typescript
// Function to call
const emitter = klerosClient.listeners.listenForDispute({
  transactionId: transactionId
});

// Input:
// - transactionId: string - The ID of the transaction to monitor

// Output:
// - EventEmitter that emits "Dispute" events

// Event handler
emitter.on("Dispute", (event) => {
  // event structure as described earlier
  // Use this to update the UI when a dispute is created
});
```

#### Listen for Evidence Events

```typescript
// Function to call
const emitter = klerosClient.listeners.listenForEvidence({
  evidenceGroupId: transactionId
});

// Input:
// - evidenceGroupId: string - The ID of the evidence group (same as transactionId)

// Output:
// - EventEmitter that emits "Evidence" events

// Event handler
emitter.on("Evidence", (event) => {
  // event structure:
  // {
  //   transactionId: string,       // ID of the transaction
  //   blockNumber: number,         // Block number when the event was emitted
  //   transactionHash: string,     // Hash of the transaction that emitted the event
  //   timestamp: number,           // Timestamp when the event was emitted
  //   party: string,               // Address of the party who submitted evidence
  //   evidence: string,            // IPFS URI to the evidence
  //   arbitrator: string,          // Address of the arbitrator
  //   evidenceGroupId: string      // ID of the evidence group
  // }
  
  // Use this to update the evidence list in real-time
});
```

#### Listen for Ruling Events

```typescript
// Function to call
const emitter = klerosClient.listeners.listenForRuling({
  disputeId: transaction.disputeId
});

// Input:
// - disputeId: number - The ID of the dispute to monitor

// Output:
// - EventEmitter that emits "Ruling" events

// Event handler
emitter.on("Ruling", (event) => {
  // event structure:
  // {
  //   transactionId: string,       // ID of the transaction
  //   blockNumber: number,         // Block number when the event was emitted
  //   transactionHash: string,     // Hash of the transaction that emitted the event
  //   timestamp: number,           // Timestamp when the event was emitted
  //   disputeId: number,           // ID of the dispute
  //   ruling: number,              // The ruling given (0: Refused, 1: Sender wins, 2: Receiver wins)
  //   arbitrator: string           // Address of the arbitrator
  // }
  
  // Use this to update the UI when a ruling is given
});
```

### Action Functions

#### Pay (Release Funds)

```typescript
// Function to call
await klerosClient.actions.transaction.pay({
  transactionId: transactionId,
  amount: amountToRelease
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
  amount: amountToReimburse
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
// Function to call - for sender
await klerosClient.actions.dispute.payArbitrationFeeBySender({
  transactionId: transactionId,
  value: arbitrationCost
});

// Function to call - for receiver
await klerosClient.actions.dispute.payArbitrationFeeByReceiver({
  transactionId: transactionId,
  value: arbitrationCost
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
  fileTypeExtension: "pdf"      // Optional
});

await klerosClient.actions.evidence.submitEvidence({
  transactionId: transactionId,
  evidence: evidenceURI
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

#### Appeal a Ruling

```typescript
// Function to call
const appealCost = await klerosClient.services.dispute.getAppealCost(transaction.disputeId);

await klerosClient.actions.dispute.appeal({
  transactionId: transactionId,
  value: appealCost
});

// Input:
// - transactionId: string - The ID of the transaction
// - value: string - The appeal fee amount in ETH

// Output:
// - ethers.providers.TransactionResponse - The blockchain transaction details
// Available during the appeal period after a ruling
```

### UI Components to Include

1. **Transaction Header**
   - Transaction ID
   - Status badge (color-coded)
   - Creation date
   - Timeout countdown (if applicable)

2. **Transaction Details Panel**
   - Sender and receiver addresses (with ENS resolution if available)
   - Current amount in escrow
   - Transaction terms from meta-evidence
   - Attached files (if any)

3. **Action Panel**
   - Context-aware buttons based on:
     - Transaction status
     - User role (sender/receiver)
     - Timeout conditions
   - Payment/reimbursement form (when applicable)

4. **Evidence Panel**
   - List of submitted evidence from both parties
   - Evidence submission form
   - Preview of evidence contents

5. **Dispute Panel** (when a dispute exists)
   - Dispute status
   - Arbitration fee information
   - Ruling (if available)
   - Appeal information (if applicable)

6. **Transaction Timeline**
   - Chronological display of all transaction events
   - Payment history
   - Dispute events
   - Evidence submissions

### User Interactions

1. **Sender Actions**
   - Pay/release funds to receiver
   - Raise a dispute (pay arbitration fee)
   - Submit evidence
   - Execute timeout if receiver doesn't pay fee
   - Appeal ruling

2. **Receiver Actions**
   - Reimburse sender
   - Raise a dispute (pay arbitration fee)
   - Submit evidence
   - Execute timeout if sender doesn't pay fee
   - Appeal ruling

3. **General Actions**
   - Execute transaction after timeout
   - View evidence and transaction details
   - Download attached files

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
   - Show "Pay Arbitration Fee" when in WaitingSender/WaitingReceiver status (to the appropriate party)
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

### Responsive Design Considerations

1. **Desktop View**
   - Side-by-side panels for transaction details and actions
   - Tabbed interface for evidence, dispute, and timeline sections

2. **Mobile View**
   - Stacked panels with collapsible sections
   - Fixed action button at bottom of screen
   - Simplified timeline view

## Prompt 3. Dispute Details Screen

### Overview

Create a detailed view for an active dispute related to an escrow transaction. This screen should display comprehensive information about the dispute status, evidence from both parties, arbitration details, and provide appropriate actions based on the dispute phase and user role.

### Data Retrieval Functions

#### Get Dispute Information

```typescript
// Function to call
const dispute = await klerosClient.services.dispute.getDispute(transactionId);

// Input:
// - transactionId: string - The ID of the transaction with the dispute

// Output:
// - dispute: Dispute | null - A dispute object with the following structure (or null if no dispute exists):
//   {
//     id: number,                  // The dispute ID
//     transactionId: string,       // The ID of the transaction this dispute is for
//     status: DisputeStatus,       // Enum: Waiting, Appealable, Solved
//     ruling?: Ruling,             // Enum: RefusedToRule, SenderWins, ReceiverWins
//     arbitrator: string,          // Address of the arbitrator contract
//     arbitratorExtraData: string, // Extra data for the arbitrator
//     evidenceGroupId: string,     // ID of the evidence group
//     appealPeriodStart?: number,  // Timestamp when the appeal period starts
//     appealPeriodEnd?: number     // Timestamp when the appeal period ends
//   }
```

#### Get Transaction Details

```typescript
// Function to call
const transaction = await klerosClient.services.transaction.getTransaction(transactionId);

// Input:
// - transactionId: string - The ID of the transaction

// Output: Transaction object as described in Prompt 2
// This is needed to understand the context of the dispute
```

#### Get Arbitrator Information

```typescript
// Function to call
const arbitrator = await klerosClient.services.arbitrator.getArbitrator();

// Input: None

// Output:
// - arbitrator: Arbitrator - An arbitrator object with the following structure:
//   {
//     address: string,             // Address of the arbitrator contract
//     arbitrationCost: string,     // Current arbitration cost in wei
//     appealCost: string           // Current appeal cost in wei
//   }
```

#### Get Appeal Cost

```typescript
// Function to call
const appealCost = await klerosClient.services.dispute.getAppealCost(dispute.id);

// Input:
// - dispute.id: number - The ID of the dispute

// Output:
// - appealCost: string - The appeal cost in wei
// This is needed to display the cost of appealing a ruling
```

#### Get Evidence Submissions

```typescript
// Function to call
const evidenceEvents = await klerosClient.services.event.getEvidenceEvents(transactionId);

// Input:
// - transactionId: string - The ID of the transaction (same as evidenceGroupId)

// Output:
// - evidenceEvents: EvidenceEvent[] - Array of evidence events with the following structure:
//   {
//     transactionId: string,       // ID of the transaction
//     blockNumber: number,         // Block number when the event was emitted
//     transactionHash: string,     // Hash of the transaction that emitted the event
//     timestamp: number,           // Timestamp when the event was emitted
//     party: string,               // Address of the party who submitted evidence
//     evidence: string,            // IPFS URI to the evidence
//     arbitrator: string,          // Address of the arbitrator
//     evidenceGroupId: string      // ID of the evidence group
//   }
```

#### Fetch Evidence Content

```typescript
// Function to call
const evidenceData = await klerosClient.services.ipfs.fetchFromIPFS(evidenceURI);

// Input:
// - evidenceURI: string - IPFS URI of the evidence (from evidence event)

// Output:
// - evidenceData: object - The parsed JSON data from IPFS containing:
//   {
//     name: string,                // Title of the evidence
//     description: string,         // Detailed description
//     fileURI?: string,            // Optional attached file
//     fileTypeExtension?: string   // File type if applicable
//   }
// Use this to display evidence details
```

#### Get Dispute Timeline

```typescript
// Function to call
const disputeEvents = await klerosClient.services.event.getDisputeEvents(transactionId);
const rulingEvents = await klerosClient.services.event.getRulingEvents(transactionId);

// Input:
// - transactionId: string - The ID of the transaction

// Output:
// - disputeEvents: DisputeEvent[] - Array of dispute creation events
// - rulingEvents: RulingEvent[] - Array of ruling events
// Use these to build a timeline of the dispute
```

### Event Listeners for Real-time Updates

#### Listen for Evidence Submissions

```typescript
// Function to call
const emitter = klerosClient.listeners.listenForEvidence({
  evidenceGroupId: transactionId
});

// Input:
// - evidenceGroupId: string - The ID of the evidence group (same as transactionId)

// Output:
// - EventEmitter that emits "Evidence" events

// Event handler
emitter.on("Evidence", (event) => {
  // event structure as described earlier
  // Use this to update the evidence list in real-time
});
```

#### Listen for Ruling Events

```typescript
// Function to call
const emitter = klerosClient.listeners.listenForRuling({
  disputeId: dispute.id
});

// Input:
// - disputeId: number - The ID of the dispute to monitor

// Output:
// - EventEmitter that emits "Ruling" events

// Event handler
emitter.on("Ruling", (event) => {
  // event structure as described earlier
  // Use this to update the UI when a ruling is given
});
```

### Action Functions

#### Submit Evidence

```typescript
// Function to call
const evidenceURI = await klerosClient.services.ipfs.uploadEvidence({
  name: "Evidence Title",
  description: "Detailed description of the evidence",
  fileURI: "/ipfs/QmFileHash", // Optional
  fileTypeExtension: "pdf"      // Optional
});

await klerosClient.actions.evidence.submitEvidence({
  transactionId: transactionId,
  evidence: evidenceURI
});

// Input:
// - transactionId: string - The ID of the transaction
// - evidence: string - IPFS URI of the uploaded evidence

// Output:
// - ethers.providers.TransactionResponse - The blockchain transaction details
// Available to both sender and receiver while the dispute is active
```

#### Upload File to IPFS

```typescript
// Function to call
const fileData = new Uint8Array([/* binary data */]);
const fileCid = await klerosClient.services.ipfs.uploadToIPFS(fileData, "document.pdf");

// Input:
// - fileData: Uint8Array - The binary data of the file
// - fileName: string - The name of the file

// Output:
// - fileCid: string - The IPFS Content Identifier (CID) of the uploaded file
// Use this to upload evidence files before creating the evidence JSON
```

#### Appeal a Ruling

```typescript
// Function to call
await klerosClient.actions.dispute.appeal({
  transactionId: transactionId,
  value: appealCost
});

// Input:
// - transactionId: string - The ID of the transaction
// - value: string - The appeal fee amount in ETH

// Output:
// - ethers.providers.TransactionResponse - The blockchain transaction details
// Available during the appeal period after a ruling
```

### UI Components to Include

1. **Dispute Header**
   - Dispute ID
   - Status badge (color-coded)
   - Creation date
   - Appeal period countdown (if applicable)

2. **Transaction Context Panel**
   - Link back to transaction details
   - Transaction summary (amount, parties)
   - Original transaction terms

3. **Dispute Status Panel**
   - Current dispute phase
   - Ruling (if available)
   - Arbitrator information
   - Appeal information (if applicable)
   - Appeal period timer (if in appeal period)

4. **Evidence Panel**
   - Tabbed view of evidence from each party
   - Evidence submission form
   - Evidence preview
   - File download options

5. **Timeline Panel**
   - Chronological display of dispute events
   - Evidence submissions
   - Rulings
   - Appeals

6. **Action Panel**
   - Context-aware buttons based on:
     - Dispute status
     - User role
     - Appeal period

### User Interactions

1. **Evidence Submission Flow**
   - Click "Submit Evidence" button
   - Upload file(s) if needed
   - Fill out evidence form (title, description)
   - Preview evidence
   - Submit and wait for confirmation
   - See evidence added to the list

2. **Appeal Flow**
   - View ruling details
   - Check appeal period timer
   - Click "Appeal Ruling" button
   - Review appeal cost
   - Confirm and pay appeal fee
   - Wait for confirmation
   - See dispute status updated

3. **Evidence Review**
   - Toggle between evidence from different parties
   - View evidence details
   - Download attached files
   - See evidence submission timestamps

### Conditional Rendering Logic

1. **Evidence Submission**
   - Only show to transaction parties (sender or receiver)
   - Only enable when dispute is in Waiting status
   - Disable after ruling if not in appeal period

2. **Appeal Actions**
   - Only show when dispute is in Appealable status
   - Only enable during appeal period
   - Show countdown timer for appeal deadline
   - Disable after appeal period ends

3. **Ruling Display**
   - Show "Waiting for ruling" when in Waiting status
   - Show ruling details when available
   - Highlight winning party
   - Show appeal information if in appeal period

### Error Handling

1. **Evidence Submission Errors**
   - Handle IPFS upload failures
   - Validate evidence format
   - Check file size limits
   - Provide clear error messages

2. **Appeal Errors**
   - Check if user has sufficient funds
   - Validate appeal period
   - Handle transaction failures
   - Show helpful error messages

3. **Loading States**
   - Show loading indicators for evidence fetching
   - Display placeholders during IPFS content loading
   - Implement skeleton screens for better UX

### Responsive Design Considerations

1. **Desktop View**
   - Side-by-side panels for dispute details and evidence
   - Tabbed interface for different sections
   - Timeline displayed as vertical flow

2. **Mobile View**
   - Stacked panels with collapsible sections
   - Simplified evidence display
   - Compact timeline view
   - Fixed action button at bottom of screen

### Integration with Arbitrator

1. **Arbitrator Information**
   - Display arbitrator name/address
   - Show arbitration cost
   - Link to arbitrator details (if available)

2. **Court Information** (if using Kleros Court)
   - Display court/subcourt information
   - Show juror count
   - Display voting period information

## IPFS Data Formats

This section defines the specific data formats used when storing information on IPFS for the Kleros Escrow interface.

### Evidence Format

Evidence is stored as a JSON object with the following structure:

```json
{
  "title": "Evidence Title",
  "description": "Detailed description of the evidence"
}
```

Optional fields that can be included:
```json
{
  "fileURI": "/ipfs/QmFileHash",
  "fileTypeExtension": "pdf"
}
```

#### Required Fields:
- `title` (string): A concise title for the evidence
- `description` (string): A detailed description explaining the evidence and its relevance

#### Optional Fields:
- `fileURI` (string): IPFS URI pointing to an uploaded file
- `fileTypeExtension` (string): The file extension to indicate the type of file (e.g., "pdf", "jpg", "png", "txt")

### MetaEvidence Format

MetaEvidence is a comprehensive JSON object that defines the terms and context of an escrow transaction. Here's the complete format:

```json
{
  "category": "Escrow",
  "subCategory": "General Service",
  "title": "Transaction Title",
  "description": "Detailed description of the transaction terms",
  "question": "Which party abided by terms of the contract?",
  "rulingOptions": {
    "type": "single-select",
    "titles": [
      "Refund Sender",
      "Pay Receiver"
    ],
    "descriptions": [
      "Select to return funds to the Sender",
      "Select to release funds to the Receiver"
    ]
  },
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

#### Required Fields:
- `category` (string): Always "Escrow" for escrow transactions
- `title` (string): A concise title for the transaction
- `description` (string): Detailed description of the transaction terms
- `question` (string): The question posed to arbitrators in case of a dispute
- `rulingOptions` (object): Options for arbitrators to rule on
  - `type` (string): Always "single-select" for escrow disputes
  - `titles` (array): Short labels for each ruling option
  - `descriptions` (array): Detailed explanations of each ruling option

#### Optional Fields:
- `subCategory` (string): More specific categorization (e.g., "General Service", "Physical goods")
- `sender` (string): Ethereum address of the sender
- `receiver` (string): Ethereum address of the receiver
- `amount` (string): Transaction amount as a string
- `timeout` (number): Timeout period in seconds
- `token` (object): Information about the token used for payment
  - `name` (string): Token name
  - `ticker` (string): Token symbol
  - `symbolURI` (string): Path to token icon
  - `address` (string or null): Token contract address (null for ETH)
  - `decimals` (number): Number of decimal places
- `extraData` (object): Additional custom fields relevant to the transaction
- `evidenceDisplayInterfaceURI` (string): IPFS URI to a custom evidence display interface
- `aliases` (object): Human-readable names for addresses

### IPFS URI Format

IPFS URIs should follow this format:
```
/ipfs/Qm...
```

Where `Qm...` is the IPFS Content Identifier (CID). The URI should not include a gateway prefix, as the gateway will be determined by the client application.

### File Upload Considerations

When uploading files to IPFS:

1. **File Size**: Keep files under 10MB when possible for faster loading
2. **Supported Formats**: Common web formats are recommended:
   - Images: JPG, PNG, GIF, SVG
   - Documents: PDF, TXT, MD
   - Data: JSON, CSV
3. **Compression**: Consider compressing large files before upload
4. **Persistence**: Important files should be pinned to ensure they remain available
