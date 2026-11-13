/** Uploads and pins a file through an app-owned account borrow without owning the SDK. */
import type { SiaAccess } from "@lumeweb/sia-app-access";
import type { SiaSession } from "@lumeweb/sia-app-access/sia";

/** Completed encoded shard bytes; parity and padding make the total differ from File.size. */
export interface SiaUploadProgress {
  readonly bytesTotal: number;
  readonly bytesUploaded: number;
}

export interface SiaUploadResult {
  readonly objectId: string;
}

export interface SiaWriteOptions {
  readonly metadata?: (file: File) => Promise<Uint8Array> | Uint8Array;
  readonly onProgress?: (progress: SiaUploadProgress) => void;
  readonly signal?: AbortSignal;
}

export type UploadAccess = Pick<
  SiaAccess<SiaSession>,
  "getSnapshot" | "withSession"
>;

export class SiaUploadCancelledError extends Error {
  constructor() {
    super("Upload cancelled before the object pin started");
    this.name = "SiaUploadCancelledError";
  }
}

export class SiaUploadUncertainError extends Error {
  readonly objectId: string | undefined;

  constructor(objectId?: string) {
    super(
      "The remote write may have completed. Check the account before retrying or deleting.",
    );
    this.name = "SiaUploadUncertainError";
    this.objectId = objectId;
  }
}

/** An acknowledged pin means indexd committed the object; listing can still lag. */
export async function uploadToSia(
  access: UploadAccess,
  file: File,
  options: SiaWriteOptions = {},
): Promise<SiaUploadResult> {
  const sessionId = access.getSnapshot().activeSessionId;
  if (!sessionId) throw new Error("A Sia account is required to upload");
  // indexd rejects objects with no slabs, which an empty stream cannot produce.
  if (file.size === 0)
    throw new RangeError("Empty files cannot be pinned to Sia");
  if (options.signal?.aborted) throw new SiaUploadCancelledError();

  return access.withSession(async (sdk) => {
    if (options.signal?.aborted) throw new SiaUploadCancelledError();
    if (access.getSnapshot().activeSessionId !== sessionId)
      throw new Error("The Sia account changed before the write started");

    // The released Sia app adapter initializes WASM before admitting this SDK.
    const { encodedSize, PinnedObject } =
      await import("@siafoundation/sia-storage/wasm");
    const metadata = await options.metadata?.(file);
    if (options.signal?.aborted) throw new SiaUploadCancelledError();
    if (access.getSnapshot().activeSessionId !== sessionId)
      throw new Error("The Sia account changed before the write started");

    const draft = new PinnedObject();
    let transferred = false;
    let pinStarted = false;
    let uploaded: typeof draft | undefined;
    let objectId: string | undefined;
    let failed = false;
    let failure: unknown;
    let result: SiaUploadResult | undefined;
    try {
      if (metadata) draft.updateMetadata(metadata);
      if (options.signal?.aborted) throw new SiaUploadCancelledError();
      const source = file.stream();
      // WASM consumes draft when upload is called, including when its promise rejects.
      const onProgress = options.onProgress;
      if (onProgress) {
        const dataShards = 10;
        const parityShards = 20;
        const bytesTotal = encodedSize(file.size, dataShards, parityShards);
        const uploadedShards = new Set<string>();
        let bytesUploaded = 0;
        transferred = true;
        uploaded = await sdk.upload(draft, source, {
          dataShards,
          onShardUploaded: (shard) => {
            if (
              options.signal?.aborted ||
              access.getSnapshot().activeSessionId !== sessionId
            )
              return;
            const identity = `${shard.slabIndex}:${shard.shardIndex}`;
            // A shard can be uploaded again if its first host loses the slab.
            if (uploadedShards.has(identity)) return;
            uploadedShards.add(identity);
            bytesUploaded = Math.min(
              bytesTotal,
              bytesUploaded + shard.shardSize,
            );
            try {
              onProgress({ bytesTotal, bytesUploaded });
            } catch {
              // Reporting cannot change whether a remote upload committed.
            }
          },
          parityShards,
        });
      } else {
        transferred = true;
        uploaded = await sdk.upload(draft, source);
      }
      objectId = uploaded.id();
      if (options.signal?.aborted) throw new SiaUploadCancelledError();
      if (access.getSnapshot().activeSessionId !== sessionId)
        throw new Error("The Sia account changed before pin started");
      pinStarted = true;
      await sdk.pinObject(uploaded);
      if (
        options.signal?.aborted ||
        access.getSnapshot().activeSessionId !== sessionId
      )
        throw new SiaUploadUncertainError(objectId);
      result = { objectId };
    } catch (error) {
      failed = true;
      failure =
        pinStarted && !(error instanceof SiaUploadUncertainError)
          ? new SiaUploadUncertainError(objectId)
          : error;
    }
    try {
      uploaded?.free();
      if (!transferred) draft.free();
    } catch (error) {
      // Cleanup cannot turn an unknown pin outcome into a known failure.
      if (!failed) {
        failed = true;
        failure = pinStarted ? new SiaUploadUncertainError(objectId) : error;
      }
    }
    if (failed) throw failure;
    if (!result) throw new SiaUploadUncertainError(objectId);
    return result;
  });
}
