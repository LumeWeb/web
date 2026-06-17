import type { UploadInput, UploadOptions } from "@/types/upload";
import {
  FILE_EXTENSION_CAR,
  MIME_TYPE_CAR,
  MIME_TYPE_OCTET_STREAM,
} from "@/types/mime-types";

export interface NormalizedUploadInput {
  /**
   * List of file manager items
   */
  data: File | ReadableStream<Uint8Array>;
  name: string;
  type: string;
  size: number;
}

export interface UploadInputObject {
  /**
   * List of file manager items
   */
  data: ReadableStream<Uint8Array>;
  name: string;
  type: string;
  size?: number;
}

export function normalizeUploadInput(
  input: UploadInput | UploadInputObject,
  options?: UploadOptions,
): NormalizedUploadInput {
  if (input instanceof File) {
    return {
      data: input,
      name: input.name,
      type: input.type,
      size: input.size,
    };
  }

  if (input instanceof ReadableStream) {
    return {
      data: input,
      name: options?.name || "upload",
      type: options?.name?.endsWith(FILE_EXTENSION_CAR)
        ? MIME_TYPE_CAR
        : MIME_TYPE_OCTET_STREAM,
      size: 0,
    };
  }

  const objectInput = input as UploadInputObject;
  return {
    data: objectInput.data,
    name: objectInput.name,
    type: objectInput.type,
    size: objectInput.size || 0,
  };
}
