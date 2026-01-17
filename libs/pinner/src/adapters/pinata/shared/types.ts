/**
 * Pinata SDK 1.x Types
 * Source: https://github.com/PinataCloud/pinata/commit/c141177ff3036e46fa7b95fcc68c159b58817836
 * - src/core/types.ts
 *
 * Copyright © 2024 Pinata Cloud Technologies
 * Type definitions adapted from Pinata SDK for compatibility.
 * Original Pinata SDK: https://github.com/PinataCloud/pinata
 */

/**
 * Pinata configuration options
 */
export type PinataConfig = {
	pinataJwt?: string;
	pinataGateway?: string;
	pinataGatewayKey?: string;
	customHeaders?: Record<string, string>;
	endpointUrl?: string;
	uploadUrl?: string;
};

/**
 * Upload response from Pinata
 */
export type UploadResponse = {
	id: string;
	name: string;
	cid: string;
	size: number;
	created_at: string;
	number_of_files: number;
	mime_type: string;
	user_id: string;
	group_id: string | null;
	is_duplicate: true | null;
	vectorized: true | null;
};

/**
 * File object representation
 */
export type FileObject = {
	name: string;
	size: number;
	type: string;
	lastModified: number;
	arrayBuffer: () => Promise<ArrayBuffer>;
};

/**
 * JSON body type
 */
export type JsonBody = Record<string, unknown>;

/**
 * Pinata metadata options
 */
export type PinataMetadata = {
	name?: string;
	keyvalues?: Record<string, string>;
};

/**
 * Upload options
 */
export type UploadOptions = {
	metadata?: PinataMetadata;
	keys?: string;
	groupId?: string;
	vectorize?: boolean;
	url?: string;
};

/**
 * Delete response
 */
export type DeleteResponse = {
	id: string;
	status: string;
};

/**
 * File list item
 */
export type FileListItem = {
	id: string;
	name: string | null;
	cid: "pending" | string;
	size: number;
	number_of_files: number;
	mime_type: string;
	keyvalues: Record<string, string>;
	group_id: string | null;
	created_at: string;
};

/**
 * File list response
 */
export type FileListResponse = {
	files: FileListItem[];
	next_page_token: string;
};

/**
 * File list query options
 */
export type FileListQuery = {
	name?: string;
	group?: string;
	noGroup?: boolean;
	mimeType?: string;
	cid?: string;
	cidPending?: boolean;
	metadata?: Record<string, string>;
	order?: "ASC" | "DESC";
	limit?: number;
	pageToken?: number;
};

/**
 * Pin job query options
 */
export type PinJobQuery = {
	sort?: "ASC" | "DSC";
	status?:
		| "prechecking"
		| "retrieving"
		| "expired"
		| "over_free_limit"
		| "over_max_size"
		| "invalid_object"
		| "bad_host_node";
	ipfs_pin_hash?: string;
	limit?: number;
	offset?: number;
};

/**
 * Pin job item
 */
export type PinJobItem = {
	id: string;
	ipfs_pin_hash: string;
	date_queued: string;
	name: string;
	status: string;
	keyvalues: any;
	host_nodes: string[];
	pin_policy: {
		regions: {
			id: string;
			desiredReplicationCount: number;
		}[];
		version: number;
	};
};

/**
 * Pin job response
 */
export type PinJobResponse = {
	rows: PinJobItem[];
};

/**
 * Content type
 */
export type ContentType =
	| "application/json"
	| "application/xml"
	| "text/plain"
	| "text/html"
	| "text/css"
	| "text/javascript"
	| "application/javascript"
	| "image/jpeg"
	| "image/png"
	| "image/gif"
	| "image/svg+xml"
	| "audio/mpeg"
	| "audio/ogg"
	| "video/mp4"
	| "application/pdf"
	| "application/octet-stream"
	| string
	| null;

/**
 * Get CID response
 */
export type GetCIDResponse = {
	data?: JSON | string | Blob | null;
	contentType: ContentType;
};

/**
 * Signed URL options
 */
export type SignedUrlOptions = {
	cid: string;
	date?: number;
	expires: number;
	gateway?: string;
};

/**
 * Analytics query options
 */
export type AnalyticsQuery = {
	gateway_domain: string;
	start_date: string;
	end_date: string;
	cid?: string;
	file_name?: string;
	user_agent?: string;
	country?: string;
	region?: string;
	referer?: string;
	limit?: number;
	sort_order?: "asc" | "desc";
};

/**
 * Top analytics query options
 */
export type TopAnalyticsQuery = AnalyticsQuery & {
	sort_by: "requests" | "bandwidth";
	attribute:
		| "cid"
		| "country"
		| "region"
		| "user_agent"
		| "referer"
		| "file_name";
};

/**
 * Top analytics response
 */
export type TopAnalyticsResponse = {
	data: TopAnalyticsItem[];
};

/**
 * Top analytics item
 */
export type TopAnalyticsItem = {
	value: string;
	requests: number;
	bandwidth: number;
};

/**
 * Time interval analytics query options
 */
export type TimeIntervalAnalyticsQuery = AnalyticsQuery & {
	sort_by?: "requests" | "bandwidth";
	date_interval: "day" | "week";
};

/**
 * Time period item
 */
export type TimePeriodItem = {
	period_start_time: string;
	requests: number;
	bandwidth: number;
};

/**
 * Time interval analytics response
 */
export type TimeIntervalAnalyticsResponse = {
	total_requests: number;
	total_bandwidth: number;
	time_periods: TimePeriodItem[];
};

/**
 * User pinned data response
 */
export type UserPinnedDataResponse = {
	pin_count: number;
	pin_size_total: number;
	pin_size_with_replications_total: number;
};

/**
 * Key permissions
 */
export type KeyPermissions = {
	admin?: boolean;
	endpoints?: Endpoints;
};

/**
 * Endpoints
 */
export type Endpoints = {
	data?: DataEndponts;
	pinning?: PinningEndpoints;
};

/**
 * Data endpoints
 */
export type DataEndponts = {
	pinList?: boolean;
	userPinnedDataTotal?: boolean;
};

/**
 * Pinning endpoints
 */
export type PinningEndpoints = {
	hashMetadata?: boolean;
	hashPinPolicy?: boolean;
	pinByHash?: boolean;
	pinFileToIPFS?: boolean;
	pinJSONToIPFS?: boolean;
	pinJobs?: boolean;
	unpin?: boolean;
	userPinPolicy?: boolean;
};

/**
 * Key options
 */
export type KeyOptions = {
	keyName: string;
	permissions: KeyPermissions;
	maxUses?: number;
};

/**
 * Key response
 */
export type KeyResponse = {
	JWT: string;
	pinata_api_key: string;
	pinata_api_secret: string;
};

/**
 * Key list query options
 */
export type KeyListQuery = {
	revoked?: boolean;
	limitedUse?: boolean;
	exhausted?: boolean;
	name?: string;
	offset?: number;
};

/**
 * Key list item
 */
export type KeyListItem = {
	id: string;
	name: string;
	key: string;
	secret: string;
	max_uses: number;
	uses: number;
	user_id: string;
	scopes: KeyScopes;
	revoked: boolean;
	createdAt: string;
	updatedAt: string;
};

/**
 * Key scopes
 */
type KeyScopes = {
	endpoints: {
		pinning: {
			pinFileToIPFS: boolean;
			pinJSONToIPFS: boolean;
		};
	};
	admin: boolean;
};

/**
 * Key list response
 */
export type KeyListResponse = {
	keys: KeyListItem[];
	count: number;
};

/**
 * Revoke key response
 */
export type RevokeKeyResponse = {
	key: string;
	status: string;
};

/**
 * Group options
 */
export type GroupOptions = {
	name: string;
	isPublic?: boolean;
};

/**
 * Update group options
 */
export type UpdateGroupOptions = {
	groupId: string;
	name?: string;
	isPublic?: boolean;
};

/**
 * Get group options
 */
export type GetGroupOptions = {
	groupId: string;
};

/**
 * Group list response
 */
export type GroupListResponse = {
	groups: GroupResponseItem[];
	next_page_token: string;
};

/**
 * Group response item
 */
export type GroupResponseItem = {
	id: string;
	is_public: boolean;
	name: string;
	createdAt: string;
};

/**
 * Group query options
 */
export type GroupQueryOptions = {
	name?: string;
	limit?: number;
	pageToken?: number;
	isPublic?: boolean;
};

/**
 * Group CID options
 */
export type GroupCIDOptions = {
	groupId: string;
	files: string[];
};

/**
 * Update group files response
 */
export type UpdateGroupFilesResponse = {
	id: string;
	status: string;
};

/**
 * Signature options
 */
export type SignatureOptions = {
	cid: string;
	signature: string;
};

/**
 * Signature response
 */
export type SignatureResponse = {
	cid: string;
	signature: string;
};

/**
 * Swap CID options
 */
export type SwapCidOptions = {
	cid: string;
	swapCid: string;
};

/**
 * Swap history options
 */
export type SwapHistoryOptions = {
	cid: string;
	domain: string;
};

/**
 * Swap CID response
 */
export type SwapCidResponse = {
	mapped_cid: string;
	created_at: string;
};

/**
 * Contains CID response
 */
export type ContainsCIDResponse = {
	containsCid: boolean;
	cid: string | null;
};

/**
 * Vectorize file response
 */
export type VectorizeFileResponse = {
	status: boolean;
};

/**
 * Vectorize query options
 */
export type VectorizeQuery = {
	groupId: string;
	query: string;
	returnFile?: boolean;
};

/**
 * Vector query match
 */
export type VectorQueryMatch = {
	file_id: string;
	cid: string;
	score: number;
};

/**
 * Vectorize query response
 */
export type VectorizeQueryResponse = {
	count: number;
	matches: VectorQueryMatch[];
};

/**
 * Signed upload URL options
 */
export type SignedUploadUrlOptions = {
	date?: number;
	expires: number;
	groupId?: string;
	name?: string;
	keyvalues?: Record<string, string>;
	vectorize?: boolean;
};
