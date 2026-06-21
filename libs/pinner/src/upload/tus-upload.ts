import Uppy from "@uppy/core";
import TusPlugin from "@uppy/tus";
import type { UploadResult } from "@/types/upload";
import { BaseUploadHandler } from "./base-upload";
import type { PinnerConfig } from "@/config";
import type { AuthManager } from "@/auth";
import { UPLOAD_SOURCE_TUS } from "./constants";

export class TUSUploadHandler extends BaseUploadHandler {
  constructor(config: PinnerConfig, auth: AuthManager) {
    super(config, auth);
  }
  protected configurePlugin(uppy: Uppy): void {
    uppy.use(TusPlugin, {
      endpoint: `${this.config.endpoint}/api/upload/tus`,
      headers: this.auth.getAuthHeaders(),
      chunkSize: 10 * 1024 * 1024,
      retryDelays: [0, 1000, 3000, 5000],
    });
  }

  protected parseResult(result: unknown): UploadResult {
    const uppyResponse = result as
      | {
          uploadURL: string;
          body?: unknown;
        }
      | undefined;

    if (!uppyResponse) {
      return this.mapUploadResponse(undefined, "");
    }

    const uploadId = uppyResponse.uploadURL?.split("/").pop() || "";
    const body = uppyResponse.body;

    return this.mapUploadResponse(body, uploadId, {
      isDirectory: false,
    });
  }

  protected getUploadSource(): string {
    return UPLOAD_SOURCE_TUS;
  }
}
