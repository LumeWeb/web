// MSW handlers for upload operations
// This file provides mock handlers for all upload-related API operations

import { http, HttpResponse } from "msw";
import {
  createMockCID,
  getAccountApiUrl,
  getNextRequestId,
  testConfig,
} from "./setup";
import { applyMockDelay, createMockUploadResult } from "./msw-helpers";

// Counter for TUS upload IDs
let tusUploadCounter = 0;

export function resetTusUploadCounter(): void {
  tusUploadCounter = 0;
}

// ============================================================================
// TUS UPLOAD STATE (following tus-node-server implementation)
// ============================================================================

interface TusFile {
  id: string;
  size: number; // Current offset / bytes uploaded
  upload_length?: string; // Total size (from Upload-Length header)
  upload_defer_length?: string; // If length is deferred
  upload_metadata?: string; // Metadata from creation
}

// Track TUS upload state per uploadId (simulating FileStore)
const tusUploadState = new Map<string, TusFile>();

function getTusFile(fileId: string): TusFile | undefined {
  return tusUploadState.get(fileId);
}

function createTusFile(
  fileId: string,
  uploadLength?: string,
  uploadMetadata?: string,
): TusFile {
  const file: TusFile = {
    id: fileId,
    size: 0, // Start with offset 0
    upload_length: uploadLength,
    upload_metadata: uploadMetadata,
  };
  tusUploadState.set(fileId, file);
  return file;
}

function updateTusFileOffset(fileId: string, newOffset: number): void {
  const file = tusUploadState.get(fileId);
  if (file) {
    file.size = newOffset;
  }
}

function deleteTusFile(fileId: string): void {
  tusUploadState.delete(fileId);
}

// Clear all TUS upload states (useful for test cleanup)
export function clearAllTusUploadStates() {
  tusUploadState.clear();
}

// ============================================================================
// TUS UPLOAD HANDLERS
// ============================================================================

// TUS OPTIONS request - server capabilities
export const tusOptionsHandler = http.options(
  `${testConfig.apiUrl}/api/upload/tus`,
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

// TUS HEAD request - check upload status (following tus-node-server HeadHandler)
export const tusHeadHandler = http.head(
  `${testConfig.apiUrl}/api/upload/tus/:uploadId`,
  ({ params }) => {
    const fileId = params.uploadId as string;
    const file = getTusFile(fileId);

    if (!file) {
      return new HttpResponse("The file for this url was not found\n", {
        status: 404,
        headers: {
          "Tus-Resumable": "1.0.0",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const headers: Record<string, string> = {
      "Cache-Control": "no-store",
      "Upload-Offset": file.size.toString(),
      "Tus-Resumable": "1.0.0",
      "Access-Control-Expose-Headers": "Upload-Offset,Tus-Resumable",
      "Access-Control-Allow-Origin": "*",
    };

    // Include Upload-Length if known
    if (file.upload_length !== undefined) {
      headers["Upload-Length"] = file.upload_length;
      headers["Access-Control-Expose-Headers"] =
        "Upload-Length,Upload-Offset,Tus-Resumable";
    }

    // Include Upload-Defer-Length if length is deferred
    if (file.upload_defer_length !== undefined) {
      headers["Upload-Defer-Length"] = file.upload_defer_length;
      headers["Access-Control-Expose-Headers"] =
        "Upload-Defer-Length,Upload-Offset,Tus-Resumable";
    }

    // Include Upload-Metadata if present
    if (file.upload_metadata !== undefined) {
      headers["Upload-Metadata"] = file.upload_metadata;
    }

    return new HttpResponse(null, {
      status: 200,
      headers,
    });
  },
);

// TUS POST request - create upload (following tus-node-server PostHandler)
export const tusCreateHandler = http.post(
  `${testConfig.apiUrl}/api/upload/tus`,
  async ({ request }) => {
    const uploadLength = request.headers.get("Upload-Length");
    const uploadDeferLength = request.headers.get("Upload-Defer-Length");
    const uploadMetadata = request.headers.get("Upload-Metadata");

    // Validate: must have either Upload-Length or Upload-Defer-Length, but not both
    if ((uploadLength === null) === (uploadDeferLength === null)) {
      return new HttpResponse(
        "Upload-Length or Upload-Defer-Length header required\n",
        {
          status: 400,
          headers: {
            "Tus-Resumable": "1.0.0",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Use a predictable upload ID for testing
    tusUploadCounter++;
    const uploadId = `test-upload-id`;
    const location = `${testConfig.apiUrl}/api/upload/tus/${uploadId}`;

    // Create file record (simulating FileStore.create)
    const file = createTusFile(
      uploadId,
      uploadLength || undefined,
      uploadMetadata || undefined,
    );

    const headers: Record<string, string> = {
      "Location": location,
      "Tus-Resumable": "1.0.0",
      "Access-Control-Expose-Headers": "Location,Tus-Resumable",
      "Access-Control-Allow-Origin": "*",
    };

    // Support creation-with-upload extension
    // If there's a body with the POST request, handle it
    const contentType = request.headers.get("Content-Type");
    if (contentType && uploadLength) {
      // Read the actual body to get content length
      const body = await request.text();
      const contentLength = body.length;
      const totalSize = parseInt(uploadLength, 10);

      // Write the initial data
      const newOffset = Math.min(contentLength, totalSize);
      updateTusFileOffset(uploadId, newOffset);

      // Include Upload-Offset in response if data was written
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

// TUS PATCH request - upload chunks (following tus-node-server PatchHandler)
export const tusPatchHandler = http.patch(
  `${testConfig.apiUrl}/api/upload/tus/:uploadId`,
  async ({ request, params }) => {
    const fileId = params.uploadId as string;

    // The request MUST include an Upload-Offset header
    const uploadOffset = request.headers.get("Upload-Offset");
    if (uploadOffset === null) {
      return new HttpResponse("Upload-Offset header required\n", {
        status: 403,
        headers: {
          "Tus-Resumable": "1.0.0",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // The request MUST include a Content-Type header
    const contentType = request.headers.get("Content-Type");
    if (contentType === null) {
      return new HttpResponse("Content-Type header required\n", {
        status: 403,
        headers: {
          "Tus-Resumable": "1.0.0",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const offset = parseInt(uploadOffset, 10);

    // Get current file state (simulating store.getOffset)
    const file = getTusFile(fileId);
    if (!file) {
      return new HttpResponse("The file for this url was not found\n", {
        status: 404,
        headers: {
          "Tus-Resumable": "1.0.0",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Validate that the offset matches the current file size
    if (file.size !== offset) {
      return new HttpResponse(
        `Upload-Offset conflict (expected ${file.size}, got ${offset})\n`,
        {
          status: 409,
          headers: {
            "Tus-Resumable": "1.0.0",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Handle Upload-Length header for creation-defer-length extension
    const uploadLengthHeader = request.headers.get("Upload-Length");
    if (uploadLengthHeader !== null) {
      if (file.upload_length !== undefined) {
        return new HttpResponse("Upload-Length already set\n", {
          status: 400,
          headers: {
            "Tus-Resumable": "1.0.0",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      const newLength = parseInt(uploadLengthHeader, 10);
      if (newLength < file.size) {
        return new HttpResponse("Invalid Upload-Length\n", {
          status: 400,
          headers: {
            "Tus-Resumable": "1.0.0",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      // Update file with declared length
      file.upload_length = uploadLengthHeader;
      file.upload_defer_length = undefined;
    }

    // Write data and calculate new offset
    // In MSW, we need to read the actual body to get the content length
    // since Content-Length header might not be accurate
    const body = await request.text();
    const contentLength = body.length;
    let newOffset = offset + contentLength;

    // Cap at total size if known
    if (file.upload_length !== undefined) {
      const totalSize = parseInt(file.upload_length, 10);
      newOffset = Math.min(newOffset, totalSize);
    }

    // Update file offset
    updateTusFileOffset(fileId, newOffset);

    // Check if upload is complete
    if (file.upload_length !== undefined) {
      const totalSize = parseInt(file.upload_length, 10);
      if (newOffset === totalSize) {
        // Upload complete - could emit event here
      }
    }

    // Return 204 with new Upload-Offset
    return new HttpResponse(null, {
      status: 204,
      headers: {
        "Upload-Offset": newOffset.toString(),
        "Tus-Resumable": "1.0.0",
        "Access-Control-Expose-Headers": "Upload-Offset,Tus-Resumable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
);

// TUS DELETE request - terminate upload (following tus-node-server DeleteHandler)
export const tusDeleteHandler = http.delete(
  `${testConfig.apiUrl}/api/upload/tus/:uploadId`,
  ({ params }) => {
    const fileId = params.uploadId as string;

    // Delete the file record (simulating FileStore.remove)
    deleteTusFile(fileId);

    return new HttpResponse(null, {
      status: 204,
      headers: {
        "Tus-Resumable": "1.0.0",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
);

// Combined TUS handlers
export const tusUploadHandlers = [
  tusOptionsHandler,
  tusHeadHandler,
  tusCreateHandler,
  tusPatchHandler,
  tusDeleteHandler,
];

// ============================================================================
// XHR UPLOAD HANDLERS
// ============================================================================

// ============================================================================
// XHR UPLOAD HANDLERS
// ============================================================================

// Constants for XHR upload handling
const XHR_FORM_FIELD = "file";
const DEFAULT_FILENAME = "upload.car";
const DEFAULT_FILE_SIZE = 1024;

// XHR POST request - upload file
export const xhrUploadHandler = http.post(
  `${testConfig.apiUrl}/api/upload`,
  async ({ request }) => {
    await applyMockDelay(100);

    // Extract the filename and size from FormData
    // Note: We return the CAR filename as-is since everything is preprocessed to CAR
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
      // If we can't parse formData, use default
      console.warn("[MSW] Could not extract file info from request:", error);
    }

    const result = await createMockUploadResult({
      name: filename,
      cid: await createMockCID(getNextRequestId()),
      size: fileSize,
    });

    return HttpResponse.json(result, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
);

// Combined XHR handlers
export const xhrUploadHandlers = [xhrUploadHandler];

// ============================================================================
// ACCOUNT HANDLERS
// ============================================================================

// Account upload limit
export const accountUploadLimitHandler = http.get(
  `${getAccountApiUrl()}/api/upload-limit`,
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
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  },
);

// Account info
export const accountInfoHandler = http.get(
  `${getAccountApiUrl()}/api/account`,
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
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  },
);

// Combined account handlers
export const accountHandlers = [accountUploadLimitHandler, accountInfoHandler];

// ============================================================================
// COMBINED UPLOAD HANDLERS
// ============================================================================

// All upload handlers combined
export const uploadHandlers = [
  ...tusUploadHandlers,
  ...xhrUploadHandlers,
  ...accountHandlers,
];
