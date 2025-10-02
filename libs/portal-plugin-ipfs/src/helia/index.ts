import { createHeliaHTTP, type Helia } from "@helia/http";
import { trustlessGateway } from "@helia/block-brokers";
import { httpGatewayRouting } from "@helia/routers";
import { IDBBlockstore } from "blockstore-idb";
import { IDBDatastore } from "datastore-idb";
import type { UnixFS } from "@helia/unixfs";
import { unixfs } from "@helia/unixfs";
import { CID } from "multiformats/cid";
import { streamToBlob } from "../utils/stream";
import {
  Configuration,
  type Pin,
  type PinResults,
  RemotePinningServiceClient,
} from "@ipfs-shipyard/pinning-service-client";
import type { HeliaServiceConfig } from "@/types";

export class HeliaService {
  private helia: Helia | null = null;
  private unixfs: UnixFS | null = null;
  private pinningClient: RemotePinningServiceClient | null = null;
  private config: HeliaServiceConfig;

  constructor(config: HeliaServiceConfig) {
    this.config = config;
  }

  async updateConfig(config: Partial<HeliaServiceConfig>): Promise<void> {
    // Destroy existing instance before updating config
    try {
      await this.destroy();
    } catch (error) {
      console.error("Error during config update cleanup:", error);
      throw error;
    }

    this.config = { ...this.config, ...config };
  }

  getConfig(): HeliaServiceConfig {
    return this.config;
  }

  async getHelia(): Promise<Helia> {
    if (this.helia) {
      return this.helia;
    }

    // Validate API URL first to prevent resource leaks
    if (!this.config.apiUrl) {
      throw new Error("API URL is required");
    }

    let blockstore: IDBBlockstore | null = null;
    let datastore: IDBDatastore | null = null;

    try {
      blockstore = new IDBBlockstore("helia-blocks");
      datastore = new IDBDatastore("helia-data");

      await blockstore.open();
      await datastore.open();
    } catch (error) {
      // Cleanup any partially opened stores
      try {
        if (blockstore) {
          await blockstore.close();
        }
      } catch (closeError) {
        console.error("Error closing blockstore:", closeError);
      }

      try {
        if (datastore) {
          await datastore.close();
        }
      } catch (closeError) {
        console.error("Error closing datastore:", closeError);
      }

      throw new Error(`Failed to initialize stores: ${error}`);
    }

    // Create trustless gateway block broker with auth headers
    const gatewayBlockBroker = trustlessGateway({
      transformRequestInit: (init?: RequestInit) => {
        const headers = new Headers(init?.headers);

        if (this.config.authToken) {
          headers.set("Authorization", `Bearer ${this.config.authToken}`);
        }

        return {
          ...init,
          headers,
        };
      },
    });

    // Create HTTP gateway router using the IPFS API URL
    const gatewayRouter = httpGatewayRouting({
      gateways: [this.config.apiUrl],
    });

    this.helia = await createHeliaHTTP({
      blockstore,
      datastore,
      blockBrokers: [gatewayBlockBroker],
      routers: [gatewayRouter],
    });
    this.unixfs = unixfs(this.helia);

    return this.helia;
  }

  async downloadFile(
    cid: string,
  ): Promise<{ blob: Blob; name: string; mimeType: string }> {
    const helia = await this.getHelia();
    if (!this.unixfs) {
      throw new Error("UnixFS not initialized");
    }

    const unixfs = this.unixfs;
    const parsedCid = CID.parse(cid);
    const abortController = new AbortController();

    // Create a readable stream from the IPFS content
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of unixfs.cat(parsedCid, {
            signal: abortController.signal,
          })) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    // Convert stream to blob using utility function
    const blob = await streamToBlob(stream);

    // Try to get file name and mime type from unixfs metadata
    try {
      const stat = await unixfs.stat(parsedCid, {
        signal: abortController.signal,
      });
      const name =
        stat.type === "directory" ? "directory" : stat.cid.toString();
      const mimeType =
        stat.type === "directory"
          ? "application/x-directory"
          : "application/octet-stream";

      return {
        blob,
        name,
        mimeType,
      };
    } catch (error) {
      // Fallback if we can't get metadata
      return {
        blob,
        name: cid,
        mimeType: "application/octet-stream",
      };
    }
  }

  private async getRemotePinningClient(): Promise<RemotePinningServiceClient> {
    if (this.pinningClient) {
      return this.pinningClient;
    }

    if (!this.config.apiUrl) {
      throw new Error("API URL is required for remote pinning");
    }

    if (!this.config.authToken) {
      throw new Error("Auth token is required for remote pinning");
    }

    const config = new Configuration({
      endpointUrl: this.config.apiUrl,
      accessToken: this.config.authToken,
      fetchApi: fetch,
    });

    this.pinningClient = new RemotePinningServiceClient(config);
    return this.pinningClient;
  }

  async pinCid(
    cid: string,
    name?: string,
    metadata?: Record<string, string>,
  ): Promise<void> {
    const client = await this.getRemotePinningClient();

    const pin: Pin = {
      cid,
      name,
      meta: metadata,
    };

    await client.pinsPost({ pin });
  }

  async unpinCid(cid: string): Promise<void> {
    const client = await this.getRemotePinningClient();

    // First we need to find all request IDs for this CID
    const pins = await client.pinsGet({ cid: [cid] });

    if (pins.results.length === 0) {
      // CID is not pinned, nothing to do
      return;
    }

    // Get all request IDs
    const requestIds = pins.results.map((pin) => pin.requestid);

    // Attempt to unpin all requests concurrently
    const results = await Promise.allSettled(
      requestIds.map((requestId) =>
        client.pinsRequestidDelete({ requestid: requestId }),
      ),
    );

    // Collect any failures
    const failures = results
      .map((result, index) => ({ result, requestId: requestIds[index] }))
      .filter(({ result }) => result.status === "rejected")
      .map(({ result, requestId }) => ({
        requestId,
        error: (result as PromiseRejectedResult).reason,
      }));

    // If there were any failures, log them but don't throw
    if (failures.length > 0) {
      const errorMessages = failures
        .map(
          ({ requestId, error }) =>
            `Failed to unpin request ID ${requestId}: ${error.message || error}`,
        )
        .join("; ");

      const error = new Error(
        `Partial unpin failure for CID ${cid}: ${errorMessages}`,
      );
      console.error(error.message);
    }
  }

  async isPinned(cid: string): Promise<boolean> {
    const client = await this.getRemotePinningClient();

    try {
      const pins = await client.pinsGet({
        cid: [cid],
        status: ["pinned"],
      });
      return pins.results.length > 0;
    } catch (error) {
      console.error(`Error checking pin status for CID ${cid}:`, error);
      throw error;
    }
  }

  async listPinned(): Promise<string[]> {
    const client = await this.getRemotePinningClient();

    const pins: PinResults = await client.pinsGet({});
    return pins.results.map((result) => result.pin.cid);
  }

  async destroy(): Promise<void> {
    if (this.helia) {
      // Get references to blockstore and datastore before stopping helia
      const blockstore = this.helia.blockstore;
      const datastore = this.helia.datastore;

      // Stop helia first
      try {
        await this.helia.stop();
      } catch (error) {
        console.error("Error stopping Helia:", error);
      }

      // Close blockstore and datastore explicitly
      try {
        if (blockstore && typeof blockstore.close === "function") {
          await blockstore.close();
        }
      } catch (error) {
        console.error("Error closing blockstore:", error);
      }

      try {
        if (datastore && typeof datastore.close === "function") {
          await datastore.close();
        }
      } catch (error) {
        console.error("Error closing datastore:", error);
      }

      // Clear references
      this.helia = null;
      this.unixfs = null;
    }

    // Always clear pinning client reference
    this.pinningClient = null;
  }
}

export default HeliaService;
