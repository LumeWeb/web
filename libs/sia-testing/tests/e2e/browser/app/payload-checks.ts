/** Named payload operations keep WASM objects within each call's lifetime. */
import {
  type AppMetadata,
  Builder,
  openStreams,
  PinnedObject,
  type Sdk,
  SharedSdk,
  type UploadOptions,
} from "@siafoundation/sia-storage";
import {
  readBytes as read,
  byteSource as source,
} from "../../support/byte-streams.js";
import { browserPackedCancel } from "./packed-cancel.js";

export interface BytesResult {
  bytes: number[];
}
export interface MetadataResult extends BytesResult {
  metadata: string;
}
export interface PayloadConnection {
  appMeta: AppMetadata;
  indexerUrl: string;
}

export function payloadChecks(sdk: Sdk, connection: PayloadConnection) {
  const pinned = <T>(
    bytes: readonly number[],
    run: (
      object: PinnedObject,
      own: (object: PinnedObject) => PinnedObject,
      upload: (
        object: PinnedObject,
        bytes: readonly number[],
        options?: UploadOptions,
      ) => Promise<PinnedObject>,
    ) => Promise<T>,
  ) =>
    withPinnedObjects(sdk, async ({ own, upload }) => {
      const uploaded = await upload(own(new PinnedObject()), bytes);
      await sdk.pinObject(uploaded);
      return run(own(await sdk.object(uploaded.id())), own, upload);
    });
  return {
    appendAndRead(
      bytes: readonly number[],
      suffix: readonly number[],
    ): Promise<BytesResult> {
      return pinned(bytes, async (object, own, upload) => {
        const changed = await upload(object, suffix);
        await sdk.pinObject(changed);
        return { bytes: await read(sdk, own(await sdk.object(changed.id()))) };
      });
    },
    async cancelPackedUpload(
      bufferedBytes: number[],
    ): Promise<{ addRejected: boolean; finalizeError: string | undefined }> {
      const { addRejected, finalizeError } = await browserPackedCancel(
        sdk,
        bufferedBytes,
      );
      return { addRejected, finalizeError };
    },
    overwriteAndRead(
      bytes: readonly number[],
      patch: readonly number[],
      startOffset: bigint,
    ): Promise<BytesResult> {
      return pinned(bytes, async (object, own, upload) => {
        const changed = await upload(object, patch, { startOffset });
        await sdk.pinObject(changed);
        return { bytes: await read(sdk, own(await sdk.object(changed.id()))) };
      });
    },
    readPinnedRange(
      bytes: readonly number[],
      range: { length: number; offset: number },
    ): Promise<BytesResult> {
      return pinned(bytes, async (object) => ({
        bytes: await read(sdk, object, range),
      }));
    },
    readSignedShareUrl(
      bytes: readonly number[],
      options: { expiresAtMs: number; metadata: string },
    ): Promise<MetadataResult> {
      return pinned(bytes, async (object, own) => {
        object.updateMetadata(new TextEncoder().encode(options.metadata));
        await sdk.updateObjectMetadata(object);
        const url = sdk.objectShareUrl(object, new Date(options.expiresAtMs));
        const shared = own(await sdk.objectFromShareUrl(url));
        return {
          bytes: await read(sdk, shared),
          metadata: new TextDecoder().decode(shared.metadata()),
        };
      });
    },
    reconnectAndRead(bytes: readonly number[]): Promise<BytesResult> {
      return pinned(bytes, async (object, own) => {
        const key = sdk.appKey();
        let builder: Builder | undefined;
        let connected: null | Sdk | undefined;
        return preservingFailure(
          async () => {
            builder = new Builder(connection.indexerUrl, connection.appMeta);
            connected = await builder.connected(key);
            if (!connected) throw new Error("App key did not reconnect");
            const retrieved = own(await connected.object(object.id()));
            return { bytes: await read(connected, retrieved) };
          },
          () =>
            releaseAll([
              () => connected?.free(),
              () => builder?.free(),
              () => key.free(),
            ]),
        );
      });
    },
    revokeAndReadRetained(
      bytes: readonly number[],
    ): Promise<
      BytesResult & { bytesAfterRevocation: number[]; revoked: boolean }
    > {
      return pinned(bytes, async (object, own) => {
        const key = await sdk.createSharingKey("payload handoff");
        let shared: SharedSdk | undefined;
        return preservingFailure(
          async () => {
            await sdk.shareObject(key, object);
            shared = await SharedSdk.connect(connection.indexerUrl, key.seed());
            const sharedObject = own(await shared.object(object.id()));
            const bytes = await read(shared, sharedObject);
            await sdk.revokeSharingKey(key);
            let revoked = false;
            try {
              await shared.stats();
            } catch (error) {
              if (!String(error).includes("401")) throw error;
              revoked = true;
            }
            const bytesAfterRevocation = await read(shared, sharedObject);
            return { bytes, bytesAfterRevocation, revoked };
          },
          () => releaseAll([() => shared?.free(), () => key.free()]),
        );
      });
    },
    streamRange(
      bytes: readonly number[],
      rangeHeader: string,
    ): Promise<
      BytesResult & {
        contentRange: null | string;
        status: number;
        streamed: boolean;
        workerPath: null | string;
      }
    > {
      return pinned(bytes, async (object) => {
        const streams = openStreams(sdk, connection);
        let file: Awaited<ReturnType<typeof streams.url>> | undefined;
        return preservingFailure(
          async () => {
            file = await streams.url(object, {
              name: "range.bin",
              type: "application/octet-stream",
            });
            const response = await fetch(file.url, {
              headers: { Range: rangeHeader },
            });
            const bytes = [...new Uint8Array(await response.arrayBuffer())];
            return {
              bytes,
              contentRange: response.headers.get("Content-Range"),
              status: response.status,
              streamed: file.url.startsWith(location.origin),
              workerPath: navigator.serviceWorker.controller
                ? new URL(navigator.serviceWorker.controller.scriptURL).pathname
                : null,
            };
          },
          () => releaseAll([() => file?.release(), () => streams.close()]),
        );
      });
    },
    truncateAndRead(
      bytes: readonly number[],
      size: bigint,
    ): Promise<BytesResult> {
      return pinned(bytes, async (object, own) => {
        const changed = own(object.truncate(size));
        await sdk.pinObject(changed);
        return { bytes: await read(sdk, own(await sdk.object(changed.id()))) };
      });
    },
    updateMetadataAndRead(
      bytes: readonly number[],
      metadata: string,
    ): Promise<MetadataResult> {
      return pinned(bytes, async (object, own) => {
        object.updateMetadata(new TextEncoder().encode(metadata));
        await sdk.updateObjectMetadata(object);
        const updated = own(await sdk.object(object.id()));
        return {
          bytes: await read(sdk, updated),
          metadata: new TextDecoder().decode(updated.metadata()),
        };
      });
    },
    updateUploadedMetadata(
      bytes: readonly number[],
      metadata: string,
    ): Promise<{ metadata: string; rejectedBeforePin: boolean }> {
      return withPinnedObjects(sdk, async ({ own, upload }) => {
        const uploaded = await upload(own(new PinnedObject()), bytes);
        let rejectedBeforePin = false;
        try {
          await sdk.updateObjectMetadata(uploaded);
        } catch {
          rejectedBeforePin = true;
        }
        await sdk.pinObject(uploaded);
        uploaded.updateMetadata(new TextEncoder().encode(metadata));
        await sdk.updateObjectMetadata(uploaded);
        const fetched = own(await sdk.object(uploaded.id()));
        return {
          metadata: new TextDecoder().decode(fetched.metadata()),
          rejectedBeforePin,
        };
      });
    },
    uploadAndRead(
      bytes: readonly number[],
      metadata: string,
    ): Promise<MetadataResult> {
      return withPinnedObjects(sdk, async ({ own, upload }) => {
        const input = own(new PinnedObject());
        input.updateMetadata(new TextEncoder().encode(metadata));
        const uploaded = await upload(input, bytes);
        await sdk.pinObject(uploaded);
        const fetched = own(await sdk.object(uploaded.id()));
        return {
          bytes: await read(sdk, fetched),
          metadata: new TextDecoder().decode(fetched.metadata()),
        };
      });
    },
    async uploadFailingSource(): Promise<{
      rejected: boolean;
      sourceError: boolean;
    }> {
      let rejected = false,
        sourceError = false;
      try {
        await sdk.upload(
          new PinnedObject(),
          new ReadableStream({
            start(controller) {
              controller.error(new Error("intentional source failure"));
            },
          }),
        );
      } catch (error) {
        rejected = true;
        sourceError = String(error).includes("intentional source failure");
      }
      return { rejected, sourceError };
    },
    uploadPackedAndRead(
      parts: readonly (readonly number[])[],
    ): Promise<{ bytes: number[][] }> {
      return withPinnedObjects(sdk, async ({ own }) => {
        const packed = sdk.uploadPacked();
        let finalized = false;
        try {
          for (const part of parts) await packed.add(source(part));
          // finalize consumes the WASM handle before its promise settles.
          finalized = true;
          const objects = await packed.finalize();
          for (const object of objects) own(object);
          const bytes: number[][] = [];
          for (const object of objects) {
            await sdk.pinObject(object);
            const fetched = own(await sdk.object(object.id()));
            bytes.push(await read(sdk, fetched));
          }
          return { bytes };
        } catch (error) {
          if (!finalized) {
            try {
              packed.free();
            } catch {
              /* Keep the add error when releasing its failed upload also fails. */
            }
          }
          throw error;
        }
      });
    },
  };
}

/** An operation error remains first when teardown also fails. */
export async function preservingFailure<T>(
  run: () => Promise<T>,
  cleanup: () => void,
): Promise<T> {
  let outcome: { error: unknown; ok: false } | { ok: true; value: T };
  try {
    outcome = { ok: true, value: await run() };
  } catch (error) {
    outcome = { error, ok: false };
  }
  let cleanupFailure: undefined | { error: unknown };
  try {
    cleanup();
  } catch (error) {
    cleanupFailure = { error };
  }
  if (!outcome.ok) {
    if (cleanupFailure)
      throw new AggregateError(
        [outcome.error, cleanupFailure.error],
        "Browser operation and cleanup failed",
        { cause: outcome.error },
      );
    throw outcome.error;
  }
  if (cleanupFailure) throw cleanupFailure.error;
  return outcome.value;
}

/** Detach ownership before calling this so a failed release cannot be retried. */
export function releaseAll(releases: readonly (() => void)[]) {
  const failures: unknown[] = [];
  for (const release of releases) {
    try {
      release();
    } catch (error) {
      failures.push(error);
    }
  }
  if (failures.length)
    throw new AggregateError(failures, "Browser owned releases failed");
}

/** Upload consumes its input even on rejection; only live object handles may be freed. */
export async function withPinnedObjects<T>(
  sdk: Pick<Sdk, "upload">,
  run: (objects: {
    own: (object: PinnedObject) => PinnedObject;
    upload: (
      object: PinnedObject,
      bytes: readonly number[],
      options?: UploadOptions,
    ) => Promise<PinnedObject>;
  }) => Promise<T>,
): Promise<T> {
  const handles = new Set<PinnedObject>();
  const own = (object: PinnedObject) => {
    handles.add(object);
    return object;
  };
  let outcome: { error: unknown; ok: false } | { ok: true; value: T };
  try {
    const value = await run({
      own,
      async upload(object, bytes, options) {
        // WASM consumes the input before the upload promise settles, including rejection.
        handles.delete(object);
        return own(await sdk.upload(object, source(bytes), options));
      },
    });
    outcome = { ok: true, value };
  } catch (error) {
    outcome = { error, ok: false };
  }
  const errors: unknown[] = [];
  for (const object of handles) {
    try {
      object.free();
    } catch (error) {
      errors.push(error);
    }
  }
  if (!outcome.ok) {
    if (errors.length)
      throw new AggregateError(
        [outcome.error, ...errors],
        "Object operation and cleanup failed",
        { cause: outcome.error },
      );
    throw outcome.error;
  }
  if (errors.length) throw new AggregateError(errors, "Object cleanup failed");
  return outcome.value;
}
