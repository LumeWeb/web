/**
 * Pinata SDK 2.x Types
 * Source: https://github.com/PinataCloud/pinata/commit/cdc0c06116aaadaf7c4b287a2673cd23b6ba1125
 * - src/core/types/index.ts
 *
 * Copyright © 2024 Pinata Cloud Technologies
 * Type definitions adapted from Pinata SDK for compatibility.
 * Original Pinata SDK: https://github.com/PinataCloud/pinata
 */

/**
 * CID version type
 */
export type CidVersion = "v0" | "v1";

/**
 * Network type
 */
export type Network = "public" | "private";

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
	legacyUploadUrl?: string;
};

/**
 * Pinata metadata
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
	streamable?: boolean;
	peerAddresses?: string[];
	car?: boolean;
	cid_version?: CidVersion;
};

/**
 * Upload response
 */
export type UploadResponse = {
	id: string;
	name: string;
	cid: string;
	size: number;
	created_at: string;
	number_of_files: number;
	mime_type: string;
	group_id: string | null;
	keyvalues: Record<string, string>;
	vectorized: boolean;
	network: string;
};

/**
 * Upload CID options
 */
export type UploadCIDOptions = {
	metadata?: PinataMetadata;
	peerAddresses?: string[];
	keys?: string;
	groupId?: string;
};

/**
 * Pin by CID response
 */
export type PinByCIDResponse = {
	id: string;
	cid: string;
	date_queued: string;
	name: string;
	status: string;
	keyvalues: Record<string, any> | null;
	host_nodes: string[] | null;
	group_id: string | null;
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
	maxFileSize?: number;
	mimeTypes?: string[];
	streamable?: boolean;
	car?: boolean;
	cid_version?: CidVersion;
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
 * File list query
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
 * Update file options
 */
export type UpdateFileOptions = {
	id: string;
	name?: string;
	keyvalues?: Record<string, string>;
};

/**
 * Delete response
 */
export type DeleteResponse = {
	id: string;
	status: string;
};

/**
 * Pin queue item
 */
export type PinQueueItem = {
	id: string;
	cid?: string;
	ipfs_pin_hash?: string;
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
 * Pin queue query
 */
export type PinQueueQuery = {
	sort?: "ASC" | "DSC";
	status?:
		| "prechecking"
		| "retrieving"
		| "expired"
		| "backfilled"
		| "over_free_limit"
		| "over_max_size"
		| "invalid_object"
		| "bad_host_node";
	cid?: string;
	limit?: number;
	pageToken?: string;
};

/**
 * Pin queue response
 */
export type PinQueueResponse = {
	jobs: PinQueueItem[];
	next_page_token: string;
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
 * Access link options
 */
export type AccessLinkOptions = {
	cid: string;
	date?: number;
	expires: number;
	gateway?: string;
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
 * Group response item
 */
export type GroupResponseItem = {
	id: string;
	is_public: boolean;
	name: string;
	createdAt: string;
};

/**
 * Group list response
 */
export type GroupListResponse = {
	groups: GroupResponseItem[];
	next_page_token: string;
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
 * Analytics query
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
 * Top analytics query
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
 * Time interval analytics query
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
