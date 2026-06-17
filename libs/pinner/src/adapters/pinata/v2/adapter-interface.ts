/**
 * Pinata SDK 2.x Adapter Interface
 * Matches Pinata SDK 2.x API exactly
 *
 * Source: https://github.com/PinataCloud/pinata/commit/cdc0c06116aaadaf7c4b287a2673cd23b6ba1125
 * - src/core/classes/index.ts
 * - src/core/pinataSDK.ts
 *
 * Copyright © 2024 Pinata Cloud Technologies
 * Interface definitions adapted from Pinata SDK for compatibility.
 * Original Pinata SDK: https://github.com/PinataCloud/pinata
 */

import type { Pinner } from "@/pinner";
import type {
	PinataConfig,
	UploadResponse,
	UploadOptions,
	UploadCIDOptions,
	PinByCIDResponse,
	SignedUploadUrlOptions,
	FileListItem,
	FileListQuery,
	FileListResponse,
	UpdateFileOptions,
	DeleteResponse,
	PinQueueQuery,
	PinQueueResponse,
	PinQueueItem,
	SwapCidOptions,
	SwapCidResponse,
	SwapHistoryOptions,
	AccessLinkOptions,
	GroupOptions,
	UpdateGroupOptions,
	GetGroupOptions,
	GroupResponseItem,
	GroupListResponse,
	GroupCIDOptions,
	UpdateGroupFilesResponse,
	TopAnalyticsQuery,
	TopAnalyticsResponse,
	TimeIntervalAnalyticsQuery,
	TimeIntervalAnalyticsResponse,
	Network,
} from "./types";

/**
 * Upload builder interface
 */
export interface UploadBuilder<TResult> {
	name(name: string): this;
	keyvalues(keyvalues: Record<string, string>): this;
	execute(): Promise<TResult>;
}

/**
 * Filter files builder interface
 */
export interface FilterFiles {
	name(name: string): FilterFiles;
	group(group: string): FilterFiles;
	cid(cid: string): FilterFiles;
	mimeType(mimeType: string): FilterFiles;
	order(order: "ASC" | "DESC"): FilterFiles;
	limit(limit: number): FilterFiles;
	cidPending(cidPending: boolean): FilterFiles;
	keyvalues(keyvalues: Record<string, string>): FilterFiles;
	noGroup(noGroup: boolean): FilterFiles;
	pageToken(pageToken: string): FilterFiles;
	then(
		onfulfilled?: ((value: FileListResponse) => any) | null,
		onrejected?: ((reason: any) => any) | null,
	): Promise<any>;
	all(): Promise<FileListItem[]>;
	[Symbol.asyncIterator](): AsyncGenerator<FileListItem, void, unknown>;
}

/**
 * Filter queue builder interface
 */
export interface FilterQueue {
	cid(cid: string): FilterQueue;
	status(
		status:
			| "prechecking"
			| "retrieving"
			| "expired"
			| "backfilled"
			| "over_free_limit"
			| "over_max_size"
			| "invalid_object"
			| "bad_host_node",
	): FilterQueue;
	pageLimit(limit: number): FilterQueue;
	pageToken(pageToken: string): FilterQueue;
	sort(sort: "ASC" | "DSC"): FilterQueue;
	then(
		onfulfilled?: ((value: PinQueueResponse) => any) | null,
		onrejected?: ((reason: any) => any) | null,
	): Promise<any>;
	all(): Promise<PinQueueItem[]>;
	[Symbol.asyncIterator](): AsyncGenerator<PinQueueItem, void, unknown>;
}

/**
 * Filter groups builder interface
 */
export interface FilterGroups {
	name(name: string): FilterGroups;
	limit(limit: number): FilterGroups;
	pageToken(pageToken: string): FilterGroups;
	isPublic(isPublic: boolean): FilterGroups;
	then(
		onfulfilled?: ((value: GroupListResponse) => any) | null,
		onrejected?: ((reason: any) => any) | null,
	): Promise<any>;
	all(): Promise<GroupResponseItem[]>;
	[Symbol.asyncIterator](): AsyncGenerator<GroupResponseItem, void, unknown>;
}

/**
 * Public upload interface
 */
export interface PublicUpload {
	file(file: File, options?: UploadOptions): UploadBuilder<UploadResponse>;
	fileArray(files: File[], options?: UploadOptions): UploadBuilder<UploadResponse>;
	base64(base64String: string, options?: UploadOptions): UploadBuilder<UploadResponse>;
	url(url: string, options?: UploadOptions): UploadBuilder<UploadResponse>;
	json(data: object, options?: UploadOptions): UploadBuilder<UploadResponse>;
	cid(cid: string, options?: UploadCIDOptions): UploadBuilder<PinByCIDResponse>;
	createSignedURL(options: SignedUploadUrlOptions): Promise<string>;
}

/**
 * Private upload interface
 */
export interface PrivateUpload {
	file(file: File, options?: UploadOptions): UploadBuilder<UploadResponse>;
	fileArray(files: File[], options?: UploadOptions): UploadBuilder<UploadResponse>;
	base64(base64String: string, options?: UploadOptions): UploadBuilder<UploadResponse>;
	url(url: string, options?: UploadOptions): UploadBuilder<UploadResponse>;
	json(data: object, options?: UploadOptions): UploadBuilder<UploadResponse>;
	cid(cid: string, options?: UploadCIDOptions): UploadBuilder<PinByCIDResponse>;
	createSignedURL(options: SignedUploadUrlOptions): Promise<string>;
}

/**
 * Public files interface
 */
export interface PublicFiles {
	list(): FilterFiles;
	get(id: string): Promise<FileListItem>;
	delete(files: string[]): Promise<DeleteResponse[]>;
	update(options: UpdateFileOptions): Promise<FileListItem>;
	addSwap(options: SwapCidOptions): Promise<SwapCidResponse>;
	getSwapHistory(options: SwapHistoryOptions): Promise<SwapCidResponse[]>;
	deleteSwap(cid: string): Promise<string>;
	queue(): FilterQueue;
	deletePinRequest(requestId: string): Promise<string>;
}

/**
 * Private files interface
 */
export interface PrivateFiles {
	list(): FilterFiles;
	get(id: string): Promise<FileListItem>;
	delete(files: string[]): Promise<DeleteResponse[]>;
	update(options: UpdateFileOptions): Promise<FileListItem>;
	addSwap(options: SwapCidOptions): Promise<SwapCidResponse>;
	getSwapHistory(options: SwapHistoryOptions): Promise<SwapCidResponse[]>;
	deleteSwap(cid: string): Promise<string>;
	queue(): FilterQueue;
	deletePinRequest(requestId: string): Promise<string>;
}

/**
 * Public gateways interface
 */
export interface PublicGateways {
	get(cid: string): any;
	convert(url: string, gatewayPrefix?: string): Promise<string>;
}

/**
 * Private gateways interface
 */
export interface PrivateGateways {
	get(cid: string): any;
	createAccessLink(options: AccessLinkOptions): any;
}

/**
 * Public groups interface
 */
export interface PublicGroups {
	create(options: GroupOptions): Promise<GroupResponseItem>;
	list(): FilterGroups;
	get(options: GetGroupOptions): Promise<GroupResponseItem>;
	addFiles(options: GroupCIDOptions): Promise<UpdateGroupFilesResponse[]>;
	removeFiles(options: GroupCIDOptions): Promise<UpdateGroupFilesResponse[]>;
	update(options: UpdateGroupOptions): Promise<GroupResponseItem>;
	delete(options: GetGroupOptions): Promise<string>;
}

/**
 * Private groups interface
 */
export interface PrivateGroups {
	create(options: GroupOptions): Promise<GroupResponseItem>;
	list(): FilterGroups;
	get(options: GetGroupOptions): Promise<GroupResponseItem>;
	addFiles(options: GroupCIDOptions): Promise<UpdateGroupFilesResponse[]>;
	removeFiles(options: GroupCIDOptions): Promise<UpdateGroupFilesResponse[]>;
	update(options: UpdateGroupOptions): Promise<GroupResponseItem>;
	delete(options: GetGroupOptions): Promise<string>;
}

/**
 * Analytics interface
 */
export interface Analytics {
	requests(query: TopAnalyticsQuery): Promise<TopAnalyticsResponse>;
	bandwidth(query: TimeIntervalAnalyticsQuery): Promise<TimeIntervalAnalyticsResponse>;
}

/**
 * Pinata 2.x Adapter Interface
 * Matches Pinata SDK 2.x API exactly
 */
export interface PinataAdapter {
	/**
	 * Configuration
	 */
	config: PinataConfig;
	/**
	 * Update the adapter configuration
	 */
	updateConfig(newConfig: PinataConfig): void;

	/**
	 * Upload with public/private separation
	 */
	upload: {
		public: PublicUpload;
		private: PrivateUpload;
	};

	/**
	 * Files with public/private separation
	 */
	files: {
		public: PublicFiles;
		private: PrivateFiles;
	};

	/**
	 * Gateways with public/private separation
	 */
	gateways: {
		public: PublicGateways;
		private: PrivateGateways;
	};

	/**
	 * Groups with public/private separation
	 */
	groups: {
		public: PublicGroups;
		private: PrivateGroups;
	};

	/**
	 * Analytics (no public/private)
	 */
	analytics: Analytics;
}


