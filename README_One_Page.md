# Prompt: Kleros Escrow Transaction Explorer

## Overview
Create a simple one-page web application that allows users to explore Kleros escrow transactions. The app should let users enter a transaction ID and display all related metadata and events in a beautiful, user-friendly interface.

## Requirements

### Design
- Create a clean, metallic interface with a technical/mechanical design
- Use a soothing color palette with the primary color being a purplish metallic sheen gradient (#3E7BFA)
- Include subtle animations for state transitions
- Make the UI responsive for both desktop and mobile
- Use friendly, rounded corners and soft shadows for UI elements

### Functionality
1. **Transaction ID Input**
   - A prominent search bar where users can enter a transaction ID
   - A "Explore" button to trigger the data retrieval
   - Input validation to ensure the transaction ID is valid

2. **Transaction Details Display**
   - Show basic transaction information:
     - Sender and receiver addresses (with ENS resolution if available)
     - Current amount in escrow
     - Transaction status with a color-coded indicator
     - Creation date in a human-readable format
     - Timeout period with a countdown if applicable

3. **Meta-Evidence Display**
   - Fetch and display the transaction's meta-evidence:
     - Title and description
     - Category and subcategory
     - Question for arbitrators
     - Ruling options
     - Any attached files with download links

4. **Events Timeline**
   - Display all events related to the transaction in a chronological timeline
   - Each event should be represented as a card with:
     - Event type icon
     - Timestamp in human-readable format
     - Event details formatted for readability
     - Transaction hash with a link to Etherscan

5. **Event Type Filtering**
   - Add toggle buttons to filter events by type:
     - Payment events
     - Dispute events
     - Evidence events
     - Ruling events
     - Meta-evidence events

### Technical Implementation

1. **Setup**
   ```bash
   # Create a new React project using your preferred method
   # For example, with Create React App, Vite, Next.js, etc.
   
   # Install the required Kleros Escrow Data Service package
   npm install kleros-escrow-data-service
   
   # Install ethers v5 (required dependency)
   npm install ethers@5
   
   # Install GraphQL client (used internally by the service)
   npm install graphql-request graphql
   
   # Install any additional UI libraries of your choice for styling and animations
   ```

2. **Client Initialization**
   ```typescript
   import { createKlerosEscrowClient } from "kleros-escrow-data-service";
   import { ethers } from "ethers";

   // Configuration for the Kleros Escrow client
   const config = {
     provider: {
       url: "https://ethereum.publicnode.com",
       networkId: 1, // Ethereum mainnet
     },
     multipleArbitrableTransaction: {
       address: "0x0d67440946949FE293B45c52eFD8A9b3d51e2522", // Contract address
     },
     ipfsGateway: "https://cdn.kleros.link", // Default IPFS gateway
   };

   // Create read-only client
   const klerosClient = createKlerosEscrowClient(config);
   ```

3. **Transaction Data Retrieval**
   ```typescript
   async function getTransactionData(transactionId: string) {
     try {
       // Get transaction details
       const transaction = await klerosClient.services.transaction.getTransaction(transactionId);
       
       // Get all events in a single query
       const events = await klerosClient.services.event.getTransactionDetails(transactionId);
       
       // Get meta-evidence data if available
       let metaEvidenceData = null;
       if (events.metaEvidences.length > 0) {
         const metaEvidenceURI = events.metaEvidences[0]?._evidence;
         metaEvidenceData = await klerosClient.services.ipfs.fetchFromIPFS(metaEvidenceURI);
       }
       
       // Get dispute details if exists
       let dispute = null;
       if (transaction.disputeId) {
         dispute = await klerosClient.services.dispute.getDispute(transactionId);
       }
       
       return {
         transaction,
         events,
         metaEvidenceData,
         dispute
       };
     } catch (error) {
       console.error("Error fetching transaction data:", error);
       throw error;
     }
   }
   ```

4. **Event Type Detection**
   ```typescript
   // No longer needed as events are already categorized by type in the response
   ```

5. **Event Display Formatting**
   ```typescript
   function formatEvent(event, type: 'payment' | 'dispute' | 'evidence' | 'ruling' | 'metaEvidence') {
     switch (type) {
       case 'payment':
         return {
           title: 'Payment',
           description: `${ethers.utils.formatEther(event._amount)} ETH ${event._party === transaction.sender ? 'sent by sender' : 'reimbursed by receiver'}`,
           icon: '💰',
           timestamp: new Date(parseInt(event.blockTimestamp) * 1000)
         };
       case 'dispute':
         return {
           title: 'Dispute Created',
           description: `Dispute #${event._disputeID} created`,
           icon: '⚖️',
           timestamp: new Date(parseInt(event.blockTimestamp) * 1000)
         };
       case 'evidence':
         return {
           title: 'Evidence Submitted',
           description: `Evidence submitted by ${event._party === transaction.sender ? 'sender' : 'receiver'}`,
           icon: '📄',
           timestamp: new Date(parseInt(event.blockTimestamp) * 1000),
           link: event._evidence
         };
       case 'ruling':
         const rulingText = ['Refused to Rule', 'Sender Wins', 'Receiver Wins'][parseInt(event._ruling)];
         return {
           title: 'Ruling Given',
           description: `Ruling: ${rulingText}`,
           icon: '🏛️',
           timestamp: new Date(parseInt(event.blockTimestamp) * 1000)
         };
       case 'metaEvidence':
         return {
           title: 'Transaction Created',
           description: 'Transaction terms defined',
           icon: '📝',
           timestamp: new Date(parseInt(event.blockTimestamp) * 1000),
           link: event._evidence
         };
     }
   }
   ```

### Data Formats

The Kleros Escrow Data Service now provides a more efficient, GraphQL-based approach to fetch all transaction-related data. Here are the detailed data structures:

1. **Events Response**
   ```typescript
   // From klerosClient.services.event.getTransactionDetails(transactionId)
   interface TransactionEvents {
     // Meta Evidence Events - Transaction metadata
     metaEvidences: {
       id: string;                // Unique identifier
       blockTimestamp: string;    // When the event was emitted
       transactionHash: string;   // Transaction that emitted the event
       _evidence: string;         // IPFS URI containing transaction metadata
       blockNumber: string;       // Block number when emitted
     }[];

     // Payment Events - Funds transferred
     payments: {
       id: string;               // Unique identifier
       _transactionID: string;   // Associated transaction ID
       _amount: string;          // Amount in wei
       _party: string;           // Address of the party involved
       blockNumber: string;      // Block number when emitted
       blockTimestamp: string;   // When the event was emitted
       transactionHash: string;  // Transaction that emitted the event
     }[];

     // Evidence Events - Submitted proofs/documents
     evidences: {
       _arbitrator: string;      // Arbitrator contract address
       _party: string;           // Address of the party submitting evidence
       _evidence: string;        // IPFS URI containing evidence data
       _evidenceGroupID: string; // Group ID for related evidence
       blockNumber: string;      // Block number when emitted
       transactionHash: string;  // Transaction that emitted the event
     }[];

     // Dispute Events - Created disputes
     disputes: {
       _arbitrator: string;      // Arbitrator contract address
       _disputeID: string;       // Unique identifier for the dispute
       blockNumber: string;      // Block number when emitted
       blockTimestamp: string;   // When the event was emitted
       _metaEvidenceID: string;  // Associated meta evidence ID
       _evidenceGroupID: string; // Group ID for related evidence
       transactionHash: string;  // Transaction that emitted the event
     }[];

     // Fee Payment Events - Required arbitration fees
     hasToPayFees: {
       _transactionID: string;   // Associated transaction ID
       blockNumber: string;      // Block number when emitted
       blockTimestamp: string;   // When the event was emitted
       _party: string;           // Address of the party required to pay
       transactionHash: string;  // Transaction that emitted the event
     }[];

     // Ruling Events - Dispute decisions (only present if disputes exist)
     rulings: {
       _arbitrator: string;      // Arbitrator contract address
       _disputeID: string;       // ID of the dispute this ruling is for
       blockNumber: string;      // Block number when emitted
       blockTimestamp: string;   // When the event was emitted
       _ruling: string;          // The ruling (0: Refused, 1: Sender, 2: Receiver)
       transactionHash: string;  // Transaction that emitted the event
     }[];
   }
   ```

2. **Transaction Object**
   ```typescript
   // From klerosClient.services.transaction.getTransaction(transactionId)
   {
     id: string,                    // Unique identifier for the transaction
     sender: string,                // Address of the sender (payer)
     receiver: string,              // Address of the receiver (payee)
     amount: string,                // Current amount in escrow (in wei)
     status: TransactionStatus,     // Enum: NoDispute, WaitingSender, WaitingReceiver, DisputeCreated, Resolved
     timeoutPayment: number,        // Timeout period in seconds
     lastInteraction: number,       // Timestamp of the last interaction (Unix timestamp)
     createdAt: number,             // Timestamp when the transaction was created
     disputeId?: number,            // ID of the dispute if one exists
     senderFee: string,             // Arbitration fee paid by sender (in wei)
     receiverFee: string            // Arbitration fee paid by receiver (in wei)
   }
   ```

3. **Payment Events**
   ```typescript
   // From klerosClient.services.event.getPaymentEvents(transactionId)
   {
     transactionId: string,       // ID of the transaction
     blockNumber: number,         // Block number when the event was emitted
     transactionHash: string,     // Hash of the transaction that emitted the event
     timestamp: number,           // Timestamp when the event was emitted
     _transactionID: string,      // ID of the transaction (redundant)
     _amount: string,             // Amount paid in wei
     _party: string               // Address of the party who made/received the payment
   }
   ```

4. **Dispute Events**
   ```typescript
   // From klerosClient.services.event.getDisputeEvents(transactionId)
   {
     transactionId: string,       // ID of the transaction
     blockNumber: number,         // Block number when the event was emitted
     transactionHash: string,     // Hash of the transaction that emitted the event
     timestamp: number,           // Timestamp when the event was emitted
     _arbitrator: string,         // Address of the arbitrator contract
     _disputeID: string,          // ID of the created dispute
     _metaEvidenceID: string,     // Same as transactionId
     _evidenceGroupID: string     // ID of the evidence group (same as transactionId)
   }
   ```

5. **Evidence Events**
   ```typescript
   // From klerosClient.services.event.getEvidenceEvents(transactionId)
   {
     transactionId: string,       // ID of the transaction
     blockNumber: number,         // Block number when the event was emitted
     transactionHash: string,     // Hash of the transaction that emitted the event
     timestamp: number,           // Timestamp when the event was emitted
     _arbitrator: string,         // Address of the arbitrator
     _evidenceGroupID: string,    // ID of the evidence group (same as transactionId)
     _party: string,              // Address of the party who submitted evidence
     _evidence: string            // IPFS URI to the evidence
   }
   ```

6. **Ruling Events**
   ```typescript
   // From klerosClient.services.event.getRulingEvents(transactionId)
   {
     transactionId: string,       // ID of the transaction
     blockNumber: number,         // Block number when the event was emitted
     transactionHash: string,     // Hash of the transaction that emitted the event
     timestamp: number,           // Timestamp when the event was emitted
     _arbitrator: string,         // Address of the arbitrator
     _disputeID: string,          // ID of the dispute
     _ruling: string              // The ruling given (0: Refused, 1: Sender wins, 2: Receiver wins)
   }
   ```

7. **Meta-Evidence Events**
   ```typescript
   // From klerosClient.services.event.getMetaEvidenceEvents(transactionId)
   {
     transactionId: string,       // ID of the transaction
     blockNumber: number,         // Block number when the event was emitted
     transactionHash: string,     // Hash of the transaction that emitted the event
     timestamp: number,           // Timestamp when the event was emitted
     _metaEvidenceID: string,     // ID of the meta-evidence (same as transactionId)
     _evidence: string            // IPFS URI to the meta-evidence JSON
   }
   ```

8. **Meta-Evidence Data**
   ```typescript
   // From klerosClient.services.ipfs.fetchFromIPFS(metaEvidenceURI)
   {
     category: string,            // Always "Escrow" for escrow transactions
     title: string,               // Title of the transaction
     description: string,         // Detailed description of the transaction terms
     question: string,            // Question posed to arbitrators in case of a dispute
     rulingOptions: {             // Options for arbitrators to rule on
       type: string,              // Usually "single-select"
       titles: string[],          // Short labels for each ruling option
       descriptions: string[]     // Detailed explanations of each ruling option
     },
     // Optional fields
     subCategory?: string,        // More specific categorization
     sender?: string,             // Ethereum address of the sender
     receiver?: string,           // Ethereum address of the receiver
     amount?: string,             // Transaction amount as a string
     timeout?: number,            // Timeout period in seconds
     fileURI?: string,            // IPFS URI pointing to an attached file
     fileTypeExtension?: string,  // File type if applicable
     // ... other optional fields
   }
   ```

9. **Dispute Object**
   ```typescript
   // From klerosClient.services.dispute.getDispute(transactionId)
   {
     id: number,                  // The dispute ID
     transactionId: string,       // The ID of the transaction this dispute is for
     status: DisputeStatus,       // Enum: Waiting, Appealable, Solved
     ruling?: Ruling,             // Enum: RefusedToRule, SenderWins, ReceiverWins
     arbitrator: string,          // Address of the arbitrator contract
     arbitratorExtraData: string, // Extra data for the arbitrator
     evidenceGroupId: string,     // ID of the evidence group
     appealPeriodStart?: number,  // Timestamp when the appeal period starts
     appealPeriodEnd?: number     // Timestamp when the appeal period ends
   }
   ```

10. **Evidence Data**
    ```typescript
    // From klerosClient.services.ipfs.fetchFromIPFS(evidenceURI)
    {
      name: string,               // Title of the evidence
      description: string,        // Detailed description of the evidence
      fileURI?: string,           // Optional IPFS URI pointing to an uploaded file
      fileTypeExtension?: string  // Optional file type indicator
    }
    ```

### UI Components

1. **Header**
   - App title "Kleros Escrow Explorer" with a lovable logo
   - Brief description of what the app does
   - Search bar for transaction ID input

2. **Transaction Card**
   - Display transaction details in a card format
   - Use icons to represent different properties
   - Show status with appropriate color coding:
     - NoDispute: Green
     - WaitingSender/WaitingReceiver: Yellow
     - DisputeCreated: Orange
     - Resolved: Blue

3. **Meta-Evidence Card**
   - Display meta-evidence details in a card format
   - Show transaction terms in a readable way
   - Include any attached files with download links

4. **Timeline Component**
   - Vertical timeline showing all events
   - Each event is a card with icon, title, and details
   - Events are sorted chronologically
   - Filter buttons at the top to show/hide event types

5. **Loading States**
   - Friendly loading animations
   - Skeleton screens while data is being fetched
   - Smooth transitions between states

6. **Error Handling**
   - Friendly error messages
   - Suggestions for fixing common issues
   - Option to try again

### Example User Flow

1. User visits the application
2. User enters a transaction ID in the search bar
3. User clicks "Explore" button
4. App shows a loading animation
5. App displays transaction details, meta-evidence, and events timeline
6. User can filter events by type using toggle buttons
7. User can click on evidence links to view the evidence
8. User can enter a new transaction ID to explore another transaction

### Bonus Features (if time allows)

1. **Address Resolution**
   - Resolve Ethereum addresses to ENS names
   - Show identicons for addresses

2. **Evidence Preview**
   - Fetch and display evidence content when clicked
   - Preview images and documents in a modal

3. **Transaction Status Updates**
   - Implement polling to check for new events
   - Show notifications when new events are detected

4. **Dark Mode**
   - Add a toggle for dark/light mode
   - Ensure all components look good in both modes

This simple, lovable web application will provide an easy way for users to explore Kleros escrow transactions and understand their status, events, and details in a user-friendly interface. 