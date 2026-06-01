/**
 * Pinata SDK 1.x Legacy Adapter
 * Provides compatibility with Pinata SDK 1.x API
 *
 * Source: https://github.com/PinataCloud/pinata/commit/c141177ff3036e46fa7b95fcc68c159b58817836
 * - src/core/pinataSDK.ts
 * - src/core/types.ts
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
	FileListResponse,
	FileListQuery,
	PinJobResponse,
	PinJobQuery,
	DeleteResponse,
	PinataMetadata,
	SignedUrlOptions,
	TopAnalyticsQuery,
	TopAnalyticsResponse,
	TimeIntervalAnalyticsQuery,
	TimeIntervalAnalyticsResponse,
	SwapCidOptions,
	SwapCidResponse,
	SwapHistoryOptions,
} from "../shared/types";
import { parseCID, createUploadResponse, createFileListItem, createPinJobItem, notSupported } from "../shared/utils";
import { DEFAULT_GATEWAY } from "@/types/constants";

/**
 * Pinata 1.x Legacy Adapter Interface
 * Matches Pinata SDK 1.x API exactly
 */
export interface PinataLegacyAdapter {
	/**
	 * Upload a file to IPFS
	 */
	pinFileToIPFS(file: File, options?: UploadOptions): Promise<UploadResponse>;

	/**
	 * Upload JSON data to IPFS
	 */
	pinJSONToIPFS(data: any, options?: UploadOptions): Promise<UploadResponse>;

	/**
	 * Pin content by CID
	 */
	pinByHash(cid: string, options?: UploadOptions): Promise<UploadResponse>;

	/**
	 * List pinned files
	 */
	pinList(query?: FileListQuery): Promise<FileListResponse>;

	/**
	 * Unpin content by CID
	 */
	unpin(cid: string): Promise<{ message: string }>;

	/**
	 * Update pin metadata
	 */
	hashMetadata(cid: string, metadata: Record<string, string>): Promise<{ message: string }>;

	/**
	 * Create signed URL for private IPFS files
	 */
	createSignedURL(options: SignedUrlOptions): Promise<string>;

	/**
	 * Get pin jobs
	 */
	pinJobs(query?: PinJobQuery): Promise<PinJobResponse>;

	/**
	 * Get top usage analytics
	 */
	topUsageAnalytics(query: TopAnalyticsQuery): Promise<TopAnalyticsResponse>;

	/**
	 * Get date interval analytics
	 */
	dateIntervalAnalytics(
		query: TimeIntervalAnalyticsQuery,
	): Promise<TimeIntervalAnalyticsResponse>;

	/**
	 * Swap CID
	 */
	swapCid(options: SwapCidOptions): Promise<SwapCidResponse>;

	/**
	 * Get swap history
	 */
	swapHistory(options: SwapHistoryOptions): Promise<SwapCidResponse[]>;
}

/**
 * Create Pinata 1.x Legacy Adapter
 *
 * @param pinner - Pinner client instance
 * @param config - Pinata configuration
 * @returns PinataLegacyAdapter
 */
export function pinataLegacyAdapter(
	pinner: Pinner,
	config?: PinataConfig,
): PinataLegacyAdapter {
	return {
		/**
		 * Pin a file to IPFS
		 */
		async pinFileToIPFS(
			file: File,
			options?: UploadOptions,
		): Promise<UploadResponse> {
			const result = await pinner.uploadAndWait(file, {
				name: options?.metadata?.name,
				keyvalues: options?.metadata?.keyvalues,
			});

			if (!result.cid) {
				throw new Error("Upload result has no CID yet — use waitForOperation() to poll for the CID");
			}

			return createUploadResponse({ cid: result.cid, size: result.size, createdAt: result.createdAt }, file.name);
		},

		/**
		 * Pin JSON data to IPFS
		 */
		async pinJSONToIPFS(
			data: any,
			options?: UploadOptions,
		): Promise<UploadResponse> {
			// Convert JSON to File
			const jsonString = JSON.stringify(data);
			const file = new File(
				[jsonString],
				options?.metadata?.name || "data.json",
				{ type: "application/json" },
			);

			const result = await pinner.uploadAndWait(file, {
				name: options?.metadata?.name,
				keyvalues: options?.metadata?.keyvalues,
			});

			if (!result.cid) {
				throw new Error("Upload result has no CID yet — use waitForOperation() to poll for the CID");
			}

			return createUploadResponse({ cid: result.cid, size: result.size, createdAt: result.createdAt }, file.name);
		},

		/**
		 * Pin content by CID
		 */
		async pinByHash(
			cid: string,
			options?: UploadOptions,
		): Promise<UploadResponse> {
			const cidObj = parseCID(cid);
			const generator = await pinner.pinByHash(cidObj, {
				name: options?.metadata?.name,
				metadata: options?.metadata?.keyvalues,
			});

			for await (const _ of generator) {
				// Wait for pin to complete
			}

			const pin = await pinner.getPinStatus(cidObj);
			return createUploadResponse(
				{
					cid: pin.cid.toString(),
					size: pin.size || 0,
					createdAt: pin.created,
				},
				pin.name || "",
			);
		},

		/**
		 * List pinned files
		 */
		async pinList(query?: FileListQuery): Promise<FileListResponse> {
			const pins = await pinner.listPins({
				limit: query?.limit,
			});

			return {
				files: pins.map(createFileListItem),
				next_page_token: "",
			};
		},

		/**
		 * Unpin content
		 */
		async unpin(cid: string): Promise<{ message: string }> {
			await pinner.unpin(cid);
			return { message: `Unpinned ${cid}` };
		},

		/**
		 * Update pin metadata
		 */
		async hashMetadata(
			cid: string,
			metadata: Record<string, string>,
		): Promise<{ message: string }> {
			await pinner.setPinMetadata(cid, metadata);
			return { message: `Updated metadata for ${cid}` };
		},

		/**
		 * Create signed URL (not fully supported in Pinner)
		 * Returns a gateway URL instead
		 */
		async createSignedURL(options: SignedUrlOptions): Promise<string> {
			// Pinner doesn't support signed URLs for private files
			// Return a gateway URL as fallback
			const gateway = config?.pinataGateway || DEFAULT_GATEWAY;
			return `${gateway}/ipfs/${options.cid}`;
		},

		/**
		 * Get pin jobs
		 */
		async pinJobs(query?: PinJobQuery): Promise<PinJobResponse> {
			const pins = await pinner.listPins({
				limit: query?.limit,
			});

			return {
				rows: pins.map(createPinJobItem),
			};
		},

		/**
		 * Get top usage analytics (not supported in Pinner)
		 * Returns empty data
		 */
		async topUsageAnalytics(
			query: TopAnalyticsQuery,
		): Promise<TopAnalyticsResponse> {
			// Pinner doesn't support analytics
			return {
				data: [],
			};
		},

		/**
		 * Get date interval analytics (not supported in Pinner)
		 * Returns empty data
		 */
		async dateIntervalAnalytics(
			query: TimeIntervalAnalyticsQuery,
		): Promise<TimeIntervalAnalyticsResponse> {
			// Pinner doesn't support analytics
			return {
				total_requests: 0,
				total_bandwidth: 0,
				time_periods: [],
			};
		},

		/**
		 * Swap CID (not supported in Pinner)
		 * Returns error
		 */
		async swapCid(options: SwapCidOptions): Promise<SwapCidResponse> {
			notSupported("Swap CID");
		},

		/**
		 * Get swap history (not supported in Pinner)
		 * Returns empty array
		 */
		async swapHistory(options: SwapHistoryOptions): Promise<SwapCidResponse[]> {
			// Pinner doesn't support swaps
			return [];
		},
	};
}
