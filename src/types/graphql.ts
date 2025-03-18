export interface SubgraphResponse {
  metaEvidences: {
    id: string;
    blockTimestamp: string;
    transactionHash: string;
    _evidence: string;
    blockNumber: string;
    _metaEvidenceID: string;
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
}

export interface RulingResponse {
  rulings: {
    _arbitrator: string;
    _disputeID: string;
    blockNumber: string;
    blockTimestamp: string;
    _ruling: string;
    transactionHash: string;
  }[];
}
