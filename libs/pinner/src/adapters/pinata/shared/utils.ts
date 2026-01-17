/**
 * Shared utilities for Pinata adapters
 */

import { CID } from "multiformats/cid";

/**
 * Parse CID string to CID object
 */
export function parseCID(cidString: string): CID {
	try {
		return CID.parse(cidString);
	} catch (error) {
		throw new Error(`Invalid CID: ${cidString}`);
	}
}

/**
 * Convert Date to ISO string
 */
export function toISOString(date: Date): string {
	return date.toISOString();
}

/**
 * Create upload response object
 */
export function createUploadResponse(
	result: {
		cid: string;
		size: number;
		createdAt: Date;
	},
	name?: string,
): any {
	return {
		id: result.cid,
		name: name || "",
		cid: result.cid,
		size: result.size,
		created_at: result.createdAt.toISOString(),
		number_of_files: 1,
		mime_type: "application/octet-stream",
		user_id: "",
		group_id: null,
		is_duplicate: null,
		vectorized: null,
	};
}

/**
 * Create file list item from remote pin
 */
export function createFileListItem(
	remotePin: any,
): any {
	return {
		id: remotePin.cid.toString(),
		name: remotePin.name || null,
		cid: remotePin.cid.toString(),
		size: remotePin.size || 0,
		number_of_files: 1,
		mime_type: "application/octet-stream",
		keyvalues: remotePin.metadata || {},
		group_id: null,
		created_at: remotePin.created.toISOString(),
	};
}

/**
 * Create pin job item from remote pin
 */
export function createPinJobItem(
	remotePin: any,
): any {
	return {
		id: remotePin.cid.toString(),
		ipfs_pin_hash: remotePin.cid.toString(),
		date_queued: remotePin.created.toISOString(),
		name: remotePin.name || "",
		status: remotePin.status || "pinned",
		keyvalues: remotePin.metadata || {},
		host_nodes: [],
		pin_policy: {
			regions: [],
			version: 1,
		},
	};
}

/**
 * Throw error for unsupported features
 */
export function notSupported(feature: string): never {
	throw new Error(`${feature} are not supported by Pinner`);
}
