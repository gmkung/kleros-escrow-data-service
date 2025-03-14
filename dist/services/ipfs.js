"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPFSService = void 0;
/**
 * Service for interacting with IPFS
 */
class IPFSService {
    /**
     * Creates a new IPFSService instance
     * @param ipfsGateway The IPFS gateway URL
     */
    constructor(ipfsGateway = "https://cdn.kleros.link") {
        /**
         * Uploads binary data to IPFS
         * @param data The binary data to upload
         * @param fileName The name of the file
         * @returns The IPFS CID (Content Identifier)
         */
        this.uploadToIPFS = async (data, fileName) => {
            const blob = new Blob([data], { type: "application/octet-stream" });
            const formdata = new FormData();
            formdata.append("data", blob, fileName);
            try {
                const response = await fetch("https://kleros-api.netlify.app/.netlify/functions/upload-to-ipfs?operation=file&pinToGraph=true", {
                    method: "POST",
                    body: formdata,
                    redirect: "follow",
                });
                if (!response.ok) {
                    throw new Error(`Failed to upload to IPFS: ${response.statusText}`);
                }
                const result = (await response.json());
                const cid = result.cids[0]; // Extract the first CID from the cids array
                return cid;
            }
            catch (error) {
                console.error("IPFS upload error:", error);
                throw error;
            }
        };
        /**
         * Uploads JSON data to IPFS
         * @param data The JSON data to upload
         * @returns The IPFS CID (Content Identifier)
         */
        this.uploadJSONToIPFS = async (data) => {
            const jsonString = JSON.stringify(data, null, 2);
            const jsonBytes = new TextEncoder().encode(jsonString);
            return this.uploadToIPFS(jsonBytes, "item.json");
        };
        /**
         * Fetches JSON data from IPFS
         * @param ipfsPath The IPFS path or CID
         * @returns The parsed JSON data
         */
        this.fetchFromIPFS = async (ipfsPath) => {
            try {
                // Remove '/ipfs/' prefix if present
                const cleanPath = ipfsPath.replace(/^\/ipfs\//, "");
                const url = `${this.ipfsGateway}/ipfs/${cleanPath}`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
                }
                return await response.json();
            }
            catch (error) {
                console.error("Error fetching from IPFS:", error);
                throw error;
            }
        };
        /**
         * Uploads evidence to IPFS
         * @param evidence The evidence data
         * @returns The IPFS URI of the uploaded evidence
         */
        this.uploadEvidence = async (evidence) => {
            const cid = await this.uploadJSONToIPFS(evidence);
            return `/ipfs/${cid}`;
        };
        /**
         * Uploads meta-evidence to IPFS
         * @param metaEvidence The meta-evidence data
         * @returns The IPFS URI of the uploaded meta-evidence
         */
        this.uploadMetaEvidence = async (metaEvidence) => {
            const cid = await this.uploadJSONToIPFS(metaEvidence);
            return `/ipfs/${cid}`;
        };
        this.ipfsGateway = ipfsGateway;
    }
}
exports.IPFSService = IPFSService;
