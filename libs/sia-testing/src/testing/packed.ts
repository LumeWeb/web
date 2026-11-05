/** Bounded direct packed simulation; handles carry session authority, never native crypto state. */
import { boundedByteView } from "./byte-view.js";
import { snapshotApplicationMetadata } from "./application-metadata.js";
import type { RequestReceipt } from "./controls.js";
import type { ActorRef, BrowserAccess } from "./types.js";

declare const packedOwnership: unique symbol;
export interface PackedAppKey {
  readonly [packedOwnership]: "packed-key";
}
export interface PackedBackend {
  afterCommit(receipt: RequestReceipt): void;
  authorize(): void;
  before(
    operation: "metadata" | "packed-add" | "packed-finalize" | "pin",
    signal: AbortSignal,
    id?: string,
  ): Promise<RequestReceipt>;
  cleanupError(error: unknown): void;
  metadata(id: string, bytes: Uint8Array): void;
  pin(id: string, signal: AbortSignal): Promise<void>;
  register(close: () => Promise<void>): () => void;
  reserve(): Reservation;
  signal: AbortSignal;
  track<T>(work: () => Promise<T>): Promise<T>;
}
export interface PackedObject {
  id(): string;
  readonly [packedOwnership]: "packed-object";
  /** Validates ownership only; no sealed record or cryptographic proof is produced. */
  seal(key: PackedAppKey): void;
  updateMetadata(metadata: Uint8Array): void;
}
export interface PackedOptions {
  readonly dataShards?: number;
  readonly maxBufferedSlabs?: number;
  readonly parityShards?: number;
}
export interface PackedSdk<P extends "browser" | "node"> {
  appKey(): PackedAppKey;
  close(): Promise<void>;
  pinObject(object: PackedObject): Promise<void>;
  updateObjectMetadata(object: PackedObject): Promise<void>;
  uploadPacked(options?: PackedOptions): PackedUpload<P>;
}
export interface PackedSdkOptions<P extends "browser" | "node"> {
  readonly access: BrowserAccess;
  readonly as: ActorRef;
  readonly maxBytes: number;
  readonly maxObjects: number;
  readonly platform: P;
}
export interface PackedUpload<P extends "browser" | "node"> {
  add(
    stream: ReadableStream<Uint8Array>,
  ): Promise<P extends "node" ? bigint : number>;
  cancel(): void;
  dispose(): Promise<void>;
  finalize(): Promise<PackedObject[]>;
}
interface Reservation {
  release(): void;
  stage(bytes: Uint8Array, signal: AbortSignal): Promise<string>;
}
/** Carries only original objects acknowledged before a later finalization failure. */
export class PackedFinalizeError extends Error {
  readonly objects: readonly PackedObject[];
  constructor(cause: unknown, objects: readonly PackedObject[]) {
    super("Packed finalization partially completed", { cause });
    this.name = "PackedFinalizeError";
    this.objects = Object.freeze([...objects]);
  }
}
const fail = (code: string, message: string) =>
  Object.assign(new Error(message), { code });

export function createPackedSdk<P extends "browser" | "node">(
  options: PackedSdkOptions<P>,
  backend: PackedBackend,
): PackedSdk<P> {
  const abort = new AbortController();
  const signal = AbortSignal.any([abort.signal, backend.signal]);
  const key = Object.freeze(Object.create(null)) as PackedAppKey;
  const objects = new WeakMap<
    PackedObject,
    { id: string; metadata: Uint8Array }
  >();
  const uploads = new Set<PackedUpload<P>>();
  const pending = new Set<Promise<unknown>>();
  const errors: unknown[] = [];
  let closing: Promise<void> | undefined;
  function authorize() {
    signal.throwIfAborted();
    backend.authorize();
  }
  function owned(object: PackedObject) {
    authorize();
    const record = objects.get(object);
    if (!record) throw fail("foreign-handle", "Unknown packed object");
    return record;
  }
  function track<T>(work: () => Promise<T>): Promise<T> {
    const result = Promise.resolve().then(() => backend.track(work));
    pending.add(result);
    void result.then(
      () => pending.delete(result),
      () => pending.delete(result),
    );
    return result;
  }
  async function effect<T>(
    operation: "metadata" | "packed-add" | "packed-finalize" | "pin",
    callSignal: AbortSignal,
    work: () => Promise<T> | T,
    id?: string,
  ) {
    authorize();
    const receipt = await backend.before(operation, callSignal, id);
    try {
      callSignal.throwIfAborted();
      authorize();
      const result = await work();
      receipt.committed = true;
      if (operation === "pin") backend.afterCommit(receipt);
      receipt.status = "completed";
      return result;
    } catch (error) {
      receipt.status = callSignal.aborted ? "cancelled" : "failed";
      throw error;
    }
  }
  const sdk: PackedSdk<P> = {
    appKey() {
      authorize();
      return key;
    },
    close() {
      if (closing) return closing;
      abort.abort();
      closing = (async () => {
        try {
          await Promise.allSettled(
            [...uploads].map((upload) => upload.dispose()),
          );
          await Promise.allSettled([...pending]);
          if (errors.length)
            throw new AggregateError(errors, "Packed source cleanup failed");
        } catch (error) {
          // Run cleanup must retain the failure even if the caller catches close before the run ends.
          backend.cleanupError(error);
          throw error;
        } finally {
          unregister();
        }
      })();
      return closing;
    },
    pinObject(object) {
      return track(async () => {
        const record = owned(object);
        await effect(
          "pin",
          signal,
          () => backend.pin(record.id, signal),
          record.id,
        );
      });
    },
    updateObjectMetadata(object) {
      let bytes: Uint8Array;
      try {
        bytes = new Uint8Array(owned(object).metadata);
      } catch (error) {
        return Promise.resolve().then(() => {
          throw error;
        });
      }
      return track(async () => {
        const record = owned(object);
        await effect(
          "metadata",
          signal,
          () => backend.metadata(record.id, bytes),
          record.id,
        );
      });
    },
    uploadPacked(configuration = {}) {
      authorize();
      if (
        Object.keys(configuration).some(
          (k) =>
            !["dataShards", "maxBufferedSlabs", "parityShards"].includes(k),
        ) ||
        [
          configuration.dataShards,
          configuration.parityShards,
          configuration.maxBufferedSlabs,
        ].some((n) => n !== undefined && (!Number.isSafeInteger(n) || n < 1))
      )
        throw fail("invalid-input", "Unsupported packed configuration");
      const reservation = backend.reserve();
      const cancelled = new AbortController();
      const uploadSignal = AbortSignal.any([signal, cancelled.signal]);
      const inputs: Uint8Array[] = [];
      const failures: unknown[] = [];
      let bytes = 0;
      let busy = false;
      let ended = false;
      let current: Promise<unknown> | undefined;
      let disposal: Promise<void> | undefined;
      function available() {
        authorize();
        uploadSignal.throwIfAborted();
        if (busy) throw fail("busy", "Packed operation is in progress");
        if (ended) throw fail("closed", "Packed upload is finished");
      }
      function run<T>(work: () => Promise<T>): Promise<T> {
        try {
          available();
        } catch (error) {
          return Promise.resolve().then(() => {
            throw error;
          });
        }
        busy = true;
        const result = track(work);
        current = result;
        void result.then(
          () => {
            busy = false;
          },
          () => {
            busy = false;
          },
        );
        return result;
      }
      const upload: PackedUpload<P> = {
        add(stream) {
          return run(async () => {
            if (inputs.length >= options.maxObjects)
              throw fail("limit", "Packed object allowance exceeded");
            const input = await collect(
              stream,
              options.maxBytes - bytes,
              uploadSignal,
              (failure) => {
                if (!failures.includes(failure)) failures.push(failure);
                if (!errors.includes(failure)) errors.push(failure);
              },
            );
            return effect("packed-add", uploadSignal, () => {
              inputs.push(input);
              bytes += input.length;
              return (
                options.platform === "node"
                  ? BigInt(input.length)
                  : input.length
              ) as P extends "node" ? bigint : number;
            });
          });
        },
        cancel() {
          cancelled.abort();
        },
        dispose() {
          if (disposal) return disposal;
          cancelled.abort();
          disposal = (async () => {
            await Promise.allSettled(current ? [current] : []);
            inputs.length = 0;
            ended = true;
            reservation.release();
            uploads.delete(upload);
            if (failures.length)
              throw new AggregateError(
                failures,
                "Packed source cleanup failed",
              );
          })();
          return disposal;
        },
        finalize() {
          return run(async () => {
            ended = true;
            const result: PackedObject[] = [];
            try {
              if (!inputs.length)
                await effect("packed-finalize", uploadSignal, () => undefined);
              for (const input of inputs) {
                await effect("packed-finalize", uploadSignal, async () => {
                  const id = await reservation.stage(input, uploadSignal);
                  const record: { id: string; metadata: Uint8Array } = {
                    id,
                    metadata: new Uint8Array(),
                  };
                  const object = Object.freeze(
                    Object.assign(Object.create(null), {
                      id: () => id,
                      seal(this: PackedObject, selected: PackedAppKey) {
                        if (this !== object)
                          throw fail("foreign-handle", "Unknown packed object");
                        owned(object);
                        if (selected !== key)
                          throw fail(
                            "foreign-handle",
                            "Unknown packed app key",
                          );
                      },
                      updateMetadata(this: PackedObject, metadata: Uint8Array) {
                        if (this !== object)
                          throw fail("foreign-handle", "Unknown packed object");
                        owned(object);
                        record.metadata = snapshotApplicationMetadata(metadata);
                      },
                    }),
                  ) as PackedObject;
                  objects.set(object, record);
                  result.push(object);
                });
              }
              return result;
            } catch (error) {
              if (result.length) throw new PackedFinalizeError(error, result);
              throw error;
            } finally {
              inputs.length = 0;
              reservation.release();
              uploads.delete(upload);
            }
          });
        },
      };
      uploads.add(upload);
      return upload;
    },
  };
  const unregister = backend.register(() => sdk.close());
  return sdk;
}

/** Abort must join reader cancellation so a source cleanup failure is not lost. */
async function collect(
  stream: ReadableStream<Uint8Array>,
  limit: number,
  signal: AbortSignal,
  cleanupError: (error: unknown) => void,
): Promise<Uint8Array> {
  signal.throwIfAborted();
  const reader = stream.getReader();
  let cancellation: Promise<void> | undefined;
  const cancel = () => {
    cancellation ??= reader.cancel(signal.reason);
    void cancellation.catch(() => undefined);
  };
  signal.addEventListener("abort", cancel, { once: true });
  const errors: unknown[] = [];
  let bytes!: Uint8Array;
  let length = 0;
  let complete = false;
  let cancellationFailed = false;
  try {
    // One admitted buffer avoids retaining an allocation for every producer chunk.
    bytes = new Uint8Array(limit);
    for (;;) {
      signal.throwIfAborted();
      const next = await reader.read();
      signal.throwIfAborted();
      if (next.done) break;
      let chunk: Uint8Array;
      try {
        chunk = boundedByteView(next.value, limit - length);
      } catch {
        throw fail("limit", "Packed byte allowance exceeded or invalid chunk");
      }
      bytes.set(chunk, length);
      length += chunk.length;
    }
    complete = true;
  } catch (error) {
    errors.push(error);
  }
  signal.removeEventListener("abort", cancel);
  if (!complete) cancel();
  try {
    await cancellation;
  } catch (error) {
    // An errored reader rejects cancel with the same read error without invoking source cleanup.
    if (!errors.includes(error)) {
      errors.push(error);
      cancellationFailed = true;
    }
  } finally {
    reader.releaseLock();
  }
  if (errors.length) {
    const failure =
      errors.length === 1
        ? errors[0]
        : new AggregateError(
            errors,
            "Packed read and source cancellation failed",
          );
    if (cancellationFailed) cleanupError(failure);
    throw failure;
  }
  return length === bytes.length ? bytes : bytes.slice(0, length);
}
