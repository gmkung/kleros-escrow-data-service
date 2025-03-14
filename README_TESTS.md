# Kleros Escrow Interface Tests

This document explains how to run the tests for the Kleros Escrow Interface.

## Simple Read Test

The simple read test initializes the client with just an RPC provider (no signer) and tests all read functions using a specified contract address on Ethereum mainnet.

### Prerequisites

Before running the test, make sure you have the following:

1. Node.js installed (v14 or higher recommended)
2. The required dependencies installed:
   ```bash
   npm install
   ```

3. An Ethereum RPC URL (you can use a service like Alchemy, Infura, or a public endpoint)

### Configuration

Open the `src/tests/simple-read-test.ts` file and update the RPC_URL with your own:

```typescript
// Replace with your own RPC URL or use a public one
const RPC_URL = "https://eth-mainnet.g.alchemy.com/v2/your-api-key";
// You can also use public RPC endpoints like:
// const RPC_URL = "https://ethereum.publicnode.com";
```

### Running the Test

You can run the test using one of the following methods:

#### Method 1: Using the run script

```bash
# Make the script executable (Unix/Linux/Mac)
chmod +x run-simple-test.js

# Run the script
./run-simple-test.js
```

#### Method 2: Using ts-node directly

```bash
npx ts-node src/tests/simple-read-test.ts
```

### What the Test Does

The test performs the following operations:

1. Initializes a read-only Kleros Escrow client
2. Gets the total transaction count
3. Retrieves details of the first transaction (ID: 0)
4. Checks if the transaction can be executed
5. Checks the timeout status of the transaction
6. Retrieves dispute information (if exists)
7. Gets arbitration and appeal costs (if a dispute exists)
8. Gets the fee timeout
9. Retrieves arbitrator information
10. Gets events for the transaction
11. Attempts to fetch evidence from IPFS (if available)

### Expected Output

The test will output detailed information about each operation, including any errors encountered. A successful run will end with:

```
--- All read tests completed successfully ---
```

## Troubleshooting

If you encounter any issues:

1. **RPC Connection Issues**: Make sure your RPC URL is correct and accessible
2. **Contract Not Found**: Verify that the contract address exists on the specified network
3. **IPFS Gateway Issues**: If IPFS fetching fails, try changing the IPFS gateway in the config

For more detailed tests, refer to the main test suite in the `src/tests` directory. 