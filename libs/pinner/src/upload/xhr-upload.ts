import Uppy from "@uppy/core";
import XHRUpload from "@lumeweb/uppy-post-upload";
import type { UploadResult } from "@/types/upload";
import { BaseUploadHandler } from "./base-upload";
import { UPLOAD_SOURCE_XHR } from "./constants";

export class XHRUploadHandler extends BaseUploadHandler {
  protected configurePlugin(uppy: Uppy): void {
    uppy.use(XHRUpload, {
      endpoint: `${this.config.endpoint}/api/upload`,
      fieldName: "file",
      formData: true,
      headers: {
        Authorization: `Bearer ${this.config.jwt}`,
      },
    });
  }

  protected parseResult(result: unknown): UploadResult {
    const uppyResponse = result as {
      uploadURL: string;
      body?: unknown;
    };

    const body = uppyResponse.body;
    const uploadId = uppyResponse.uploadURL?.split("/").pop() || "";

    return this.mapUploadResponse(body, uploadId);
  }

  protected getUploadSource(): string {
    return UPLOAD_SOURCE_XHR;
  }
}
