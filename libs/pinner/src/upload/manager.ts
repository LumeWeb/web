import type { OperationPollingOptions } from "@lumeweb/portal-sdk";
import {
  OPERATION_STATUS,
  type OperationsQueryParams,
  Sdk,
} from "@lumeweb/portal-sdk";
import { createEqFilter } from "@lumeweb/query-builder";

import type { PinnerConfig } from "../config";
import type {
  UploadInput,
  UploadOperation,
  UploadOptions,
  UploadResult,
} from "@/types/upload";
import { isUploadResult } from "@/types/upload";
import { XHRUploadHandler } from "./xhr-upload";
import { TUSUploadHandler } from "./tus-upload";
import { DEFAULT_ENDPOINT, TUS_SIZE_THRESHOLD } from "@/types/constants";
import {
  FILE_EXTENSION_CAR,
  MIME_TYPE_CAR,
  MIME_TYPE_OCTET_STREAM,
} from "@/types/mime-types";
import {
  type CarPreprocessResult,
  configureCar,
  destroyCarPreprocessor,
  isCarFile,
  preprocessToCar,
} from "./car";
import { calculateStreamSize, streamToBlob } from "../utils/stream";
import { EmptyFileError } from "../errors";
import { type UploadInputObject } from "./normalize";

export class UploadManager {
  private xhrHandler: XHRUploadHandler;
  private tusHandler: TUSUploadHandler;
  private portalSdk: Sdk;
  private uploadLimit: number = TUS_SIZE_THRESHOLD; // Default to 100 MB
  private limitFetched: boolean = false;

  constructor(config: PinnerConfig) {
    this.xhrHandler = new XHRUploadHandler(config);
    this.tusHandler = new TUSUploadHandler(config);
    this.portalSdk = new Sdk(config.endpoint || DEFAULT_ENDPOINT);
    configureCar({
      datastoreName: config.datastoreName,
      datastore: config.datastore,
    });
  }

  async fetchUploadLimit(): Promise<number> {
    if (this.limitFetched) {
      return this.uploadLimit;
    }

    try {
      const result = await this.portalSdk.account().uploadLimit();
      if (result.success && result.data?.limit) {
        this.uploadLimit = result.data.limit;
      }
    } catch {
      // Fallback to default 100 MB if API fails
      this.uploadLimit = TUS_SIZE_THRESHOLD;
    }

    this.limitFetched = true;
    return this.uploadLimit;
  }

  getUploadLimit(): number {
    return this.uploadLimit;
  }

  async upload(
    input: UploadInput,
    options?: UploadOptions,
  ): Promise<UploadOperation> {
    this.#validateInput(input, options);
    return this.#uploadInput(input, options);
  }

  async uploadCar(
    input: File | ReadableStream<Uint8Array>,
    options?: UploadOptions,
  ): Promise<UploadOperation> {
    this.#validateInput(input, options);
    return this.#uploadCarFile(input, options);
  }

  /**
   * Wait for an operation to complete or reach a settled state.
   *
   * Handles two scenarios:
   * 1. If an operationId is provided (in UploadResult), uses it directly
   * 2. If only CID is available, lists operations filtered by CID and polls the first result
   *
   * @param input Either an operation ID (number) or an UploadResult
   * @param options Polling options (interval, timeout, settledStates)
   * @returns UploadResult with operation status merged in
   */
  async waitForOperation(
    input: number | UploadResult,
    options?: OperationPollingOptions,
  ): Promise<UploadResult> {
    // Scenario 1: UploadResult with operationId - use it directly
    if (isUploadResult(input) && input.operationId) {
      const result = await this.portalSdk
        .account()
        .waitForOperation(input.operationId, options);

      if (!result.success) {
        throw new Error(
          result.error?.message || `Operation ${input.operationId} failed`,
        );
      }

      const operation = result.data;
      if (!operation.cid) {
        throw new Error(`Operation ${input.operationId} completed without CID`);
      }

      if (
        operation.status?.toLowerCase() === OPERATION_STATUS.FAILED ||
        operation.status?.toLowerCase() === OPERATION_STATUS.ERROR
      ) {
        throw new Error(
          `Operation ${input.operationId} failed: ${operation.error || operation.status_message || "Unknown error"}`,
        );
      }

      // Merge operation data into the original upload result
      return {
        ...input,
        cid: operation.cid,
        operationId: operation.id,
      };
    }

    // Scenario 2: UploadResult with CID but no operationId - find by CID
    if (isUploadResult(input) && input.cid) {
      return await this.#waitForOperationByCid(input, options);
    }

    // Scenario 3: Only operation ID provided
    const operationId = typeof input === "number" ? input : undefined;
    if (operationId) {
      const result = await this.portalSdk
        .account()
        .waitForOperation(operationId, options);

      if (!result.success) {
        throw new Error(
          result.error?.message || `Operation ${operationId} failed`,
        );
      }

      const operation = result.data;
      if (!operation.cid) {
        throw new Error(`Operation ${operationId} completed without CID`);
      }

      if (
        operation.status?.toLowerCase() === OPERATION_STATUS.FAILED ||
        operation.status?.toLowerCase() === OPERATION_STATUS.ERROR
      ) {
        throw new Error(
          `Operation ${operationId} failed: ${operation.error || operation.status_message || "Unknown error"}`,
        );
      }

      return {
        id: operationId.toString(),
        cid: operation.cid,
        name: operation.operation_display_name || "Unknown",
        size: 0,
        mimeType: "",
        createdAt: new Date(operation.started_at),
        numberOfFiles: 1,
        operationId: operation.id,
      };
    }

    throw new Error(
      "No operation ID or CID provided, cannot wait for operation",
    );
  }

  /**
   * Wait for an operation by CID.
   *
   * This is used when we have a CID from an upload but no operation ID.
   * We list operations filtered by CID to find the operation ID,
   * then use the SDK's waitForOperation for polling.
   *
   * @param uploadResult UploadResult with CID
   * @param options Polling options (interval, timeout, settledStates)
   * @returns UploadResult with operation status merged in
   */
  async #waitForOperationByCid(
    uploadResult: UploadResult,
    options?: OperationPollingOptions,
  ): Promise<UploadResult> {
    // List operations filtered by CID
    const params: OperationsQueryParams = {
      filters: [createEqFilter("cid", uploadResult.cid)],
      pagination: { start: 0, end: 1 },
    };

    const result = await this.portalSdk.account().listOperations(params);

    if (!result.success || !result.data || !result.data.data) {
      throw new Error(`Failed to find operation with CID ${uploadResult.cid}`);
    }

    const operation = result.data.data;
    const operationId = operation.id;

    // Use SDK's waitForOperation for polling
    const waitResult = await this.portalSdk
      .account()
      .waitForOperation(operationId, options);

    if (!waitResult.success) {
      throw new Error(
        waitResult.error?.message || `Operation ${operationId} failed`,
      );
    }

    const finalOperation = waitResult.data;
    if (!finalOperation.cid) {
      throw new Error(`Operation ${operationId} completed without CID`);
    }

    if (
      finalOperation.status?.toLowerCase() === OPERATION_STATUS.FAILED ||
      finalOperation.status?.toLowerCase() === OPERATION_STATUS.ERROR
    ) {
      throw new Error(
        `Operation ${operationId} failed: ${finalOperation.error || finalOperation.status_message || "Unknown error"}`,
      );
    }

    // Return merged result
    return {
      ...uploadResult,
      cid: finalOperation.cid,
      operationId: finalOperation.id,
    };
  }

  #validateInput(input: UploadInput, options?: UploadOptions): void {
    if (input instanceof File) {
      if (input.size === 0) {
        throw new EmptyFileError(`Cannot upload empty file: ${input.name}`);
      }
    } else if (input instanceof ReadableStream) {
      // For ReadableStream, we can only validate if size is provided
      // Otherwise we need to calculate the size which consumes the stream
      if (options?.size !== undefined && options.size === 0) {
        throw new EmptyFileError("Cannot upload empty stream");
      }
    }
  }

  async uploadDirectory(
    files: File[],
    options?: UploadOptions,
  ): Promise<UploadOperation> {
    const carResult = await preprocessToCar(files, {
      onProgress: options?.onProgress
        ? (p) =>
            options.onProgress!({
              percentage: p,
              bytesUploaded: 0,
              bytesTotal: 0,
            })
        : undefined,
      signal: options?.signal,
    });

    const operation = await this.#uploadCarResult(
      carResult,
      options?.name || "directory",
      options,
    );

    if (options?.waitForOperation && operation.result) {
      const uploadResult = await operation.result;
      operation.result = this.waitForOperation(
        { ...uploadResult, isDirectory: true, numberOfFiles: files.length },
        options.operationPollingOptions,
      );
    }

    return operation;
  }

  async #uploadInput(
    input: UploadInput,
    options?: UploadOptions,
  ): Promise<UploadOperation> {
    // Check if this is a CAR file that should be uploaded without preprocessing
    const isCarUpload = await this.#isCarFileUpload(input, options);
    if (isCarUpload) {
      return this.#uploadCarFile(input, options);
    }

    const limit = await this.fetchUploadLimit();

    if (input instanceof ReadableStream) {
      const [streamForSize, streamForUpload] = input.tee();
      let size: bigint;
      if (options?.size !== undefined) {
        size = BigInt(options.size);
      } else {
        size = await calculateStreamSize(streamForSize, options?.signal);
      }

      if (size >= BigInt(limit)) {
        return this.#uploadFile(
          {
            data: streamForUpload,
            name: options?.name || "upload",
            type:
              options?.name?.endsWith(FILE_EXTENSION_CAR) ||
              options?.isDirectory
                ? MIME_TYPE_CAR
                : MIME_TYPE_OCTET_STREAM,
            size: Number(size),
          },
          options,
        );
      } else {
        const blob = await streamToBlob(
          streamForUpload,
          "application/octet-stream",
        );
        const file = new File([blob], options?.name || "upload", {
          type: blob.type,
        });
        return this.#uploadFile(file, options);
      }
    }

    return this.#uploadFile(input, options);
  }

  async #isCarFileUpload(
    input: UploadInput,
    options?: UploadOptions,
  ): Promise<boolean> {
    // Explicit option takes precedence
    if (options?.isCarFile === true) {
      return true;
    }
    if (options?.isCarFile === false) {
      return false;
    }

    // Check if File input is a valid CAR file
    if (input instanceof File) {
      // Quick check: MIME type or extension
      if (
        input.type === MIME_TYPE_CAR ||
        input.name.endsWith(FILE_EXTENSION_CAR)
      ) {
        // Verify it's actually a valid CAR file
        return await isCarFile(input);
      }
    }

    // For ReadableStream, rely on explicit isCarFile option or name extension
    if (
      input instanceof ReadableStream &&
      options?.name?.endsWith(FILE_EXTENSION_CAR)
    ) {
      // We can't verify stream content without consuming it,
      // so we trust the explicit isCarFile option or extension
      return options?.isCarFile !== false;
    }

    return false;
  }

  async #uploadCarResult(
    carResult: CarPreprocessResult,
    name: string,
    options?: UploadOptions,
  ): Promise<UploadOperation> {
    const limit = await this.fetchUploadLimit();

    if (carResult.size >= BigInt(limit)) {
      return this.#uploadFile(
        {
          data: carResult.carStream,
          name: `${name}${FILE_EXTENSION_CAR}`,
          type: MIME_TYPE_CAR,
          size: Number(carResult.size),
        },
        options,
      );
    } else {
      const blob = await streamToBlob(carResult.carStream, MIME_TYPE_CAR);
      const file = new File([blob], `${name}${FILE_EXTENSION_CAR}`, {
        type: MIME_TYPE_CAR,
      });
      return this.#uploadFile(file, options);
    }
  }

  async #uploadCarFile(
    input: File | ReadableStream<Uint8Array>,
    options?: UploadOptions,
  ): Promise<UploadOperation> {
    const limit = await this.fetchUploadLimit();

    if (input instanceof ReadableStream) {
      const [streamForSize, streamForUpload] = input.tee();
      let size: bigint;
      if (options?.size !== undefined) {
        size = BigInt(options.size);
      } else {
        size = await calculateStreamSize(streamForSize, options?.signal);
      }

      if (size >= BigInt(limit)) {
        return this.#uploadFile(
          {
            data: streamForUpload,
            name: options?.name || "upload.car",
            type: MIME_TYPE_CAR,
            size: Number(size),
          },
          options,
        );
      } else {
        const blob = await streamToBlob(streamForUpload, MIME_TYPE_CAR);
        const file = new File([blob], options?.name || "upload.car", {
          type: MIME_TYPE_CAR,
        });
        return this.#uploadFile(file, options);
      }
    }

    // File input - ensure it has correct CAR MIME type
    if (input.type !== MIME_TYPE_CAR) {
      // Create a new File with correct CAR MIME type
      input = new File([input], input.name, {
        type: MIME_TYPE_CAR,
        lastModified: input.lastModified,
      });
    }

    return this.#uploadFile(input, options);
  }

  async #uploadFile(
    input: UploadInput | UploadInputObject,
    options?: UploadOptions,
  ): Promise<UploadOperation> {
    const limit = await this.fetchUploadLimit();

    let isLargeFile = false;

    if (input instanceof File) {
      isLargeFile = input.size > limit;
    } else {
      isLargeFile = true;
    }

    const operation = await (isLargeFile
      ? this.tusHandler.upload(input, options)
      : this.xhrHandler.upload(input, options));

    if (options?.waitForOperation && operation.result) {
      const uploadResult = await operation.result;
      operation.result = this.waitForOperation(
        uploadResult,
        options.operationPollingOptions,
      );
    }

    return operation;
  }

  destroy(): void {
    this.xhrHandler.destroy();
    this.tusHandler.destroy();
    destroyCarPreprocessor();
  }
}
