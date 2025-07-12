import { GraphQLClient, gql } from "graphql-request";
import type { SubgraphResponse, RulingResponse } from "../types/graphql";

export class EthEventService {
  private client: GraphQLClient;

  constructor() {
    this.client = new GraphQLClient(
      "https://api.studio.thegraph.com/query/74379/kleros-escrow-v1/version/latest"
    );
  }

  getAllEthMetaEvidence = async () => {
    const query = gql`
      query GetAllEthMetaEvidence {
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
      metaEvidences: SubgraphResponse["metaEvidences"];
    }>(query);
    return response.metaEvidences;
  };

  getEthTransactionDetails = async (transactionId: string) => {
    // First query to get all transaction-related data
    const query = gql`
      query GetEthTransactionDetails($transactionId: BigInt!) {
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
      }
    `;

    const response = await this.client.request<SubgraphResponse>(query, {
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
} 