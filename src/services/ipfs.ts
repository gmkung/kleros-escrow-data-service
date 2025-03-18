/**
 * Response from the Kleros IPFS upload API
 */
interface IPFSResponse {
  cids: string[];
  size: number;
}

/**
 * Service for interacting with IPFS
 */
export class IPFSService {
  private ipfsGateway: string;

  /**
   * Creates a new IPFSService instance
   * @param ipfsGateway The IPFS gateway URL
   */
  constructor(ipfsGateway: string = "https://cdn.kleros.link") {
    this.ipfsGateway = ipfsGateway;
  }

  /**
   * Uploads binary data to IPFS
   * @param data The binary data to upload
   * @param fileName The name of the file
   * @returns The IPFS CID (Content Identifier)
   */
  uploadToIPFS = async (data: Uint8Array, fileName: string): Promise<string> => {
    const blob = new Blob([data], { type: "application/octet-stream" });
    const formdata = new FormData();
    formdata.append("data", blob, fileName);

    try {
      const response = await fetch(
        "https://kleros-api.netlify.app/.netlify/functions/upload-to-ipfs?operation=file&pinToGraph=true",
        {
          method: "POST",
          body: formdata,
          redirect: "follow" as RequestRedirect,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to upload to IPFS: ${response.statusText}`);
      }

      const result = (await response.json()) as IPFSResponse;
      const cid = result.cids[0]; // Extract the first CID from the cids array

      return cid;
    } catch (error) {
      console.error("IPFS upload error:", error);
      throw error;
    }
  }

  /**
   * Uploads JSON data to IPFS
   * @param data The JSON data to upload
   * @returns The IPFS CID (Content Identifier)
   */
  uploadJSONToIPFS = async (data: any): Promise<string> => {
    const jsonString = JSON.stringify(data, null, 2);
    const jsonBytes = new TextEncoder().encode(jsonString);

    return this.uploadToIPFS(jsonBytes, "item.json");
  }

  /**
   * Fetches JSON data from IPFS
   * @param ipfsPath The IPFS path or CID
   * @returns The parsed JSON data
   */
  fetchFromIPFS = async (ipfsPath: string): Promise<any> => {
    try {
      // Remove '/ipfs/' prefix if present
      const cleanPath = ipfsPath.replace(/^\/ipfs\//, "");
      const url = `${this.ipfsGateway}/ipfs/${cleanPath}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching from IPFS:", error);
      throw error;
    }
  }

  /**
   * Uploads evidence to IPFS
   * @param evidence The evidence data
   * @returns The IPFS URI of the uploaded evidence
   */
  uploadEvidence = async (evidence: {
    name: string;
    description: string;
    fileURI?: string;
    fileTypeExtension?: string;
  }): Promise<string> => {
    const cid = await this.uploadJSONToIPFS(evidence);
    return `${cid}`;
  }

  /**
   * Uploads meta-evidence to IPFS
   * @param metaEvidence The meta-evidence data
   * @returns The IPFS URI of the uploaded meta-evidence
   */
  uploadMetaEvidence = async (metaEvidence: {
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
  }): Promise<string> => {
    const cid = await this.uploadJSONToIPFS(metaEvidence);
    return `${cid}`;
  }
}
