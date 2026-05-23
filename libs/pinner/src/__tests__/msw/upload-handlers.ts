import { http, HttpResponse } from "msw";
import { OPERATION_STATUS } from "@lumeweb/portal-sdk";
import {
  createMockCID,
  getAccountApiUrl,
  testConfig,
} from "../setup";
import { TusStore, OperationStore } from "./upload-store";
import type { UploadResult } from "@/types/upload";

// Inlined from msw-helpers (deleted during harness migration)

async function createMockUploadResult(
  overrides: Partial<UploadResult> = {},
): Promise<UploadResult> {
  const { getNextRequestId } = await import("../setup");
  const requestId = getNextRequestId();
  const cid = overrides.cid || (await createMockCID(requestId));

  return {
    id: overrides.id || "test-upload-id",
    cid,
    name: overrides.name || "test.car",
    size: overrides.size || 1024,
    mimeType: overrides.mimeType || "application/vnd.ipld.car",
    createdAt: overrides.createdAt || new Date(),
    numberOfFiles: overrides.numberOfFiles || 1,
    keyvalues: overrides.keyvalues,
    isDirectory: overrides.isDirectory,
    operationId: overrides.operationId,
  };
}

async function applyMockDelay(
  delay: number = testConfig.mockDelay,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, delay));
}

const CORS_HEADERS = { "Access-Control-Allow-Origin": "*" };

const XHR_FORM_FIELD = "file";
const DEFAULT_FILENAME = "upload.car";
const DEFAULT_FILE_SIZE = 1024;

export function createUploadHandlers(tusStore: TusStore, operationStore: OperationStore) {
  const tusOptionsHandler = http.options(
    `${testConfig.apiUrl}/upload/tus`,
    () => {
      return new HttpResponse(null, {
        status: 204,
        headers: {
          "Tus-Extension":
            "creation,creation-with-upload,termination,creation-defer-length",
          "Tus-Version": "1.0.0",
          "Tus-Max-Size": testConfig.defaultUploadLimit.toString(),
          "Access-Control-Expose-Headers":
            "Tus-Extension,Tus-Version,Tus-Max-Size",
          "Access-Control-Allow-Origin": "*",
        },
      });
    },
  );

  const tusHeadHandler = http.head(
    `${testConfig.apiUrl}/upload/tus/:uploadId`,
    ({ params }) => {
      const fileId = params.uploadId as string;
      const file = tusStore.getTusFile(fileId);

      if (!file) {
        return new HttpResponse("The file for this url was not found\n", {
          status: 404,
          headers: {
            "Tus-Resumable": "1.0.0",
            ...CORS_HEADERS,
          },
        });
      }

      const headers: Record<string, string> = {
        "Cache-Control": "no-store",
        "Upload-Offset": file.size.toString(),
        "Tus-Resumable": "1.0.0",
        "Access-Control-Expose-Headers": "Upload-Offset,Tus-Resumable",
        ...CORS_HEADERS,
      };

      if (file.upload_length !== undefined) {
        headers["Upload-Length"] = file.upload_length;
        headers["Access-Control-Expose-Headers"] =
          "Upload-Length,Upload-Offset,Tus-Resumable";
      }

      if (file.upload_defer_length !== undefined) {
        headers["Upload-Defer-Length"] = file.upload_defer_length;
        headers["Access-Control-Expose-Headers"] =
          "Upload-Defer-Length,Upload-Offset,Tus-Resumable";
      }

      if (file.upload_metadata !== undefined) {
        headers["Upload-Metadata"] = file.upload_metadata;
      }

      return new HttpResponse(null, {
        status: 200,
        headers,
      });
    },
  );

  const tusCreateHandler = http.post(
    `${testConfig.apiUrl}/upload/tus`,
    async ({ request }) => {
      const uploadLength = request.headers.get("Upload-Length");
      const uploadDeferLength = request.headers.get("Upload-Defer-Length");
      const uploadMetadata = request.headers.get("Upload-Metadata");

      if ((uploadLength === null) === (uploadDeferLength === null)) {
        return new HttpResponse(
          "Upload-Length or Upload-Defer-Length header required\n",
          {
            status: 400,
            headers: {
              "Tus-Resumable": "1.0.0",
              ...CORS_HEADERS,
            },
          },
        );
      }

      const uploadId = tusStore.getNextUploadId();
      const location = `${testConfig.apiUrl}/upload/tus/${uploadId}`;

      tusStore.createTusFile(
        uploadId,
        uploadLength || undefined,
        uploadMetadata || undefined,
      );

      const headers: Record<string, string> = {
        "Location": location,
        "Tus-Resumable": "1.0.0",
        "Access-Control-Expose-Headers": "Location,Tus-Resumable",
        ...CORS_HEADERS,
      };

      const contentType = request.headers.get("Content-Type");
      if (contentType && uploadLength) {
        const body = await request.text();
        const contentLength = body.length;
        const totalSize = parseInt(uploadLength, 10);

        const newOffset = Math.min(contentLength, totalSize);
        tusStore.updateTusFileOffset(uploadId, newOffset);

        headers["Upload-Offset"] = newOffset.toString();
        headers["Access-Control-Expose-Headers"] =
          "Location,Upload-Offset,Tus-Resumable";
      }

      return new HttpResponse(null, {
        status: 201,
        headers,
      });
    },
  );

  const tusPatchHandler = http.patch(
    `${testConfig.apiUrl}/upload/tus/:uploadId`,
    async ({ request, params }) => {
      const fileId = params.uploadId as string;

      const uploadOffset = request.headers.get("Upload-Offset");
      if (uploadOffset === null) {
        return new HttpResponse("Upload-Offset header required\n", {
          status: 403,
          headers: {
            "Tus-Resumable": "1.0.0",
            ...CORS_HEADERS,
          },
        });
      }

      const contentType = request.headers.get("Content-Type");
      if (contentType === null) {
        return new HttpResponse("Content-Type header required\n", {
          status: 403,
          headers: {
            "Tus-Resumable": "1.0.0",
            ...CORS_HEADERS,
          },
        });
      }

      const offset = parseInt(uploadOffset, 10);

      const file = tusStore.getTusFile(fileId);
      if (!file) {
        return new HttpResponse("The file for this url was not found\n", {
          status: 404,
          headers: {
            "Tus-Resumable": "1.0.0",
            ...CORS_HEADERS,
          },
        });
      }

      if (file.size !== offset) {
        return new HttpResponse(
          `Upload-Offset conflict (expected ${file.size}, got ${offset})\n`,
          {
            status: 409,
            headers: {
              "Tus-Resumable": "1.0.0",
              ...CORS_HEADERS,
            },
          },
        );
      }

      const uploadLengthHeader = request.headers.get("Upload-Length");
      if (uploadLengthHeader !== null) {
        if (file.upload_length !== undefined) {
          return new HttpResponse("Upload-Length already set\n", {
            status: 400,
            headers: {
              "Tus-Resumable": "1.0.0",
              ...CORS_HEADERS,
            },
          });
        }

        const newLength = parseInt(uploadLengthHeader, 10);
        if (newLength < file.size) {
          return new HttpResponse("Invalid Upload-Length\n", {
            status: 400,
            headers: {
              "Tus-Resumable": "1.0.0",
              ...CORS_HEADERS,
            },
          });
        }

        file.upload_length = uploadLengthHeader;
        file.upload_defer_length = undefined;
      }

      const body = await request.text();
      const contentLength = body.length;
      let newOffset = offset + contentLength;

      if (file.upload_length !== undefined) {
        const totalSize = parseInt(file.upload_length, 10);
        newOffset = Math.min(newOffset, totalSize);
      }

      tusStore.updateTusFileOffset(fileId, newOffset);

      return new HttpResponse(null, {
        status: 204,
        headers: {
          "Upload-Offset": newOffset.toString(),
          "Tus-Resumable": "1.0.0",
          "Access-Control-Expose-Headers": "Upload-Offset,Tus-Resumable",
          ...CORS_HEADERS,
        },
      });
    },
  );

  const tusDeleteHandler = http.delete(
    `${testConfig.apiUrl}/upload/tus/:uploadId`,
    ({ params }) => {
      const fileId = params.uploadId as string;
      tusStore.deleteTusFile(fileId);

      return new HttpResponse(null, {
        status: 204,
        headers: {
          "Tus-Resumable": "1.0.0",
          ...CORS_HEADERS,
        },
      });
    },
  );

  const xhrUploadHandler = http.post(
    `${testConfig.apiUrl}/upload`,
    async ({ request }) => {
      await applyMockDelay(100);

      let filename: string = DEFAULT_FILENAME;
      let fileSize: number = DEFAULT_FILE_SIZE;
      try {
        const formData = await request.formData();
        const file = formData.get(XHR_FORM_FIELD) as File;
        if (file) {
          filename = file.name;
          fileSize = file.size;
        }
      } catch (error) {
        console.warn("[MSW] Could not extract file info from request:", error);
      }

      const operationId = operationStore.getNextOperationId();
      const result = await createMockUploadResult({
        name: filename,
        cid: await createMockCID(operationId),
        size: fileSize,
        operationId,
      });

      return HttpResponse.json(result, {
        status: 200,
        headers: CORS_HEADERS,
      });
    },
  );

  const accountUploadLimitHandler = http.get(
    `${getAccountApiUrl()}/upload-limit`,
    () => {
      return HttpResponse.json(
        {
          success: true,
          data: {
            limit: testConfig.defaultUploadLimit,
          },
        },
        {
          status: 200,
          headers: CORS_HEADERS,
        },
      );
    },
  );

  const accountInfoHandler = http.get(
    `${getAccountApiUrl()}/account`,
    () => {
      return HttpResponse.json(
        {
          success: true,
          data: {
            id: "test-account-id",
            email: "test@example.com",
          },
        },
        {
          status: 200,
          headers: CORS_HEADERS,
        },
      );
    },
  );

  const listOperationsHandler = http.get(
    `${getAccountApiUrl()}/operations`,
    async ({ request }) => {
      await applyMockDelay();

      const url = new URL(request.url);
      const cidFilter = url.searchParams.get("filters[cid][eq]");

      const result = await operationStore.createMockOperation(12345, {
        operation: "upload",
        operation_display_name: "Upload",
        cid: cidFilter || undefined,
      });

      return HttpResponse.json(
        { data: result, total: 1 },
        {
          status: 200,
          headers: CORS_HEADERS,
        },
      );
    },
  );

  const operationHandler = http.get(
    `${getAccountApiUrl()}/operations/:id`,
    async ({ params }) => {
      await applyMockDelay();

      const operationId = parseInt(params.id as string, 10);

      if (operationId === 99999) {
        const result = await operationStore.createMockOperation(operationId, {
          status: OPERATION_STATUS.FAILED,
          error: "Simulated failure",
        });

        return HttpResponse.json(result, {
          status: 200,
          headers: CORS_HEADERS,
        });
      }

      const result = await operationStore.createMockOperation(operationId);

      return HttpResponse.json(result, {
        status: 200,
        headers: CORS_HEADERS,
      });
    },
  );

  return [
    tusOptionsHandler,
    tusHeadHandler,
    tusCreateHandler,
    tusPatchHandler,
    tusDeleteHandler,
    xhrUploadHandler,
    accountUploadLimitHandler,
    accountInfoHandler,
    listOperationsHandler,
    operationHandler,
  ];
}

export function resetUploadState(tusStore: TusStore, operationStore: OperationStore): void {
  tusStore.reset();
  operationStore.reset();
}
