// Core exports
export { Pinner } from "./pinner";
export type { PinnerConfig } from "./config";

// Upload exports
export type {
  UploadResult,
  UploadOptions,
  UploadProgress,
  UploadOperation,
  UploadInput,
} from "@/types/upload";
export { UploadManager } from "./upload/manager";
export {
  preprocessToCar,
  isCarFile,
  destroyCarPreprocessor,
  type CarPreprocessOptions,
  type CarPreprocessResult,
} from "./upload/car";

// Pin exports
export type {
  RemotePins,
  RemotePin,
  RemoteAddOptions,
  RemoteLsOptions,
  AbortOptions,
} from "@/types/pin";

// API exports
export { IpnsClient } from "./api/ipns";
export { WebsitesClient, WebsiteValidationReason, getValidationReason, isValidationReason } from "./api/websites";
export type { WebsiteValidationReasonValue } from "./api/websites";

// Error exports
export {
  PinnerError,
  ConfigurationError,
  AuthenticationError,
  UploadError,
  NetworkError,
  ValidationError,
  EmptyFileError,
  TimeoutError,
  PinError,
  NotFoundError,
  RateLimitError,
} from "./errors";

// Type guards
export { isRetryable, isAuthenticationError } from "./types/type-guards";

// MIME type constants
export { MIME_TYPE_CAR, MIME_TYPE_OCTET_STREAM, FILE_EXTENSION_CAR } from "./types/mime-types";

// Blockstore exports
export { createBlockstore, createDatastore, setDriverFactory } from "./blockstore";
export type { UnstorageBlockstoreOptions } from "./blockstore";

// Stream utilities
export {
  streamToBlob,
  calculateStreamSize,
  asyncGeneratorToReadableStream,
  readableStreamToAsyncIterable,
} from "./utils/stream";

// Pinata adapters
export {
  pinataAdapter,       // v2.x (recommended)
  pinataLegacyAdapter, // v1.10.1 (legacy)
} from "./adapters/pinata";

export type {
  PinataAdapter,       // v2.x
  PinataLegacyAdapter, // v1.10.1
} from "./adapters/pinata";
