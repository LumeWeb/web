/**
 * Pinata SDK 2.x Adapter Implementation
 * Provides compatibility with Pinata SDK 2.x API
 *
 * Source: https://github.com/PinataCloud/pinata/commit/cdc0c06116aaadaf7c4b287a2673cd23b6ba1125
 * - src/core/pinataSDK.ts
 * - src/core/types/index.ts
 * - src/core/classes/index.ts
 *
 * Copyright © 2024 Pinata Cloud Technologies
 * Type definitions and API interfaces adapted from Pinata SDK for compatibility.
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
	SwapCidOptions,
	SwapCidResponse,
	SwapHistoryOptions,
	AccessLinkOptions,
	GroupOptions,
	UpdateGroupOptions,
	GetGroupOptions,
	GroupResponseItem,
	GroupCIDOptions,
	UpdateGroupFilesResponse,
	TopAnalyticsQuery,
	TopAnalyticsResponse,
	TimeIntervalAnalyticsQuery,
	TimeIntervalAnalyticsResponse,
} from "./types";
import type {
	PinataAdapter,
	PublicUpload,
	PrivateUpload,
	PublicFiles,
	PrivateFiles,
	PublicGateways,
	PrivateGateways,
	PublicGroups,
	PrivateGroups,
	Analytics,
	UploadBuilder,
	FilterFiles,
	FilterQueue,
	FilterGroups,
} from "./adapter-interface";
import { parseCID, notSupported } from "../shared/utils";
import { DEFAULT_GATEWAY } from "@/types/constants";

/**
 * Implementation of UploadBuilder
 */
class UploadBuilderImpl<TResult> implements UploadBuilder<TResult> {
	private _name?: string;
	private _keyvalues?: Record<string, string>;

	constructor(
		private pinner: Pinner,
		private executeFn: (name?: string, keyvalues?: Record<string, string>) => Promise<TResult>,
	) {}

	name(name: string): this {
		this._name = name;
		return this;
	}

	keyvalues(keyvalues: Record<string, string>): this {
		this._keyvalues = keyvalues;
		return this;
	}

	async execute(): Promise<TResult> {
		return this.executeFn(this._name, this._keyvalues);
	}
}

/**
 * Implementation of FilterFiles
 */
class FilterFilesImpl implements FilterFiles {
	private query: FileListQuery = {};
	private currentPageToken: string | undefined;
	private privacy: "public" | "private";

	constructor(
		private pinner: Pinner,
		privacy: "public" | "private",
	) {
		this.privacy = privacy;
	}

	name(name: string): FilterFiles {
		this.query.name = name;
		return this;
	}

	group(group: string): FilterFiles {
		this.query.group = group;
		return this;
	}

	cid(cid: string): FilterFiles {
		this.query.cid = cid;
		return this;
	}

	mimeType(mimeType: string): FilterFiles {
		this.query.mimeType = mimeType;
		return this;
	}

	order(order: "ASC" | "DESC"): FilterFiles {
		this.query.order = order;
		return this;
	}

	limit(limit: number): FilterFiles {
		this.query.limit = limit;
		return this;
	}

	cidPending(cidPending: boolean): FilterFiles {
		this.query.cidPending = cidPending;
		return this;
	}

	keyvalues(keyvalues: Record<string, string>): FilterFiles {
		this.query.metadata = keyvalues;
		return this;
	}

	noGroup(noGroup: boolean): FilterFiles {
		this.query.noGroup = noGroup;
		return this;
	}

	pageToken(pageToken: string): FilterFiles {
		this.query.pageToken = Number.parseInt(pageToken, 10);
		return this;
	}

	then(
		onfulfilled?: ((value: FileListResponse) => any) | null,
		onrejected?: ((reason: any) => any) | null,
	): Promise<any> {
		return this.fetchPage().then(onfulfilled, onrejected);
	}

	private async fetchPage(): Promise<FileListResponse> {
		const pins = await this.pinner.listPins({
			limit: this.query.limit,
		});

		return {
			files: pins.map((pin) => ({
				id: pin.cid.toString(),
				name: pin.name || null,
				cid: pin.cid.toString(),
				size: pin.size || 0,
				number_of_files: 1,
				mime_type: "application/octet-stream",
				keyvalues: pin.metadata || {},
				group_id: null,
				created_at: pin.created.toISOString(),
			})),
			next_page_token: this.currentPageToken || "",
		};
	}

	async *[Symbol.asyncIterator](): AsyncGenerator<FileListItem, void, unknown> {
		while (true) {
			const items = await this.fetchPage();
			for (const item of items.files) {
				yield item;
			}
			if (!this.currentPageToken) {
				break;
			}
		}
	}

	async all(): Promise<FileListItem[]> {
		const allItems: FileListItem[] = [];
		for await (const item of this) {
			allItems.push(item);
		}
		return allItems;
	}
}

/**
 * Implementation of FilterQueue
 */
class FilterQueueImpl implements FilterQueue {
	private query: PinQueueQuery = {};
	private currentPageToken: string | undefined;

	constructor(private pinner: Pinner) {}

	cid(cid: string): FilterQueue {
		this.query.cid = cid;
		return this;
	}

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
	): FilterQueue {
		this.query.status = status;
		return this;
	}

	pageLimit(limit: number): FilterQueue {
		this.query.limit = limit;
		return this;
	}

	pageToken(pageToken: string): FilterQueue {
		this.query.pageToken = pageToken;
		return this;
	}

	sort(sort: "ASC" | "DSC"): FilterQueue {
		this.query.sort = sort;
		return this;
	}

	then(
		onfulfilled?: ((value: PinQueueResponse) => any) | null,
		onrejected?: ((reason: any) => any) | null,
	): Promise<any> {
		return this.fetchPage().then(onfulfilled, onrejected);
	}

	private async fetchPage(): Promise<PinQueueResponse> {
		const pins = await this.pinner.listPins({
			limit: this.query.limit,
		});

		return {
			jobs: pins.map((pin) => ({
				id: pin.cid.toString(),
				cid: pin.cid.toString(),
				date_queued: pin.created.toISOString(),
				name: pin.name || "",
				status: pin.status || "pinned",
				keyvalues: pin.metadata || {},
				host_nodes: [],
				pin_policy: {
					regions: [],
					version: 1,
				},
			})),
			next_page_token: this.currentPageToken || "",
		};
	}

	async *[Symbol.asyncIterator](): AsyncGenerator<
		import("./types").PinQueueItem,
		void,
		unknown
	> {
		while (true) {
			const items = await this.fetchPage();
			for (const item of items.jobs) {
				yield item;
			}
			if (!this.currentPageToken) {
				break;
			}
		}
	}

	async all(): Promise<import("./types").PinQueueItem[]> {
		const allItems: import("./types").PinQueueItem[] = [];
		for await (const item of this) {
			allItems.push(item);
		}
		return allItems;
	}
}

/**
 * Implementation of FilterGroups
 */
class FilterGroupsImpl implements FilterGroups {
	private currentPageToken: string | undefined;
	private privacy: "public" | "private";

	constructor(private pinner: Pinner, privacy: "public" | "private") {
		this.privacy = privacy;
	}

	name(name: string): FilterGroups {
		// Pinner doesn't support groups, return empty
		return this;
	}

	limit(limit: number): FilterGroups {
		return this;
	}

	pageToken(pageToken: string): FilterGroups {
		this.currentPageToken = pageToken;
		return this;
	}

	isPublic(isPublic: boolean): FilterGroups {
		return this;
	}

	then(
		onfulfilled?: ((value: import("./types").GroupListResponse) => any) | null,
		onrejected?: ((reason: any) => any) | null,
	): Promise<any> {
		return this.fetchPage().then(onfulfilled, onrejected);
	}

	private async fetchPage(): Promise<import("./types").GroupListResponse> {
		// Pinner doesn't support groups
		return {
			groups: [],
			next_page_token: this.currentPageToken || "",
		};
	}

	async *[Symbol.asyncIterator](): AsyncGenerator<GroupResponseItem, void, unknown> {
		const items = await this.fetchPage();
		for (const item of items.groups) {
			yield item;
		}
	}

	async all(): Promise<GroupResponseItem[]> {
		const allItems: GroupResponseItem[] = [];
		for await (const item of this) {
			allItems.push(item);
		}
		return allItems;
	}
}

/**
 * Implementation of PublicUpload
 */
class PublicUploadImpl implements PublicUpload {
	constructor(
		private pinner: Pinner,
		private config?: PinataConfig,
	) {}

	file(file: File, options?: UploadOptions): UploadBuilder<UploadResponse> {
		return new UploadBuilderImpl(this.pinner, async (name, keyvalues) => {
			const result = await this.pinner.uploadAndWait(file, {
				name: name || options?.metadata?.name,
				keyvalues: keyvalues || options?.metadata?.keyvalues,
			});

			return {
				id: result.cid,
				name: file.name,
				cid: result.cid,
				size: result.size,
				created_at: result.createdAt.toISOString(),
				number_of_files: 1,
				mime_type: file.type || "application/octet-stream",
				group_id: null,
				keyvalues: keyvalues || options?.metadata?.keyvalues || {},
				vectorized: false,
				network: "public",
			};
		});
	}

	fileArray(
		files: File[],
		options?: UploadOptions,
	): UploadBuilder<UploadResponse> {
		return new UploadBuilderImpl(this.pinner, async (name, keyvalues) => {
			const operation = await this.pinner.uploadDirectory(files, {
				name: name || options?.metadata?.name,
				keyvalues: keyvalues || options?.metadata?.keyvalues,
			});
			const result = await operation.result;

			return {
				id: result.cid,
				name: name || options?.metadata?.name || "directory",
				cid: result.cid,
				size: result.size,
				created_at: result.createdAt.toISOString(),
				number_of_files: files.length,
				mime_type: "application/octet-stream",
				group_id: null,
				keyvalues: keyvalues || options?.metadata?.keyvalues || {},
				vectorized: false,
				network: "public",
			};
		});
	}

	base64(
		base64String: string,
		options?: UploadOptions,
	): UploadBuilder<UploadResponse> {
		return new UploadBuilderImpl(this.pinner, async (name, keyvalues) => {
			// Convert base64 to file
			const binaryString = atob(base64String);
			const bytes = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				bytes[i] = binaryString.charCodeAt(i);
			}
			const blob = new Blob([bytes], {
				type: "application/octet-stream",
			});
			const file = new File(
				[blob],
				name || options?.metadata?.name || "file.bin",
				{ type: "application/octet-stream" },
			);

			const result = await this.pinner.uploadAndWait(file, {
				name: name || options?.metadata?.name,
				keyvalues: keyvalues || options?.metadata?.keyvalues,
			});

			return {
				id: result.cid,
				name: file.name,
				cid: result.cid,
				size: result.size,
				created_at: result.createdAt.toISOString(),
				number_of_files: 1,
				mime_type: "application/octet-stream",
				group_id: null,
				keyvalues: keyvalues || options?.metadata?.keyvalues || {},
				vectorized: false,
				network: "public",
			};
		});
	}

	url(url: string, options?: UploadOptions): UploadBuilder<UploadResponse> {
		return new UploadBuilderImpl(this.pinner, async () => {
			notSupported("URL upload");
		});
	}

	json(data: object, options?: UploadOptions): UploadBuilder<UploadResponse> {
		return new UploadBuilderImpl(this.pinner, async (name, keyvalues) => {
			const jsonString = JSON.stringify(data);
			const file = new File(
				[jsonString],
				name || options?.metadata?.name || "data.json",
				{ type: "application/json" },
			);

			const result = await this.pinner.uploadAndWait(file, {
				name: name || options?.metadata?.name,
				keyvalues: keyvalues || options?.metadata?.keyvalues,
			});

			return {
				id: result.cid,
				name: file.name,
				cid: result.cid,
				size: result.size,
				created_at: result.createdAt.toISOString(),
				number_of_files: 1,
				mime_type: "application/json",
				group_id: null,
				keyvalues: keyvalues || options?.metadata?.keyvalues || {},
				vectorized: false,
				network: "public",
			};
		});
	}

	cid(cid: string, options?: UploadCIDOptions): UploadBuilder<PinByCIDResponse> {
		return new UploadBuilderImpl(this.pinner, async () => {
			const cidObj = parseCID(cid);
			const generator = await this.pinner.pinByHash(cidObj, {
				name: options?.metadata?.name,
				metadata: options?.metadata?.keyvalues,
			});

			for await (const _ of generator) {
				// Wait for pin to complete
			}

			return {
				id: cid,
				cid: cid,
				date_queued: new Date().toISOString(),
				name: options?.metadata?.name || "",
				status: "pinned",
				keyvalues: options?.metadata?.keyvalues || null,
				host_nodes: null,
				group_id: options?.groupId || null,
			};
		});
	}

	async createSignedURL(
		options: SignedUploadUrlOptions,
	): Promise<string> {
		notSupported("Signed upload URLs");
	}
}

/**
 * Implementation of PrivateUpload
 */
class PrivateUploadImpl implements PrivateUpload {
	constructor(
		private pinner: Pinner,
		private config?: PinataConfig,
	) {}

	file(file: File, options?: UploadOptions): UploadBuilder<UploadResponse> {
		return new UploadBuilderImpl(this.pinner, async () => {
			notSupported("Private upload");
		});
	}

	fileArray(
		files: File[],
		options?: UploadOptions,
	): UploadBuilder<UploadResponse> {
		return new UploadBuilderImpl(this.pinner, async () => {
			notSupported("Private upload");
		});
	}

	base64(
		base64String: string,
		options?: UploadOptions,
	): UploadBuilder<UploadResponse> {
		return new UploadBuilderImpl(this.pinner, async () => {
			notSupported("Private upload");
		});
	}

	url(url: string, options?: UploadOptions): UploadBuilder<UploadResponse> {
		return new UploadBuilderImpl(this.pinner, async () => {
			notSupported("Private upload");
		});
	}

	json(data: object, options?: UploadOptions): UploadBuilder<UploadResponse> {
		return new UploadBuilderImpl(this.pinner, async () => {
			notSupported("Private upload");
		});
	}

	cid(cid: string, options?: UploadCIDOptions): UploadBuilder<PinByCIDResponse> {
		return new UploadBuilderImpl(this.pinner, async () => {
			notSupported("Private upload");
		});
	}

	async createSignedURL(
		options: SignedUploadUrlOptions,
	): Promise<string> {
		notSupported("Private upload");
	}
}

/**
 * Implementation of PublicFiles
 */
class PublicFilesImpl implements PublicFiles {
	constructor(
		private pinner: Pinner,
		private config?: PinataConfig,
	) {}

	list(): FilterFiles {
		return new FilterFilesImpl(this.pinner, "public");
	}

	async get(id: string): Promise<FileListItem> {
		const cidObj = parseCID(id);
		const pin = await this.pinner.getPinStatus(cidObj);

		return {
			id: pin.cid.toString(),
			name: pin.name || null,
			cid: pin.cid.toString(),
			size: pin.size || 0,
			number_of_files: 1,
			mime_type: "application/octet-stream",
			keyvalues: pin.metadata || {},
			group_id: null,
			created_at: pin.created.toISOString(),
		};
	}

	async delete(files: string[]): Promise<DeleteResponse[]> {
		const results: DeleteResponse[] = [];
		for (const file of files) {
			await this.pinner.unpin(file);
			results.push({ id: file, status: "deleted" });
		}
		return results;
	}

	async update(options: UpdateFileOptions): Promise<FileListItem> {
		await this.pinner.setPinMetadata(options.id, options.keyvalues || {});

		const pin = await this.pinner.getPinStatus(parseCID(options.id));
		return {
			id: pin.cid.toString(),
			name: pin.name || null,
			cid: pin.cid.toString(),
			size: pin.size || 0,
			number_of_files: 1,
			mime_type: "application/octet-stream",
			keyvalues: pin.metadata || {},
			group_id: null,
			created_at: pin.created.toISOString(),
		};
	}

	async addSwap(options: SwapCidOptions): Promise<SwapCidResponse> {
		notSupported("Swap CID");
	}

	async getSwapHistory(
		options: SwapHistoryOptions,
	): Promise<SwapCidResponse[]> {
		return [];
	}

	async deleteSwap(cid: string): Promise<string> {
		notSupported("Swap CID");
	}

	queue(): FilterQueue {
		return new FilterQueueImpl(this.pinner);
	}

	async deletePinRequest(requestId: string): Promise<string> {
		// Delete pin by request ID (not CID)
		await this.pinner.unpinByRequestId(requestId);
		return requestId;
	}
}

/**
 * Implementation of PrivateFiles
 */
class PrivateFilesImpl implements PrivateFiles {
	constructor(
		private pinner: Pinner,
		private config?: PinataConfig,
	) {}

	list(): FilterFiles {
		notSupported("Private files");
	}

	async get(id: string): Promise<FileListItem> {
		notSupported("Private files");
	}

	async delete(files: string[]): Promise<DeleteResponse[]> {
		notSupported("Private files");
	}

	async update(options: UpdateFileOptions): Promise<FileListItem> {
		notSupported("Private files");
	}

	async addSwap(options: SwapCidOptions): Promise<SwapCidResponse> {
		notSupported("Private files");
	}

	async getSwapHistory(
		options: SwapHistoryOptions,
	): Promise<SwapCidResponse[]> {
		notSupported("Private files");
	}

	async deleteSwap(cid: string): Promise<string> {
		notSupported("Private files");
	}

	queue(): FilterQueue {
		notSupported("Private files");
	}

	async deletePinRequest(requestId: string): Promise<string> {
		notSupported("Private files");
	}
}

/**
 * Implementation of PublicGateways
 */
class PublicGatewaysImpl implements PublicGateways {
	constructor(
		private pinner: Pinner,
		private config?: PinataConfig,
	) {}

	get(cid: string): any {
		// Return an object that can be used to fetch CID
		return {
			cid,
			gateway: this.config?.pinataGateway || DEFAULT_GATEWAY,
			url: `${this.config?.pinataGateway || DEFAULT_GATEWAY}/ipfs/${cid}`,
		};
	}

	async convert(
		url: string,
		gatewayPrefix?: string,
	): Promise<string> {
		// Convert IPFS URL to gateway URL
		const gateway = gatewayPrefix || this.config?.pinataGateway || DEFAULT_GATEWAY;
		return url.replace("ipfs://", `${gateway}/ipfs/`);
	}
}

/**
 * Implementation of PrivateGateways
 */
class PrivateGatewaysImpl implements PrivateGateways {
	constructor(
		private pinner: Pinner,
		private config?: PinataConfig,
	) {}

	get(cid: string): any {
		notSupported("Private gateways");
	}

	createAccessLink(options: AccessLinkOptions): any {
		notSupported("Private gateways");
	}
}

/**
 * Implementation of PublicGroups
 */
class PublicGroupsImpl implements PublicGroups {
	constructor(
		private pinner: Pinner,
		private config?: PinataConfig,
	) {}

	async create(options: GroupOptions): Promise<GroupResponseItem> {
		notSupported("Groups");
	}

	list(): FilterGroups {
		return new FilterGroupsImpl(this.pinner, "public");
	}

	async get(options: GetGroupOptions): Promise<GroupResponseItem> {
		notSupported("Groups");
	}

	async addFiles(
		options: GroupCIDOptions,
	): Promise<UpdateGroupFilesResponse[]> {
		notSupported("Groups");
	}

	async removeFiles(
		options: GroupCIDOptions,
	): Promise<UpdateGroupFilesResponse[]> {
		notSupported("Groups");
	}

	async update(options: UpdateGroupOptions): Promise<GroupResponseItem> {
		notSupported("Groups");
	}

	async delete(options: GetGroupOptions): Promise<string> {
		notSupported("Groups");
	}
}

/**
 * Implementation of PrivateGroups
 */
class PrivateGroupsImpl implements PrivateGroups {
	constructor(
		private pinner: Pinner,
		private config?: PinataConfig,
	) {}

	async create(options: GroupOptions): Promise<GroupResponseItem> {
		notSupported("Private groups");
	}

	list(): FilterGroups {
		notSupported("Private groups");
	}

	async get(options: GetGroupOptions): Promise<GroupResponseItem> {
		notSupported("Private groups");
	}

	async addFiles(
		options: GroupCIDOptions,
	): Promise<UpdateGroupFilesResponse[]> {
		notSupported("Private groups");
	}

	async removeFiles(
		options: GroupCIDOptions,
	): Promise<UpdateGroupFilesResponse[]> {
		notSupported("Private groups");
	}

	async update(options: UpdateGroupOptions): Promise<GroupResponseItem> {
		notSupported("Private groups");
	}

	async delete(options: GetGroupOptions): Promise<string> {
		notSupported("Private groups");
	}
}

/**
 * Implementation of Analytics
 */
class AnalyticsImpl implements Analytics {
	async requests(query: TopAnalyticsQuery): Promise<TopAnalyticsResponse> {
		// Pinner doesn't support analytics
		return {
			data: [],
		};
	}

	async bandwidth(
		query: TimeIntervalAnalyticsQuery,
	): Promise<TimeIntervalAnalyticsResponse> {
		// Pinner doesn't support analytics
		return {
			total_requests: 0,
			total_bandwidth: 0,
			time_periods: [],
		};
	}
}

/**
 * Create Pinata Adapter
 *
 * @param pinner - Pinner client instance
 * @param config - Pinata configuration
 * @returns PinataAdapter
 */
export function pinataAdapter(
	pinner: Pinner,
	config?: PinataConfig,
): PinataAdapter {
	const effectiveConfig: PinataConfig = config || {};

	return {
		config: effectiveConfig,
		updateConfig(newConfig: PinataConfig): void {
			Object.assign(effectiveConfig, newConfig);
		},

		upload: {
			public: new PublicUploadImpl(pinner, effectiveConfig),
			private: new PrivateUploadImpl(pinner, effectiveConfig),
		},

		files: {
			public: new PublicFilesImpl(pinner, effectiveConfig),
			private: new PrivateFilesImpl(pinner, effectiveConfig),
		},

		gateways: {
			public: new PublicGatewaysImpl(pinner, effectiveConfig),
			private: new PrivateGatewaysImpl(pinner, effectiveConfig),
		},

		groups: {
			public: new PublicGroupsImpl(pinner, effectiveConfig),
			private: new PrivateGroupsImpl(pinner, effectiveConfig),
		},

		analytics: new AnalyticsImpl(),
	};
}

// Re-export interface
export type { PinataAdapter } from "./adapter-interface";
