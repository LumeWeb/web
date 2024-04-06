import { AxiosProgressEvent } from "axios";
import {
  DetailedError,
  HttpRequest,
  Upload,
  UploadOptions,
} from "tus-js-client";

import { blake3 } from "@noble/hashes/blake3";
import { Buffer } from "buffer";

import { getFileMimeType } from "../utils/file.js";
import { S5Client } from "../client.js";
import { CID, CID_HASH_TYPES, CID_TYPES } from "@lumeweb/libs5";
import {
  type BasicUploadResponse,
  postS5Upload,
  postS5UploadDirectory,
  PostS5UploadDirectoryParams,
  PostS5UploadResult,
} from "../generated/index.js";
import { BaseCustomOptions } from "./registry.js";
import { optionsToConfig } from "../utils/options.js";
import { buildRequestUrl } from "../request.js";
import defer from "p-defer";
import { Multihash } from "@lumeweb/libs5/lib/multihash.js";

/**
 * The tus chunk size is (4MiB - encryptionOverhead) * dataPieces, set as default.
 */
export const TUS_CHUNK_SIZE = (1 << 22) * 8;

/**
 * The retry delays, in ms. Data is stored in for up to 20 minutes, so the
 * total delays should not exceed that length of time.
 */
const DEFAULT_TUS_RETRY_DELAYS = [0, 5_000, 15_000, 60_000, 300_000, 600_000];

/**
 * The portal file field name.
 */
const PORTAL_FILE_FIELD_NAME = "file";

export const TUS_ENDPOINT = "/s5/upload/tus";

export interface HashProgressEvent {
  bytes: number;
  total: number;
}

/**
 * Custom upload options.
 *
 * @property [largeFileSize=32943040] - The size at which files are considered "large" and will be uploaded using the tus resumable upload protocol. This is the size of one chunk by default (32 mib). Note that this does not affect the actual size of chunks used by the protocol.
 * @property [errorPages] - Defines a mapping of error codes and subfiles which are to be served in case we are serving the respective error code. All subfiles referred like this must be defined with absolute paths and must exist.
 * @property [retryDelays=[0, 5_000, 15_000, 60_000, 300_000, 600_000]] - An array or undefined, indicating how many milliseconds should pass before the next attempt to uploading will be started after the transfer has been interrupted. The array's length indicates the maximum number of attempts.
 * @property [tryFiles] - Allows us to set a list of potential subfiles to return in case the requested one does not exist or is a directory. Those subfiles might be listed with relative or absolute paths. If the path is absolute the file must exist.
 */
export type CustomUploadOptions = BaseCustomOptions & {
  errorPages?: Record<string, string>;
  tryFiles?: string[];

  // Large files.
  largeFileSize?: number;
  retryDelays?: number[];
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
  onHashProgress?: (progressEvent: HashProgressEvent) => void;
};

export const DEFAULT_UPLOAD_OPTIONS = {
  errorPages: { 404: "/404.html" },
  tryFiles: ["index.html"],

  // Large files.
  largeFileSize: TUS_CHUNK_SIZE,
  retryDelays: DEFAULT_TUS_RETRY_DELAYS,
} as CustomUploadOptions;

export interface UploadResult {
  cid: CID;
}
