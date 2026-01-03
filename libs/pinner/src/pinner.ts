import type { PinnerConfig } from "./config";
import { UploadManager } from "./upload";
import { PinClient } from "./pin";
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
  private _upload?: UploadMethodAndBuilder;

  constructor(config: PinnerConfig) {
    this.uploadManager = new UploadManager(config);
    this._pins = new PinClient(config);
  }

  /**
   * Access the remote pins interface.
   */
  get pins(): RemotePins {
    return this._pins;
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
   */
  async uploadCar(
    file: File | ReadableStream<Uint8Array>,
    options?: UploadOptions,
  ): Promise<UploadOperation> {
    return this.uploadManager.uploadCar(file, options);
  }

  /**
   * Pin existing content by CID.
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
   */
  async getPinStatus(cid: string | CID): Promise<RemotePin> {
    const cidObj = typeof cid === "string" ? CID.parse(cid) : cid;
    return this.pins.get(cidObj);
  }

  /**
   * Check if content is pinned.
   */
  async isPinned(cid: string | CID): Promise<boolean> {
    const cidObj = typeof cid === "string" ? CID.parse(cid) : cid;
    return this.pins.isPinned(cidObj);
  }

  /**
   * Update pin metadata.
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
   */
  async unpin(cid: string | CID, options?: AbortOptions): Promise<void> {
    const cidObj = typeof cid === "string" ? CID.parse(cid) : cid;
    const generator = this.pins.rm(cidObj, options);
    for await (const _ of generator) {
      // Consume the generator to complete the unpin operation
    }
  }

  /**
   * Destroy the client and cleanup resources.
   */
  destroy(): void {
    this.uploadManager.destroy();
  }
}
