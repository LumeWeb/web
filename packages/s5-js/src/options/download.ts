import { ResponseType } from "axios";
import { CustomClientOptions } from "../utils/options.js";

export type CustomDownloadOptions = CustomClientOptions & {
  path?: string;
  range?: string;
  responseType?: ResponseType;
};

export type CustomGetMetadataOptions = CustomClientOptions & {};

/**
 * The response for a get metadata request.
 *
 * @property metadata - The metadata in JSON format.
 * @property portalUrl - The URL of the portal.
 * @property cid - 46-character cid.
 */
export type MetadataResult = {
  metadata: Record<string, unknown>;
};

export const DEFAULT_DOWNLOAD_OPTIONS = {
  range: undefined,
  responseType: undefined,
} as CustomDownloadOptions;

export const DEFAULT_GET_METADATA_OPTIONS = {};
