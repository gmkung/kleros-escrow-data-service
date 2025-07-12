import { GraphQLClient, gql } from "graphql-request";
import type { TokenSubgraphResponse, RulingResponse } from "../types/graphql";

export class TokenEventService {
  private client: GraphQLClient;

  constructor() {
    this.client = new GraphQLClient(
      "https://api.studio.thegraph.com/query/74379/kleros-escrow-v1-erc20-subgraph/version/latest"
    );
  }

  getAllTokenMetaEvidence = async () => {
    const query = gql`
      query GetAllTokenMetaEvidence {
        metaEvidences(orderBy: _metaEvidenceID, orderDirection: desc) {
          id
          blockTimestamp
          transactionHash
          _evidence
          blockNumber
          _metaEvidenceID
        }
      }
    `;

    const response = await this.client.request<{
      metaEvidences: TokenSubgraphResponse["metaEvidences"];
    }>(query);
    return response.metaEvidences;
  };

  getTokenTransactionDetails = async (transactionId: string) => {
    // First query to get all transaction-related data including token info
    const query = gql`
      query GetTokenTransactionDetails($transactionId: BigInt!) {
        metaEvidences(where: { _metaEvidenceID: $transactionId }) {
          id
          blockTimestamp
          transactionHash
          _evidence
          blockNumber
        }
        payments(where: { _transactionID: $transactionId }) {
          id
          _transactionID
          _amount
          _party
          blockNumber
          blockTimestamp
          transactionHash
        }
        evidences(where: { _evidenceGroupID: $transactionId }) {
          _arbitrator
          _party
          _evidence
          _evidenceGroupID
          blockNumber
          transactionHash
        }
        disputes(where: { _metaEvidenceID: $transactionId }) {
          _arbitrator
          _disputeID
          blockNumber
          blockTimestamp
          _metaEvidenceID
          _evidenceGroupID
          transactionHash
        }
        hasToPayFees(where: { _transactionID: $transactionId }) {
          _transactionID
          blockNumber
          blockTimestamp
          _party
          transactionHash
        }
        transactionCreateds(where: { _transactionID: $transactionId }) {
          id
          _transactionID
          _sender
          _receiver
          _token
          _amount
          blockNumber
          blockTimestamp
          transactionHash
        }
      }
    `;

    const response = await this.client.request<TokenSubgraphResponse>(query, {
      transactionId: transactionId,
    });

    // If we found disputes, fetch their rulings
    let rulings: RulingResponse["rulings"] = [];
    if (response.disputes.length > 0) {
      const disputeIds = response.disputes.map(
        (d: { _disputeID: string }) => d._disputeID
      );
      const rulingQuery = gql`
        query GetRulings($disputeIds: [String!]) {
          rulings(where: { _disputeID_in: $disputeIds }) {
            _arbitrator
            _disputeID
            blockNumber
            blockTimestamp
            _ruling
            transactionHash
          }
        }
      `;

      const rulingResponse = await this.client.request<RulingResponse>(
        rulingQuery,
        {
          disputeIds,
        }
      );
      rulings = rulingResponse.rulings;
    }

    // Combine all data
    return {
      ...response,
      rulings,
    };
  };

  /**
   * Get all token transactions created events
   * @returns Array of token transaction creation events
   */
  getAllTokenTransactions = async () => {
    const query = gql`
      query GetAllTokenTransactions {
        transactionCreateds(orderBy: blockTimestamp, orderDirection: desc) {
          id
          _transactionID
          _sender
          _receiver
          _token
          _amount
          blockNumber
          blockTimestamp
          transactionHash
        }
      }
    `;

    const response = await this.client.request<{
      transactionCreateds: TokenSubgraphResponse["transactionCreateds"];
    }>(query);
    return response.transactionCreateds;
  };

  /**
   * Get token transactions by address (sender or receiver)
   * @param address The address to filter by
   * @returns Array of token transactions involving the address
   */
  getTokenTransactionsByAddress = async (address: string) => {
    const query = gql`
      query GetTokenTransactionsByAddress($address: Bytes!) {
        transactionCreateds(
          where: { 
            or: [
              { _sender: $address },
              { _receiver: $address }
            ]
          }
          orderBy: blockTimestamp
          orderDirection: desc
        ) {
          id
          _transactionID
          _sender
          _receiver
          _token
          _amount
          blockNumber
          blockTimestamp
          transactionHash
        }
      }
    `;

    const response = await this.client.request<{
      transactionCreateds: TokenSubgraphResponse["transactionCreateds"];
    }>(query, { address });
    return response.transactionCreateds;
  };

  /**
   * Get token transactions by token contract address
   * @param tokenAddress The token contract address to filter by
   * @returns Array of transactions for the specific token
   */
  getTransactionsByToken = async (tokenAddress: string) => {
    const query = gql`
      query GetTransactionsByToken($tokenAddress: Bytes!) {
        transactionCreateds(
          where: { _token: $tokenAddress }
          orderBy: blockTimestamp
          orderDirection: desc
        ) {
          id
          _transactionID
          _sender
          _receiver
          _token
          _amount
          blockNumber
          blockTimestamp
          transactionHash
        }
      }
    `;

    const response = await this.client.request<{
      transactionCreateds: TokenSubgraphResponse["transactionCreateds"];
    }>(query, { tokenAddress });
    return response.transactionCreateds;
  };
} 