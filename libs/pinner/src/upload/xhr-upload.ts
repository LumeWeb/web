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
      body?: {
        id: string;
        cid: string;
        name: string;
        size: number;
        mimeType: string;
        createdAt: string;
        numberOfFiles: number;
        keyvalues?: Record<string, string>;
      };
    };

    const response = uppyResponse.body || (uppyResponse as any);

    return {
      id: response.id,
      cid: response.cid,
      name: response.name,
      size: response.size,
      mimeType: response.mimeType,
      createdAt: new Date(response.createdAt),
      numberOfFiles: response.numberOfFiles,
      keyvalues: response.keyvalues,
    };
  }

  protected getUploadSource(): string {
    return UPLOAD_SOURCE_XHR;
  }
}
