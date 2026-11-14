/** Packs a Uppy batch into shared slabs and pins each resulting object under the borrowed account. */
import type { PinnedObject } from "@siafoundation/sia-storage/wasm";
import {
  SiaUploadCancelledError,
  type SiaUploadResult,
  SiaUploadUncertainError,
  type SiaWriteOptions,
  type UploadAccess,
} from "./sia-upload.ts";

export interface PackedBatchFile {
  readonly file: File;
  readonly isCurrent: () => boolean;
  readonly metadata?: SiaWriteOptions["metadata"];
  readonly onProgress?: SiaWriteOptions["onProgress"];
  readonly signal: AbortSignal;
}

export type PackedBatchOutcome =
  | { readonly error: unknown; readonly result?: never }
  | { readonly error?: never; readonly result: SiaUploadResult };

export async function uploadPackedBatch(
  access: UploadAccess,
  files: readonly PackedBatchFile[],
): Promise<PackedBatchOutcome[]> {
  if (files.length === 0) return [];
  const sessionId = access.getSnapshot().activeSessionId;
  if (!sessionId) throw new Error("A Sia account is required to upload");
  return access.withSession(async (sdk) => {
    if (access.getSnapshot().activeSessionId !== sessionId)
      throw new Error("The Sia account changed before the write started");
    const { encodedSize } = await import("@siafoundation/sia-storage/wasm");
    const outcomes: (PackedBatchOutcome | undefined)[] = files.map(
      () => undefined,
    );
    const metadataByIndex = new Map<number, Uint8Array>();
    const added: number[] = [];
    const totalSize = files.reduce((sum, entry) => sum + entry.file.size, 0);
    let bytesTotal = totalSize > 0 ? encodedSize(totalSize, 10, 20) : 0;
    const seen = new Set<string>();
    let bytesUploaded = 0;
    let finalized = false;
    const reportProgress = () => {
      for (const index of added) {
        const entry = files[index]!;
        if (entry.signal.aborted || !entry.isCurrent()) continue;
        try {
          entry.onProgress?.({
            bytesTotal,
            bytesUploaded: Math.min(bytesTotal, bytesUploaded),
          });
        } catch {
          // A progress callback cannot change the outcome of a remote write.
        }
      }
    };
    const packed = sdk.uploadPacked({
      dataShards: 10,
      onShardUploaded(shard) {
        if (finalized || access.getSnapshot().activeSessionId !== sessionId)
          return;
        const identity = `${shard.slabIndex}:${shard.shardIndex}`;
        if (seen.has(identity)) return;
        seen.add(identity);
        bytesUploaded += shard.shardSize;
        if (added.length) reportProgress();
      },
      parityShards: 20,
    });
    let objects: PinnedObject[] = [];
    const abortIfAllStopped = () => {
      if (
        finalized ||
        !files.every(({ isCurrent, signal }) => signal.aborted || !isCurrent())
      )
        return;
      try {
        packed.cancel();
      } catch {
        // A failed native cancel must not throw from the browser's abort event; stopped files still skip pinning.
      }
    };
    for (const { signal } of files)
      signal.addEventListener("abort", abortIfAllStopped);
    try {
      for (const [index, entry] of files.entries()) {
        if (entry.signal.aborted || !entry.isCurrent()) {
          outcomes[index] = { error: new SiaUploadCancelledError() };
          continue;
        }
        if (access.getSnapshot().activeSessionId !== sessionId) {
          outcomes[index] = {
            error: new Error(
              "The Sia account changed during this upload batch",
            ),
          };
          continue;
        }
        if (entry.file.size === 0) {
          outcomes[index] = {
            error: new RangeError("Empty files cannot be pinned to Sia"),
          };
          continue;
        }
        try {
          const metadata = (await entry.metadata?.(entry.file))?.slice();
          if (entry.signal.aborted || !entry.isCurrent())
            throw new SiaUploadCancelledError();
          if (access.getSnapshot().activeSessionId !== sessionId)
            throw new Error("The Sia account changed during this upload batch");
          await packed.add(entry.file.stream());
          added.push(index);
          if (
            bytesUploaded &&
            access.getSnapshot().activeSessionId === sessionId
          )
            reportProgress();
          if (metadata) metadataByIndex.set(index, metadata);
        } catch (error) {
          outcomes[index] = { error };
        }
      }
      if (added.length) {
        // A failed add can leave padding in a slab; length() includes it in the encoding total.
        bytesTotal = encodedSize(packed.length(), 10, 20);
        if (bytesUploaded && access.getSnapshot().activeSessionId === sessionId)
          reportProgress();
        try {
          objects = await packed.finalize();
          finalized = true;
          if (objects.length !== added.length)
            throw new Error(
              "Packed upload returned a different number of objects than files added",
            );
        } catch (error) {
          finalized = true;
          for (const index of added) outcomes[index] = { error };
        }
      }
      if (objects.length === added.length && added.length) {
        for (const [ordinal, index] of added.entries()) {
          const entry = files[index]!;
          const object = objects[ordinal]!;
          let pinStarted = false;
          let objectId: string | undefined;
          try {
            if (entry.signal.aborted || !entry.isCurrent())
              throw new SiaUploadCancelledError();
            if (access.getSnapshot().activeSessionId !== sessionId)
              throw new Error(
                "The Sia account changed during this upload batch",
              );
            objectId = object.id();
            const metadata = metadataByIndex.get(index);
            if (metadata) {
              object.updateMetadata(metadata);
              await sdk.updateObjectMetadata(object);
            }
            if (entry.signal.aborted || !entry.isCurrent())
              throw new SiaUploadCancelledError();
            if (access.getSnapshot().activeSessionId !== sessionId)
              throw new Error(
                "The Sia account changed during this upload batch",
              );
            pinStarted = true;
            await sdk.pinObject(object);
            if (
              entry.signal.aborted ||
              !entry.isCurrent() ||
              access.getSnapshot().activeSessionId !== sessionId
            )
              throw new SiaUploadUncertainError(objectId);
            outcomes[index] = { result: { objectId } };
          } catch (error) {
            outcomes[index] = {
              error:
                pinStarted && !(error instanceof SiaUploadUncertainError)
                  ? new SiaUploadUncertainError(objectId)
                  : error,
            };
          }
        }
      }
    } finally {
      for (const { signal } of files)
        signal.removeEventListener("abort", abortIfAllStopped);
      let cleanupError: unknown;
      for (const object of objects) {
        try {
          object.free();
        } catch (error) {
          cleanupError ??= error;
        }
      }
      try {
        packed.free();
      } catch (error) {
        cleanupError ??= error;
      }
      if (cleanupError) {
        for (const [index, outcome] of outcomes.entries()) {
          if (outcome?.result)
            outcomes[index] = {
              error: new SiaUploadUncertainError(outcome.result.objectId),
            };
          else if (!outcome && added.includes(index))
            outcomes[index] = { error: cleanupError };
        }
      }
    }
    return files.map(
      (_, index) => outcomes[index] ?? { error: new SiaUploadCancelledError() },
    );
  });
}
