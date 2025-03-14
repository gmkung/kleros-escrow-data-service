# Kleros Escrow Data Service

This library provides a TypeScript interface for interacting with the Kleros MultipleArbitrableTransaction contract, which enables secure escrow transactions with built-in dispute resolution.

## User Flows

### 1. Creating an Escrow Transaction

The sender creates a new escrow transaction by specifying:

- The receiver's address
- The payment amount
- A timeout period
- Meta-evidence (details about the transaction)

```typescript
// Create meta-evidence
const metaEvidenceURI = await klerosClient.services.ipfs.uploadMetaEvidence({
  title: "Software Development Agreement",
  description: "Payment for website development",
  category: "Services",
  question: "Should the payment be released to the receiver?",
  rulingOptions: {
    titles: ["Release to receiver", "Return to sender"],
    descriptions: [
      "Funds will be sent to the receiver",
      "Funds will be returned to the sender",
    ],
  },
});
// Returns: IPFS URI string (e.g., "/ipfs/QmT2o...")

// Create transaction
const result = await klerosClient.actions.transaction.createTransaction({
  receiver: "0xReceiverAddress",
  value: "1.0", // 1 ETH
  timeoutPayment: 86400 * 30, // 30 days in seconds
  metaEvidence: metaEvidenceURI,
});
/* Returns: {
  transactionResponse: ethers.providers.TransactionResponse, // The blockchain transaction details
  transactionId: string // The ID of the created transaction (used for all future interactions)
} */
```

### 2. Releasing Funds

If both parties are satisfied, the sender can release funds to the receiver:

```typescript
await klerosClient.actions.transaction.pay({
  transactionId: "123",
  amount: "1.0", // Amount to release
});
// Returns: ethers.providers.TransactionResponse - The blockchain transaction details
```

### 3. Reimbursing Funds

If the receiver cannot fulfill their obligations, they can reimburse the sender:

```typescript
await klerosClient.actions.transaction.reimburse({
  transactionId: "123",
  amount: "0.5", // Amount to reimburse
});
// Returns: ethers.providers.TransactionResponse - The blockchain transaction details
```

### 4. Automatic Execution After Timeout

If the timeout period passes without a dispute, anyone can execute the transaction:

```typescript
// Check if transaction can be executed
const canExecute =
  await klerosClient.services.transaction.canExecuteTransaction("123");
// Returns: boolean - True if the transaction can be executed (timeout has passed and no dispute exists)

if (canExecute) {
  await klerosClient.actions.transaction.executeTransaction("123");
  // Returns: ethers.providers.TransactionResponse - The blockchain transaction details
}
```

### 5. Raising a Dispute

If there's a disagreement, either party can raise a dispute by paying the arbitration fee:

```typescript
// Get arbitration cost
const arbitrationCost =
  await klerosClient.services.dispute.getArbitrationCost();
// Returns: string - The arbitration cost in wei

// Sender pays arbitration fee
await klerosClient.actions.dispute.payArbitrationFeeBySender({
  transactionId: "123",
  value: arbitrationCost,
});
/* Returns: ethers.providers.TransactionResponse - The blockchain transaction details
   Note: This doesn't immediately create a dispute. A dispute is only created when both parties pay their fees. */

// Receiver pays arbitration fee
await klerosClient.actions.dispute.payArbitrationFeeByReceiver({
  transactionId: "123",
  value: arbitrationCost,
});
/* Returns: ethers.providers.TransactionResponse - The blockchain transaction details
   Note: If the sender has already paid their fee, this will create a dispute. */
```

### 6. Submitting Evidence

Both parties can submit evidence to support their case:

```typescript
// Create evidence
const evidenceURI = await klerosClient.services.ipfs.uploadEvidence({
  name: "Delivery Proof",
  description: "Screenshots showing completed work",
  fileURI: "/ipfs/QmFileHash", // Optional
  fileTypeExtension: "png",
});
// Returns: string - IPFS URI of the uploaded evidence (e.g., "/ipfs/QmE7...")

// Submit evidence
await klerosClient.actions.evidence.submitEvidence({
  transactionId: "123",
  evidence: evidenceURI,
});
// Returns: ethers.providers.TransactionResponse - The blockchain transaction details
```

### 7. Handling Timeouts During Dispute

If one party fails to pay the arbitration fee within the timeout period:

```typescript
// Check if a timeout can be executed
const timeoutStatus = await klerosClient.services.transaction.canTimeOut("123");
/* Returns: {
  canSenderTimeOut: boolean, // True if the receiver hasn't paid the fee within the timeout period
  canReceiverTimeOut: boolean // True if the sender hasn't paid the fee within the timeout period
} */

// If sender didn't pay, receiver can execute timeout
if (timeoutStatus.canReceiverTimeOut) {
  await klerosClient.actions.transaction.timeOutByReceiver("123");
  // Returns: ethers.providers.TransactionResponse - The blockchain transaction details
  // This will resolve the dispute in favor of the receiver
}

// If receiver didn't pay, sender can execute timeout
if (timeoutStatus.canSenderTimeOut) {
  await klerosClient.actions.transaction.timeOutBySender("123");
  // Returns: ethers.providers.TransactionResponse - The blockchain transaction details
  // This will resolve the dispute in favor of the sender
}
```

### 8. Appealing a Ruling

If a party disagrees with the arbitrator's ruling, they can appeal:

```typescript
// Get appeal cost
const appealCost = await klerosClient.services.dispute.getAppealCost(disputeId);
// Returns: string - The appeal cost in wei

// Appeal the ruling
await klerosClient.actions.dispute.appeal({
  transactionId: "123",
  value: appealCost,
});
// Returns: ethers.providers.TransactionResponse - The blockchain transaction details
```

### 9. Monitoring Events

Listen for events to track the status of transactions:

```typescript
// Listen for payment events
const emitter = klerosClient.listeners.listenForPayment({
  transactionId: "123",
});
/* Returns: EventEmitter - An event emitter that will emit "Payment" events
   The emitted events have the following structure:
   {
     transactionId: string,
     blockNumber: number,
     transactionHash: string,
     timestamp: number,
     party: string, // Address of the party who made/received the payment
     amount: string // Amount paid in wei
   }
*/
emitter.on("Payment", (event) => {
  console.log(`Payment of ${event.amount} made by ${event.party}`);
});

// Listen for dispute events
const disputeEmitter = klerosClient.listeners.listenForDispute({
  disputeId: 456,
});
/* Returns: EventEmitter - An event emitter that will emit "Dispute" events
   The emitted events have the following structure:
   {
     transactionId: string,
     blockNumber: number,
     transactionHash: string,
     timestamp: number,
     disputeId: number,
     arbitrator: string, // Address of the arbitrator contract
     metaEvidenceId: string,
     evidenceGroupId: string
   }
*/
disputeEmitter.on("Dispute", (event) => {
  console.log(
    `Dispute ${event.disputeId} created for transaction ${event.transactionId}`
  );
});
```

## Utility Functions

### Finding Transactions

```typescript
// Get all transactions for an address
const myTransactions =
  await klerosClient.services.transaction.getTransactionsByAddress(
    "0xMyAddress"
  );
/* Returns: Transaction[] - Array of transaction objects with the following structure:
   {
     id: string,
     sender: string, // Address of the sender
     receiver: string, // Address of the receiver
     amount: string, // Current amount in escrow (in wei)
     status: TransactionStatus, // Enum: NoDispute, WaitingSender, WaitingReceiver, DisputeCreated, Resolved
     timeoutPayment: number, // Timeout period in seconds
     lastInteraction: number, // Timestamp of the last interaction
     createdAt: number, // Timestamp when the transaction was created
     disputeId?: number, // ID of the dispute if one exists
     senderFee: string, // Arbitration fee paid by sender (in wei)
     receiverFee: string // Arbitration fee paid by receiver (in wei)
   }
*/

// Get transaction count
const count = await klerosClient.services.transaction.getTransactionCount();
// Returns: number - The total number of transactions in the contract
```

### Fetching Transaction Details

```typescript
// Get transaction details
const transaction =
  await klerosClient.services.transaction.getTransaction("123");
/* Returns: Transaction - A transaction object with the following structure:
   {
     id: string,
     sender: string, // Address of the sender
     receiver: string, // Address of the receiver
     amount: string, // Current amount in escrow (in wei)
     status: TransactionStatus, // Enum: NoDispute, WaitingSender, WaitingReceiver, DisputeCreated, Resolved
     timeoutPayment: number, // Timeout period in seconds
     lastInteraction: number, // Timestamp of the last interaction
     createdAt: number, // Timestamp when the transaction was created
     disputeId?: number, // ID of the dispute if one exists
     senderFee: string, // Arbitration fee paid by sender (in wei)
     receiverFee: string // Arbitration fee paid by receiver (in wei)
   }
*/

// Get amount paid by a party
const amountPaid = await klerosClient.services.transaction.getAmountPaid(
  "123",
  "0xPartyAddress"
);
// Returns: string - The amount paid by the specified party in wei
```

### Fetching Dispute Details

```typescript
// Get dispute information
const dispute = await klerosClient.services.dispute.getDispute("123");
/* Returns: Dispute | null - A dispute object with the following structure (or null if no dispute exists):
   {
     id: number, // The dispute ID
     transactionId: string, // The ID of the transaction this dispute is for
     status: DisputeStatus, // Enum: Waiting, Appealable, Solved
     ruling?: Ruling, // Enum: RefusedToRule, SenderWins, ReceiverWins
     arbitrator: string, // Address of the arbitrator contract
     arbitratorExtraData: string, // Extra data for the arbitrator
     evidenceGroupId: string, // ID of the evidence group
     appealPeriodStart?: number, // Timestamp when the appeal period starts
     appealPeriodEnd?: number // Timestamp when the appeal period ends
   }
*/

// Get arbitrator information
const arbitrator = await klerosClient.services.arbitrator.getArbitrator();
/* Returns: Arbitrator - An arbitrator object with the following structure:
   {
     address: string, // Address of the arbitrator contract
     arbitrationCost: string, // Current arbitration cost in wei
     appealCost: string // Current appeal cost in wei
   }
*/
```

## Additional Functions

### IPFS Functions

The library provides low-level IPFS functions for handling file uploads and retrievals:

```typescript
// Upload binary data to IPFS
const fileData = new Uint8Array([
  /* binary data */
]);
const cid = await klerosClient.services.ipfs.uploadToIPFS(
  fileData,
  "document.pdf"
);
/* Returns: string - The IPFS Content Identifier (CID) of the uploaded file
   This is the unique hash that identifies the content on IPFS */

// Upload JSON data to IPFS
const jsonData = {
  title: "Contract Agreement",
  details: "Terms and conditions...",
  date: "2023-05-15",
};
const jsonCid = await klerosClient.services.ipfs.uploadJSONToIPFS(jsonData);
/* Returns: string - The IPFS CID of the uploaded JSON data
   This is used internally by uploadEvidence and uploadMetaEvidence */

// Fetch data from IPFS
const fetchedData =
  await klerosClient.services.ipfs.fetchFromIPFS("/ipfs/QmHash");
/* Returns: any - The parsed JSON data from IPFS
   This can be used to retrieve evidence or meta-evidence details */
```

#### Evidence Format

When uploading evidence, use the following JSON structure:

```typescript
const evidenceURI = await klerosClient.services.ipfs.uploadEvidence({
  name: "Evidence Title",
  description: "Detailed description of the evidence",
  // Optional fields
  fileURI: "/ipfs/QmFileHash", // If there's an attached file
  fileTypeExtension: "pdf", // File type if applicable
});
```

The evidence JSON must include:

- `name` (string): A concise title for the evidence
- `description` (string): A detailed description explaining the evidence and its relevance

Optional fields:

- `fileURI` (string): IPFS URI pointing to an uploaded file
- `fileTypeExtension` (string): The file extension to indicate the type of file

#### MetaEvidence Format

MetaEvidence is a comprehensive JSON object that defines the terms and context of an escrow transaction. Here's the complete format:

```typescript
const metaEvidenceURI = await klerosClient.services.ipfs.uploadMetaEvidence({
  // Required fields
  category: "Escrow",
  title: "Transaction Title",
  description: "Detailed description of the transaction terms",
  question: "Which party abided by terms of the contract?",
  rulingOptions: {
    type: "single-select",
    titles: ["Refund Sender", "Pay Receiver"],
    descriptions: [
      "Select to return funds to the Sender",
      "Select to release funds to the Receiver",
    ],
  },

  // Optional fields
  subCategory: "General Service",
  sender: "0xSenderAddress",
  receiver: "0xReceiverAddress",
  amount: "1.0",
  timeout: 86400,
  token: {
    name: "Ethereum",
    ticker: "ETH",
    symbolURI: "/path/to/eth/symbol.png",
    address: null,
    decimals: 18,
  },
  extraData: {
    "Contract Information": "Additional contract details can go here...",
  },
  evidenceDisplayInterfaceURI: "/ipfs/QmEvidenceDisplayInterface",
  aliases: {
    "0xSenderAddress": "sender",
    "0xReceiverAddress": "receiver",
  },
});
```

Example of a complete MetaEvidence object:

```json
{
  "subCategory": "General Service",
  "arbitrableAddress": "0x0d67440946949fe293b45c52efd8a9b3d51e2522",
  "title": "Pyrt promo with @Jackson_325",
  "description": "1. Scope of Work\n\nThe Marketer agrees to promote the Pyrand token (PYRT) by making a post on the designated Telegram group/channel (uniswappowercalls).\n\n2. Payment Terms\n\nThe Client agrees to compensate the Marketer as follows:\n\t•\tFirst Payment: 50% of the total agreed compensation upon the Marketer posting about PYRT on the designated Telegram group/channel.\n\t•\tSecond Payment: The remaining 50% will be paid when PYRT reaches a market capitalization of $1.5 million, as measured by the official Uniswap listing or another agreed-upon price-tracking source. ",
  "sender": "0x281f00345459aA6E9e4DF56059e517dF562938b1",
  "receiver": "0x281f00345459aA6E9e4DF56059e517dF562938b1",
  "amount": ".4",
  "timeout": 8640000000000000,
  "token": {
    "name": "Ethereum",
    "ticker": "ETH",
    "symbolURI": "/static/media/eth.33901ab6.png",
    "address": null,
    "decimals": 18
  },
  "extraData": {
    "Contract Information": "1. Scope of Work\n\nThe Marketer agrees to promote the Pyrand token (PYRT) by making a post on the designated Telegram group/channel (uniswappowercalls).\n\n2. Payment Terms\n\nThe Client agrees to compensate the Marketer as follows:\n\t•\tFirst Payment: 50% of the total agreed compensation upon the Marketer posting about PYRT on the designated Telegram group/channel.\n\t•\tSecond Payment: The remaining 50% will be paid when PYRT reaches a market capitalization of $1.5 million, as measured by the official Uniswap listing or another agreed-upon price-tracking source. "
  },
  "invoice": true,
  "category": "Escrow",
  "question": "Which party abided by terms of the contract?",
  "rulingOptions": {
    "type": "single-select",
    "titles": ["Refund Sender", "Pay Receiver"],
    "descriptions": [
      "Select to return funds to the Sender",
      "Select to release funds to the Receiver"
    ]
  },
  "evidenceDisplayInterfaceURI": "/ipfs/QmfPnVdcCjApHdiCC8wAmyg5iR246JvVuQGQjQYgtF8gZU/index.html",
  "aliases": {
    "0x281f00345459aA6E9e4DF56059e517dF562938b1": "receiver"
  }
}
```

These IPFS functions are essential for preparing evidence and meta-evidence before submitting them to the blockchain. The workflow typically involves:

1. Uploading evidence/meta-evidence data to IPFS
2. Getting back an IPFS URI (CID)
3. Using that URI in contract interactions

### Arbitrator Configuration Functions

```typescript
// Get the fee timeout period
const feeTimeout = await klerosClient.services.dispute.getFeeTimeout();
/* Returns: number - The timeout period in seconds for paying arbitration fees
   This is how long parties have to pay their arbitration fees before being considered unresponsive */

// Get arbitrator address
const arbitratorAddress =
  await klerosClient.services.arbitrator.getArbitrator();
// Returns: string - The address of the arbitrator contract

// Get arbitrator extra data
const extraData =
  await klerosClient.services.arbitrator.getArbitratorExtraData();
// Returns: string - The extra data used when creating disputes

// Get subcourt ID
const subcourt = await klerosClient.services.arbitrator.getSubcourt();
// Returns: number - The subcourt ID used for disputes
```

### Event Retrieval Functions

```typescript
// Get all events for a transaction
const events = await klerosClient.services.event.getEventsForTransaction("123");
/* Returns: BaseEvent[] - Array of all events related to the transaction, sorted by block number
   This includes payment events, dispute events, evidence events, etc. */

// Get specific event types
const paymentEvents = await klerosClient.services.event.getPaymentEvents("123");
/* Returns: PaymentEvent[] - Array of payment events for the transaction */

const disputeEvents = await klerosClient.services.event.getDisputeEvents("123");
/* Returns: DisputeEvent[] - Array of dispute events for the transaction */

const evidenceEvents =
  await klerosClient.services.event.getEvidenceEvents("123");
/* Returns: EvidenceEvent[] - Array of evidence submission events for the transaction */

const rulingEvents = await klerosClient.services.event.getRulingEvents("123");
/* Returns: RulingEvent[] - Array of ruling events for the transaction */
```

### Gas Estimation Functions

Before sending transactions, you can estimate the gas cost:

```typescript
// Estimate gas for creating a transaction
const createGas =
  await klerosClient.actions.transaction.estimateGasForCreateTransaction({
    receiver: "0xReceiverAddress",
    value: "1.0",
    timeoutPayment: 86400 * 30,
    metaEvidence: metaEvidenceURI,
  });
// Returns: ethers.BigNumber - The estimated gas cost

// Estimate gas for paying arbitration fee
const arbitrationGas =
  await klerosClient.actions.dispute.estimateGasForPayArbitrationFeeBySender({
    transactionId: "123",
    value: arbitrationCost,
  });
// Returns: ethers.BigNumber - The estimated gas cost

// Estimate gas for submitting evidence
const evidenceGas =
  await klerosClient.actions.evidence.estimateGasForSubmitEvidence({
    transactionId: "123",
    evidence: evidenceURI,
  });
// Returns: ethers.BigNumber - The estimated gas cost
```

These gas estimation functions help users understand the cost of their actions before executing them, which is especially important for expensive operations like creating disputes.
