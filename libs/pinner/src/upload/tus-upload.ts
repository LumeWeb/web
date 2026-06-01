import Uppy from "@uppy/core";
import TusPlugin from "@uppy/tus";
import type { UploadResult } from "@/types/upload";
import { UploadResultSymbol } from "@/types/upload";
import { BaseUploadHandler } from "./base-upload";
import type { PinnerConfig } from "@/config";
import { UPLOAD_SOURCE_TUS } from "./constants";

export class TUSUploadHandler extends BaseUploadHandler {
  constructor(config: PinnerConfig) {
    super(config);
  }
  protected configurePlugin(uppy: Uppy): void {
    uppy.use(TusPlugin, {
      endpoint: `${this.config.endpoint}/api/upload/tus`,
      headers: {
        Authorization: `Bearer ${this.config.jwt}`,
      },
      chunkSize: 10 * 1024 * 1024, // 10MB chunks
      retryDelays: [0, 1000, 3000, 5000],
    });
  }

  protected parseResult(result: unknown): UploadResult {
    const uppyResponse = result as
      | {
          uploadURL: string;
          body?: UploadResult;
        }
      | undefined;

    if (!uppyResponse) {
      return {
        id: "",
        cid: "",
        name: "",
        size: 0,
        mimeType: "",
        createdAt: new Date(),
        numberOfFiles: 1,
        isDirectory: false,
        [UploadResultSymbol]: true,
      };
    }

    const response = uppyResponse.body;

    if (response && response.cid) {
      return {
        id: response.id,
        cid: response.cid,
        name: response.name,
        size: response.size,
        mimeType: response.mimeType,
        createdAt: new Date(response.createdAt),
        numberOfFiles: response.numberOfFiles,
        isDirectory: response.isDirectory ?? false,
        keyvalues: response.keyvalues,
        operationId: response.operationId,
        [UploadResultSymbol]: true,
      };
    }

    const uploadId = uppyResponse.uploadURL?.split("/").pop() || "";

    return {
      id: uploadId,
      cid: "",
      name: "",
      size: 0,
      mimeType: "",
      createdAt: new Date(),
      numberOfFiles: 1,
      isDirectory: false,
      [UploadResultSymbol]: true,
    };
  }

  protected getUploadSource(): string {
    return UPLOAD_SOURCE_TUS;
  }
}
