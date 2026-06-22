import type { PinnerConfig } from "./config";
import { DEFAULT_CONFIG, deriveAccountEndpoint } from "./config";
import { UploadManager } from "./upload";
import { PinClient } from "./pin";
import { IpnsClient } from "./api/ipns";
import { WebsitesClient } from "./api/websites";
import { JwtAuthManager, KeyExchangeAuthManager, type AuthManager } from "@/auth";
import { Sdk } from "@lumeweb/portal-sdk";
import type { UploadMethodAndBuilder } from "@/upload/builder";
import { createUploadBuilderNamespace } from "@/upload/builder";
import type {
  UploadOperation,
  UploadOptions,
  UploadResult,
} from "@/types/upload";
import type { OperationPollingOptions } from "@lumeweb/portal-sdk";
import type {
  AbortOptions,
  RemoteAddOptions,
  RemoteLsOptions,
  RemotePin,
  RemotePins,
} from "@/types/pin";
import { CID } from "multiformats/cid";

export class Pinner {
  private uploadManager: UploadManager;
  private _pins: RemotePins;
  private _ipns: IpnsClient;
  private _websites: WebsitesClient;
  private _upload?: UploadMethodAndBuilder;
  private readonly auth: AuthManager;

  /**
   * Create a new Pinner SDK instance.
   * @param config SDK configuration object
   */
  constructor(config: PinnerConfig) {
    const endpoint = config.endpoint ?? DEFAULT_CONFIG.endpoint!;
    const sdk = new Sdk(deriveAccountEndpoint(endpoint));
    this.auth = new KeyExchangeAuthManager(config.jwt, sdk);
    this.uploadManager = new UploadManager(config, this.auth, sdk);
    this._pins = new PinClient(config, this.auth);
    this._ipns = new IpnsClient(config, this.auth);
    this._websites = new WebsitesClient(config, this.auth);
  }

  /**
   * Access the remote pins interface.
   */
  get pins(): RemotePins {
    return this._pins;
  }

  /**
   * Access the IPNS interface for key management and publishing.
   */
  get ipns(): IpnsClient {
    return this._ipns;
  }

  /**
   * Access the websites interface for website configuration and management.
   */
  get websites(): WebsitesClient {
    return this._websites;
  }

  /**
   * Upload interface that works as both a method and a builder namespace.
   *
   * As a method: upload(file, options) -> UploadOperation
   * As a property: upload.file(), upload.json(), etc. -> Builder
   */
  get upload(): UploadMethodAndBuilder {
    if (!this._upload) {
      const builderNamespace = createUploadBuilderNamespace(this);
      const uploadMethod = async (
        file: File,
        options?: UploadOptions,
      ): Promise<UploadOperation> => {
        return this.uploadManager.upload(file, options);
      };

      this._upload = new Proxy(uploadMethod, {
        get(target, prop) {
          if (prop in builderNamespace) {
            return Reflect.get(builderNamespace, prop);
          }
          return Reflect.get(target, prop);
        },
      }) as UploadMethodAndBuilder;
    }
    return this._upload;
  }

  /**
   * Upload a file and wait for completion.
   * Convenience method for simple use cases where controls aren't needed.
   * @param file The file to upload
   * @param options Upload configuration
   */
  async uploadAndWait(
    file: File,
    options?: UploadOptions,
  ): Promise<UploadResult> {
    const operation = await this.upload(file, options);
    return operation.result;
  }

  /**
   * Wait for an operation to complete or reach a settled state.
   * @param input Either an operation ID (number) or an UploadResult
   * @param options Polling options (interval, timeout, settledStates)
   * @returns UploadResult with operation status merged in
   */
  async waitForOperation(
    input: number | UploadResult,
    options?: OperationPollingOptions,
  ): Promise<UploadResult> {
    return this.uploadManager.waitForOperation(input, options);
  }

  /**
   * Upload a directory to IPFS.
   * @param files Array of files to upload as a directory
   * @param options Upload configuration
   */
  async uploadDirectory(
    files: File[],
    options?: UploadOptions,
  ): Promise<UploadOperation> {
    return this.uploadManager.uploadDirectory(files, options);
  }

  /**
   * Upload a CAR file without preprocessing.
   * This is useful for passthrough of pre-generated CAR files.
   * @param file CAR file or stream to upload
   * @param options Upload configuration
   */
  async uploadCar(
    file: File | ReadableStream<Uint8Array>,
    options?: UploadOptions,
  ): Promise<UploadOperation> {
    return this.uploadManager.uploadCar(file, options);
  }

  /**
   * Pin existing content by CID.
   * @param cid CID of content to pin (string or CID object)
   * @param options Remote add options
   */
  async pinByHash(
    cid: string | CID,
    options?: RemoteAddOptions,
  ): Promise<AsyncGenerator<CID, void, undefined>> {
    const cidObj = typeof cid === "string" ? CID.parse(cid) : cid;
    return this.pins.add(cidObj, options);
  }

  /**
   * List pinned content.
   * @param options List filtering options
   */
  async listPins(options?: RemoteLsOptions): Promise<RemotePin[]> {
    const pins: RemotePin[] = [];
    for await (const pin of this.pins.ls(options)) {
      pins.push(pin);
    }
    return pins;
  }

  /**
   * Get pin status.
   * @param cid CID of the pinned content to check
   */
  async getPinStatus(cid: string | CID): Promise<RemotePin> {
    const cidObj = typeof cid === "string" ? CID.parse(cid) : cid;
    return this.pins.get(cidObj);
  }

  /**
   * Check if content is pinned.
   * @param cid CID to check
   */
  async isPinned(cid: string | CID): Promise<boolean> {
    const cidObj = typeof cid === "string" ? CID.parse(cid) : cid;
    return this.pins.isPinned(cidObj);
  }

  /**
   * Update pin metadata.
   * @param cid CID of the pin
   * @param metadata Key-value metadata to set
   */
  async setPinMetadata(
    cid: string | CID,
    metadata: Record<string, string> | undefined,
  ): Promise<void> {
    const cidObj = typeof cid === "string" ? CID.parse(cid) : cid;
    return this.pins.setMetadata(cidObj, metadata);
  }

  /**
   * Remove a pin. The block may be deleted when garbage collection is run.
   * @param cid CID to unpin
   * @param options Abort options
   */
  async unpin(cid: string | CID, options?: AbortOptions): Promise<void> {
    const cidObj = typeof cid === "string" ? CID.parse(cid) : cid;
    const generator = this.pins.rm(cidObj, options);
    for await (const _ of generator) {
      // Consume the generator to complete the unpin operation
    }
  }

  /**
   * Remove a pin by request ID. The block may be deleted when garbage collection is run.
   * @param requestId The request ID to remove
   * @param options Abort options
   */
  async unpinByRequestId(requestId: string, options?: AbortOptions): Promise<void> {
    return this.pins.rmByRequestId(requestId, options);
  }

  /**
   * Destroy the client and cleanup resources.
   */
  destroy(): void {
    this.uploadManager.destroy();
  }
}
