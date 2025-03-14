/**
 * Service for interacting with IPFS
 */
export declare class IPFSService {
    private ipfsGateway;
    /**
     * Creates a new IPFSService instance
     * @param ipfsGateway The IPFS gateway URL
     */
    constructor(ipfsGateway?: string);
    /**
     * Uploads binary data to IPFS
     * @param data The binary data to upload
     * @param fileName The name of the file
     * @returns The IPFS CID (Content Identifier)
     */
    uploadToIPFS: (data: Uint8Array, fileName: string) => Promise<string>;
    /**
     * Uploads JSON data to IPFS
     * @param data The JSON data to upload
     * @returns The IPFS CID (Content Identifier)
     */
    uploadJSONToIPFS: (data: any) => Promise<string>;
    /**
     * Fetches JSON data from IPFS
     * @param ipfsPath The IPFS path or CID
     * @returns The parsed JSON data
     */
    fetchFromIPFS: (ipfsPath: string) => Promise<any>;
    /**
     * Uploads evidence to IPFS
     * @param evidence The evidence data
     * @returns The IPFS URI of the uploaded evidence
     */
    uploadEvidence: (evidence: {
        name: string;
        description: string;
        fileURI?: string;
        fileTypeExtension?: string;
    }) => Promise<string>;
    /**
     * Uploads meta-evidence to IPFS
     * @param metaEvidence The meta-evidence data
     * @returns The IPFS URI of the uploaded meta-evidence
     */
    uploadMetaEvidence: (metaEvidence: {
        title: string;
        description: string;
        category: string;
        question: string;
        rulingOptions: {
            titles: string[];
            descriptions: string[];
        };
        fileURI?: string;
        fileTypeExtension?: string;
    }) => Promise<string>;
}
