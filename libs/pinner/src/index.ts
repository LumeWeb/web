// Core exports
export { Pinner } from "./pinner";
export type { PinnerConfig } from "./config";

export type { FileManagerItem } from "./api/generated/schemas/fileManagerItem";
export type { FileManagerItemResponse } from "./api/generated/schemas/fileManagerItemResponse";
export type { BlockMetaResponse } from "./api/generated/schemas/blockMetaResponse";
export type { InfoResponse } from "./api/generated/schemas/infoResponse";
export type { PinStatusResponse } from "./api/generated/schemas/pinStatusResponse";
export type { PinStatusResponseInfo } from "./api/generated/schemas/pinStatusResponseInfo";
export type { PinRequest } from "./api/generated/schemas/pinRequest";
export type { PinRequestMeta } from "./api/generated/schemas/pinRequestMeta";
export type { PinResultsResponse } from "./api/generated/schemas/pinResultsResponse";
export type { ErrorResponse } from "./api/generated/schemas/errorResponse";
export type { Multiaddr } from "./api/generated/schemas/multiaddr";
export type { PostUploadResponse } from "./api/generated/schemas/postUploadResponse";
export type { UploadResultResponse } from "./api/generated/schemas/uploadResultResponse";
export type { Component } from "./api/generated/schemas/component";
export type { GatewayWebsiteResponse } from "./api/generated/schemas/gatewayWebsiteResponse";
export type { GatewayWebsiteStatusResponse } from "./api/generated/schemas/gatewayWebsiteStatusResponse";
export type { GetBlockMetaBatchRequest } from "./api/generated/schemas/getBlockMetaBatchRequest";
export type { IPNSKeyRequest } from "./api/generated/schemas/iPNSKeyRequest";
export type { IPNSKeyListResponseResponse } from "./api/generated/schemas/iPNSKeyListResponseResponse";
export type { IPNSKeyListResponse } from "./api/generated/schemas/iPNSKeyListResponse";
export type { IPNSRepublishResponse } from "./api/generated/schemas/iPNSRepublishResponse";
export type { IPNSKeyResponse } from "./api/generated/schemas/iPNSKeyResponse";
export type { IPNSPublishRequest } from "./api/generated/schemas/iPNSPublishRequest";
export type { IPNSPublishResponse } from "./api/generated/schemas/iPNSPublishResponse";
export type { IPNSResolveResponse } from "./api/generated/schemas/iPNSResolveResponse";
export type { PostApiUploadBody } from "./api/generated/schemas/postApiUploadBody";
export type { SSLStatusUpdateRequest } from "./api/generated/schemas/sSLStatusUpdateRequest";
export type { WebsiteItemResponse } from "./api/generated/schemas/websiteItemResponse";
export type { WebsiteRequest } from "./api/generated/schemas/websiteRequest";
export type { WebsiteResponse } from "./api/generated/schemas/websiteResponse";
export type { WebsiteItem } from "./api/generated/schemas/websiteItem";
export type { WebsiteUpdateRequest } from "./api/generated/schemas/websiteUpdateRequest";
export type { WebsiteConfigResponse } from "./api/generated/schemas/websiteConfigResponse";
export type { SSLStatusInfo } from "./api/generated/schemas/sSLStatusInfo";
export type { WebsiteValidateResponse } from "./api/generated/schemas/websiteValidateResponse";

// Upload exports
export type {
  UploadResult,
  UploadOptions,
  UploadProgress,
  UploadOperation,
  UploadInput,
  PinnerUploadBuilder,
} from "@/types/upload";
export { UploadManager } from "./upload/manager";
export type { UploadMethodAndBuilder, UploadBuilderNamespace } from "./upload/builder";
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
export type { WebsiteValidationReasonValue, WebsitesClientOptions, WatchOptions, SSLWatcher, SSLCallbacks, SSLError } from "./api/websites";
export type { IpnsClientOptions } from "./api/ipns";

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
export type { UnstorageBlockstoreOptions, DriverFactory } from "./blockstore";

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

// Pinata adapter types (referenced by adapter method signatures)
export type {
  PinataConfig as PinataLegacyConfig,
  UploadResponse as PinataUploadResponse,
  UploadOptions as PinataUploadOptions,
  FileListResponse as PinataFileListResponse,
  FileListQuery as PinataFileListQuery,
  FileListItem as PinataFileListItem,
  PinJobQuery as PinataPinJobQuery,
  PinJobResponse as PinataPinJobResponse,
  PinJobItem as PinataPinJobItem,
  SignedUrlOptions as PinataSignedUrlOptions,
  AnalyticsQuery as PinataAnalyticsQuery,
  TopAnalyticsQuery as PinataTopAnalyticsQuery,
  TopAnalyticsResponse as PinataTopAnalyticsResponse,
  TopAnalyticsItem as PinataTopAnalyticsItem,
  TimeIntervalAnalyticsQuery as PinataTimeIntervalAnalyticsQuery,
  TimeIntervalAnalyticsResponse as PinataTimeIntervalAnalyticsResponse,
  TimePeriodItem as PinataTimePeriodItem,
  SwapCidOptions as PinataSwapCidOptions,
  SwapHistoryOptions as PinataSwapHistoryOptions,
  SwapCidResponse as PinataSwapCidResponse,
  ContainsCIDResponse as PinataContainsCIDResponse,
  KeyScopes as PinataKeyScopes,
  PinataMetadata as PinataLegacyMetadata,
  DeleteResponse as PinataDeleteResponse,
  JsonBody as PinataJsonBody,
  FileObject as PinataFileObject,
} from "./adapters/pinata/shared/types";

export type {
  PinataConfig as PinataV2Config,
  UploadOptions as PinataV2UploadOptions,
  UploadResponse as PinataV2UploadResponse,
  UploadCIDOptions as PinataV2UploadCIDOptions,
  PinByCIDResponse as PinataPinByCIDResponse,
  SignedUploadUrlOptions as PinataV2SignedUploadUrlOptions,
  FileListItem as PinataV2FileListItem,
  FileListResponse as PinataV2FileListResponse,
  FileListQuery as PinataV2FileListQuery,
  UpdateFileOptions as PinataV2UpdateFileOptions,
  DeleteResponse as PinataV2DeleteResponse,
  PinQueueItem as PinataPinQueueItem,
  PinQueueQuery as PinataPinQueueQuery,
  PinQueueResponse as PinataPinQueueResponse,
  SwapCidOptions as PinataV2SwapCidOptions,
  SwapHistoryOptions as PinataV2SwapHistoryOptions,
  SwapCidResponse as PinataV2SwapCidResponse,
  AccessLinkOptions as PinataV2AccessLinkOptions,
  ContentType as PinataV2ContentType,
  GetCIDResponse as PinataV2GetCIDResponse,
  GroupOptions as PinataV2GroupOptions,
  UpdateGroupOptions as PinataV2UpdateGroupOptions,
  GetGroupOptions as PinataV2GetGroupOptions,
  GroupResponseItem as PinataV2GroupResponseItem,
  GroupListResponse as PinataV2GroupListResponse,
  GroupQueryOptions as PinataV2GroupQueryOptions,
  GroupCIDOptions as PinataV2GroupCIDOptions,
  UpdateGroupFilesResponse as PinataV2UpdateGroupFilesResponse,
  AnalyticsQuery as PinataV2AnalyticsQuery,
  TopAnalyticsQuery as PinataV2TopAnalyticsQuery,
  TopAnalyticsResponse as PinataV2TopAnalyticsResponse,
  TopAnalyticsItem as PinataV2TopAnalyticsItem,
  TimeIntervalAnalyticsQuery as PinataV2TimeIntervalAnalyticsQuery,
  TimePeriodItem as PinataV2TimePeriodItem,
  TimeIntervalAnalyticsResponse as PinataV2TimeIntervalAnalyticsResponse,
  UserPinnedDataResponse as PinataV2UserPinnedDataResponse,
  CidVersion as PinataCidVersion,
  Network as PinataNetwork,
  PinataMetadata as PinataV2Metadata,
} from "./adapters/pinata/v2/types";

export type {
  UploadBuilder as PinataUploadBuilder,
  FilterFiles as PinataFilterFiles,
  FilterQueue as PinataFilterQueue,
  FilterGroups as PinataFilterGroups,
  PublicUpload as PinataPublicUpload,
  PrivateUpload as PinataPrivateUpload,
  PublicFiles as PinataPublicFiles,
  PrivateFiles as PinataPrivateFiles,
  PublicGateways as PinataPublicGateways,
  PrivateGateways as PinataPrivateGateways,
  PublicGroups as PinataPublicGroups,
  PrivateGroups as PinataPrivateGroups,
  Analytics as PinataAnalytics,
} from "./adapters/pinata/v2/adapter-interface";
