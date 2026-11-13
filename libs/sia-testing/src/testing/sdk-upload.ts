/** Direct SDK 0.2 upload calls use an owned application port without native encryption or host traffic. */
import { boundedByteView } from "./byte-view.js";
import { bytesFixture } from "./files.js";
import { ownReaderLifetime } from "./reader-lifetime.js";
import type {
  ActorRef,
  ApplicationObject,
  ApplicationPort,
  BrowserAccess,
} from "./types.js";

const fail = (code: string, message: string) =>
  Object.assign(new Error(message), { code });

export interface UploadSdk {
  appKey(): { free(): void; publicKey(): string };
  close(): Promise<void>;
  pinObject(object: MockPinnedObject): Promise<void>;
  upload(
    object: MockPinnedObject,
    source: ReadableStream<Uint8Array>,
    options?: object,
  ): Promise<MockPinnedObject>;
}
export interface UploadSdkOptions {
  readonly access: BrowserAccess;
  readonly as: ActorRef;
  /** Maximum bytes collected from one source before staging it. */
  readonly maxBytes: number;
}

/** A test handle; `free` invalidates this reference but cannot undo a staged upload. */
export class MockPinnedObject {
  private alive = true;
  private readonly identifier: string;
  private value = new Uint8Array();

  constructor(id = crypto.randomUUID().replaceAll("-", "").padEnd(64, "0")) {
    this.identifier = id;
  }
  free(): void {
    this.alive = false;
  }
  id(): string {
    this.check();
    return this.identifier;
  }
  metadata(): Uint8Array {
    this.check();
    return this.value.slice();
  }
  updateMetadata(bytes: Uint8Array): void {
    this.check();
    this.value = new Uint8Array(boundedByteView(bytes, 1024));
  }
  private check(): void {
    if (!this.alive) throw fail("closed", "Object handle has been freed");
  }
}

/** Reuses the run's writer so SDK-shaped calls share its upload and pin fault controls. */
export function createUploadSdk(
  writer: ApplicationPort,
  maxBytes: number,
  publicKey: string,
): UploadSdk {
  const abort = new AbortController();
  const originals = new WeakMap<MockPinnedObject, ApplicationObject>();
  const pending = new Set<Promise<unknown>>();
  let closing: Promise<void> | undefined;
  function open() {
    if (abort.signal.aborted) throw fail("closed", "Upload SDK has closed");
  }
  function track<T>(work: () => Promise<T>): Promise<T> {
    const call = Promise.resolve().then(work);
    pending.add(call);
    void call.then(
      () => pending.delete(call),
      () => pending.delete(call),
    );
    return call;
  }
  return {
    appKey() {
      open();
      let freed = false;
      return {
        free() {
          freed = true;
        },
        publicKey() {
          if (freed) throw fail("closed", "App key has been freed");
          return publicKey;
        },
      };
    },
    close() {
      if (closing) return closing;
      abort.abort();
      closing = (async () => {
        await Promise.allSettled([...pending]);
        await writer.close();
      })();
      return closing;
    },
    pinObject(object) {
      return track(async () => {
        open();
        if (!(object instanceof MockPinnedObject) || !originals.has(object))
          throw fail("foreign-handle", "Unknown uploaded object");
        object.id();
        await writer.pin(originals.get(object)!, {
          metadata: object.metadata(),
          signal: abort.signal,
        });
      });
    },
    upload(draft, source, options) {
      return track(async () => {
        open();
        if (!(draft instanceof MockPinnedObject) || originals.has(draft))
          throw fail("invalid-input", "Upload requires a new object handle");
        if (options && Object.keys(options).length)
          throw fail("unsupported", "Upload options are not simulated");
        const metadata = draft.metadata();
        draft.free();
        const bytes = await collectSource(source, maxBytes, abort.signal);
        const file = await bytesFixture({ bytes, name: "sdk-upload" });
        const original = await writer.upload({
          file,
          metadata,
          signal: abort.signal,
        });
        const object = new MockPinnedObject(original.id);
        object.updateMetadata(metadata);
        originals.set(object, original);
        return object;
      });
    },
  };
}

/** Joins source cancellation before the SDK can finish closing its run-owned writer. */
async function collectSource(
  source: ReadableStream<Uint8Array>,
  limit: number,
  signal: AbortSignal,
): Promise<Uint8Array> {
  signal.throwIfAborted();
  const reader = source.getReader();
  const lifetime = ownReaderLifetime(reader, signal);
  let bytes = new Uint8Array();
  let length = 0;
  let complete = false;
  let error: unknown;
  try {
    for (;;) {
      signal.throwIfAborted();
      let part: ReadableStreamReadResult<Uint8Array>;
      try {
        part = await reader.read();
      } catch (failure) {
        lifetime.readFailed(failure);
        throw failure;
      }
      signal.throwIfAborted();
      if (part.done) break;
      let chunk: Uint8Array;
      try {
        chunk = boundedByteView(part.value, limit - length);
      } catch {
        throw fail(
          "limit",
          "Upload exceeds its byte allowance or has an invalid chunk",
        );
      }
      const needed = length + chunk.length;
      if (needed > bytes.length) {
        const next = new Uint8Array(
          Math.min(limit, Math.max(needed, 1024, bytes.length * 2)),
        );
        next.set(bytes.subarray(0, length));
        bytes = next;
      }
      bytes.set(chunk, length);
      length = needed;
    }
    complete = true;
  } catch (failure) {
    error = failure;
  }
  const cleanup = await lifetime.finish(complete, error);
  if (cleanup.failed && error !== undefined)
    throw new AggregateError(
      [error, cleanup.error],
      "Upload source cleanup failed",
    );
  if (cleanup.failed)
    throw new AggregateError([cleanup.error], "Upload source cleanup failed");
  if (error !== undefined) {
    if (error instanceof Error) throw error;
    throw new Error("Upload source failed", { cause: error });
  }
  return bytes.slice(0, length);
}
