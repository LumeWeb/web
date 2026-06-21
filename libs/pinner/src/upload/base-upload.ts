import Uppy from "@uppy/core";
import { default as defer } from "p-defer";
import type { Readable } from "stream";

import type { PinnerConfig } from "../config";
import type { AuthManager } from "@/auth";
import type {
  UploadInput,
  UploadOperation,
  UploadOptions,
  UploadProgress,
  UploadResult,
} from "@/types/upload";
import { UploadResultSymbol } from "@/types/upload";
import type { PostUploadResponse } from "@/api/generated/schemas";
import { normalizeUploadInput, type UploadInputObject } from "./normalize";
import {
  fileToReadableStream,
  readableStreamToNodeStream,
} from "@/utils/stream";
import { isNodeEnvironment } from "@/utils/env";
import { UPLOAD_SOURCE_TUS, UPLOAD_SOURCE_XHR } from "./constants";

// Node.js Readable stream with size property for Uppy compatibility
type NodeStreamWithSize = Readable & { size: number | null };

export abstract class BaseUploadHandler {
  protected config: Required<PinnerConfig>;
  protected readonly auth: AuthManager;

  constructor(config: PinnerConfig, auth: AuthManager) {
    this.config = config as Required<PinnerConfig>;
    this.auth = auth;
  }

  async upload(
    input: UploadInput | UploadInputObject,
    options?: UploadOptions,
  ): Promise<UploadOperation> {
    const normalized = normalizeUploadInput(input, options);
    const uppy = new Uppy();
    const { fileId, resultPromise, progress } = this.#setupUppyHandlers(
      uppy,
      normalized,
      options,
    );

    await this.#addFileToUppy(uppy, normalized, normalized.size);
    this.#startUpload(uppy, options);

    return this.#createUploadOperation(uppy, fileId, resultPromise, progress);
  }

  #setupUppyHandlers(
    uppy: Uppy,
    normalized: { size: number },
    options?: UploadOptions,
  ): {
    fileId: string | null;
    resultPromise: Promise<UploadResult>;
    progress: UploadProgress;
  } {
    let fileId: string | null = null;
    let hasRejected = false;

    const progress: UploadProgress = {
      percentage: 0,
      bytesUploaded: 0,
      bytesTotal: normalized.size,
    };

    const {
      promise: resultPromise,
      resolve: resolveResult,
      reject: rejectResult,
    } = defer<UploadResult>();

    const handleError = (error: Error) => {
      if (hasRejected) return;
      hasRejected = true;
      options?.onError?.(error);
      rejectResult(error);
    };

    this.configurePlugin(uppy);

    uppy.on("progress", (progressBytes) => {
      progress.bytesUploaded = progressBytes;
      progress.percentage = (progressBytes / progress.bytesTotal) * 100;
      options?.onProgress?.(progress);
    });

    uppy.on("upload-success", (_file, result) => {
      if (hasRejected) return;
      const uploadResult = this.parseResult(result);
      options?.onComplete?.(uploadResult);
      resolveResult(uploadResult);
    });

    uppy.on("error", (error) => {
      handleError(new Error(this.#extractErrorMessage(error)));
    });

    uppy.on("file-added", (file) => {
      fileId = file.id;
    });

    return { fileId, resultPromise, progress };
  }

  #extractErrorMessage(error: unknown): string {
    let errorMessage = "Upload fainormalizeDataled";

    if (!error) return errorMessage;

    if (typeof error === "string") {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if ((error as any).message) {
      errorMessage = (error as any).message;
    } else if (
      (error as any).toString &&
      typeof (error as any).toString === "function"
    ) {
      errorMessage = (error as any).toString();
    }

    // Try to extract error from response (XHRUpload/TusPlugin)
    const errorObj = error as any;
    if (errorObj?.xhr?.response) {
      try {
        const response =
          typeof errorObj.xhr.response === "string"
            ? JSON.parse(errorObj.xhr.response)
            : errorObj.xhr.response;
        if (response.error) {
          errorMessage = response.error;
        } else if (response.message) {
          errorMessage = response.message;
        }
      } catch {
        // If parsing fails, use the original error message
      }
    }

    return errorMessage;
  }

  async #normalizeData(
    data: File | ReadableStream<Uint8Array>,
  ): Promise<File | ReadableStream<Uint8Array> | NodeStreamWithSize | Blob> {
    if (isNodeEnvironment()) {
      return this.#normalizeDataForNode(data);
    }
    return this.#normalizeDataForBrowser(data);
  }

  async #normalizeDataForBrowser(
    data: File | ReadableStream<Uint8Array>,
  ): Promise<File | Blob | ReadableStream<Uint8Array>> {
    // TUS plugin requires File, Blob, or Reader in browser
    if (this.getUploadSource() === UPLOAD_SOURCE_TUS) {
      if (data instanceof ReadableStream) {
        const { streamToBlobViaResponse } = await import("@/utils/stream");
        return streamToBlobViaResponse(data);
      }
      return data;
    }

    // XHRUpload handles File/Blob directly
    return data;
  }

  async #normalizeDataForNode(
    data: File | ReadableStream<Uint8Array>,
  ): Promise<NodeStreamWithSize | File | Blob | ReadableStream<Uint8Array>> {
    // XHRUpload with formData: true requires Blob/File for FormData.append()
    // Do not convert to Node.js stream for XHRUpload
    if (this.getUploadSource() === UPLOAD_SOURCE_XHR) {
      return data;
    }

    // Convert File to ReadableStream without loading entire blob into memory
    if (data instanceof File) {
      const stream = fileToReadableStream(data);
      // Convert to Node.js stream for tus-js-client
      const nodeStream = await readableStreamToNodeStream(stream);
      return nodeStream as NodeStreamWithSize;
    }

    // In Node.js, convert ReadableStream to Node.js stream.Readable for tus-js-client's NodeFileReader
    if (data instanceof ReadableStream) {
      const nodeStream = await readableStreamToNodeStream(data);
      // Add size property to satisfy Uppy's type requirements
      return nodeStream as NodeStreamWithSize;
    }

    return data;
  }

  async #addFileToUppy(
    uppy: Uppy,
    normalized: {
      /**
       * List of file manager items
       */
      data: File | ReadableStream<Uint8Array>;
      /**
       * Name for the pin or filter
       */
      name: string;
      /**
       * MIME type or content type
       */
      type: string;
    },
    size?: number,
  ): Promise<void> {
    const fileData = await this.#normalizeData(normalized.data);
    const fileOptions = {
      source: this.getUploadSource(),
      name: normalized.name,
      type: normalized.type,
      data: fileData as any,
    };

    // Add file to Uppy first
    // Note: Uppy accepts any data type as it defers to the drivers
    const fileId = uppy.addFile(fileOptions);

    // Set TUS upload size if provided
    // In Node.js, streams need explicit size for tus-js-client
    // In browser, Uppy's TUS plugin may not derive size from Blob automatically
    if (
      this.getUploadSource() === UPLOAD_SOURCE_TUS &&
      size !== undefined &&
      size > 0
    ) {
      uppy.setFileState(fileId, {
        tus: { uploadSize: size },
      });
    }
  }

  #startUpload(uppy: Uppy, options?: UploadOptions): void {
    uppy.upload().catch((error) => {
      options?.onError?.(new Error(this.#extractErrorMessage(error)));
    });
  }

  #createUploadOperation(
    uppy: Uppy,
    fileId: string | null,
    resultPromise: Promise<UploadResult>,
    progress: UploadProgress,
  ): UploadOperation {
    return {
      cancel: () => {
        uppy.cancelAll();
      },
      pause: () => {
        if (fileId) {
          uppy.pauseResume(fileId);
        }
      },
      resume: () => {
        if (fileId) {
          uppy.pauseResume(fileId);
        }
      },
      result: resultPromise,
      progress: Object.freeze({ ...progress }),
    };
  }

  destroy(): void {
    // No-op since each upload creates its own Uppy instance
  }

  protected abstract configurePlugin(uppy: Uppy): void;
  protected abstract parseResult(result: unknown): UploadResult;
  protected abstract getUploadSource(): string;

  protected mapUploadResponse(
    body: unknown,
    uploadId: string,
    overrides?: Partial<UploadResult>,
  ): UploadResult {
    if (body && typeof body === "object" && "CID" in body) {
      const { CID } = body as PostUploadResponse;
      return {
        id: uploadId,
        cid: CID,
        name: "",
        size: 0,
        mimeType: "",
        createdAt: new Date(),
        numberOfFiles: 1,
        [UploadResultSymbol]: true,
        ...overrides,
      };
    }

    return {
      id: uploadId,
      name: "",
      size: 0,
      mimeType: "",
      createdAt: new Date(),
      numberOfFiles: 1,
      [UploadResultSymbol]: true,
      ...overrides,
    };
  }
}
