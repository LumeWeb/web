/** In-process payload mocks for app tests; no Sia encryption or host protocols are performed. */
import {
  createIndexdModel,
  type IndexdModel,
  type SlabPinTracker,
} from "../model/index.js";
import {
  createControls,
  type MockControl,
  type MockOperation,
  type MockRequest,
} from "./control.js";
export type {
  MockConditions,
  MockControl,
  MockOperation,
  MockRequest,
  MockSelector,
} from "./control.js";

import {
  createMockObject,
  type MockObject,
  nonnegativeInteger,
} from "./object.js";
export { createMockObject, type MockObject, type MockSlab } from "./object.js";
export { createRemoteMockSdk, type RemoteMockSdkOptions } from "./remote.js";
import {
  type PayloadStore as BufferedPayloadStore,
  payloadIsCurrent,
  payloadSlabId,
  readNetworkState,
  serializeNetworkState,
} from "./state.js";

import {
  createBufferedPayloadOwner,
  type FinishedPayload,
  type PayloadOwner,
  type PayloadReader,
} from "./payload-store.js";

export interface MockCallOptions {
  signal?: AbortSignal;
}
export interface MockDownloadOptions extends MockCallOptions {
  length?: number;
  maxBufferedChunks?: number;
  offset?: number;
}
export interface MockNetwork {
  control: MockControl;
  createSdk(options: { accountId: string; device?: string }): LocalMockSdk;
  discardUpload(accountId: string, id: string): void;
  model: IndexdModel;
  seedObject(accountId: string, id: string, bytes: Uint8Array): MockObject;
  serialize(): string;
}

export interface MockSdk {
  deleteObject(id: string, options?: MockCallOptions): Promise<void>;
  download(
    object: Pick<MockObject, "id">,
    options?: MockDownloadOptions,
  ): Promise<ReadableStream<Uint8Array>>;
  object(id: string, options?: MockCallOptions): Promise<MockObject>;
  pinObject(
    object: Pick<MockObject, "id">,
    options?: MockCallOptions,
  ): Promise<void>;
  pruneSlabs(options?: MockCallOptions): Promise<void>;
  upload(
    bytes: Uint8Array,
    options: MockCallOptions & { id: string },
  ): Promise<MockObject>;
}

export interface PayloadNetwork extends Omit<
  MockNetwork,
  "createSdk" | "discardUpload"
> {
  closeDownload(stream: ReadableStream<Uint8Array>): Promise<void>;
  createSdk(options: { accountId: string; device?: string }): PayloadSdk;
  discardUpload(accountId: string, id: string): Promise<void>;
  downloadDone(stream: ReadableStream<Uint8Array>): Promise<void>;
  drain(): Promise<void>;
}

export interface PayloadSdk extends LocalMockSdk {
  uploadPayload(
    token: FinishedPayload,
    options: MockCallOptions & { id: string; prepareCommit?: () => () => void },
  ): Promise<MockObject>;
}

/** Mutation completion shares the in-process model effect and cannot run atomically over Fetch. */
interface LocalMockSdk extends Omit<
  MockSdk,
  "deleteObject" | "pinObject" | "upload"
> {
  deleteObject(
    id: string,
    options?: MockCallOptions & {
      /** Checks ownership before the effect and returns a nonthrowing completion. */
      prepareCommit?: () => () => void;
    },
  ): Promise<void>;
  pinObject(
    object: Pick<MockObject, "id">,
    options?: MockCallOptions & {
      /** Checks ownership before the effect and returns a nonthrowing completion. */
      prepareCommit?: () => () => void;
    },
  ): Promise<void>;
  upload(
    bytes: Uint8Array,
    options: MockCallOptions & {
      id: string;
      /** Checks ownership before staging and returns a nonthrowing completion. */
      prepareCommit?: () => () => void;
    },
  ): Promise<MockObject>;
}

interface StoredPayload {
  identity: symbol;
  slabId: string;
  token: FinishedPayload;
}

/** Shares payloads between SDK clients while the supplied model owns account and pin rules. */
export function createMockNetwork(
  options: {
    chunkBytes?: number;
    model?: IndexdModel;
    now?: () => Date;
    requestLimit?: number;
    state?: string;
  } = {},
): MockNetwork {
  const network = createMockNetworkWithPayloadOwner(options);
  return {
    control: network.control,
    createSdk(options) {
      const sdk = network.createSdk(options);
      return {
        deleteObject: (...args) => sdk.deleteObject(...args),
        download: (...args) => sdk.download(...args),
        object: (...args) => sdk.object(...args),
        pinObject: (...args) => sdk.pinObject(...args),
        pruneSlabs: (...args) => sdk.pruneSlabs(...args),
        upload: (...args) => sdk.upload(...args),
      };
    },
    discardUpload(accountId, id) {
      void network.discardUpload(accountId, id);
    },
    model: network.model,
    seedObject: network.seedObject,
    serialize: network.serialize,
  };
}

/** Construction-time selection is private; portable callers always receive buffered storage. */
export function createMockNetworkWithPayloadOwner(
  options: Parameters<typeof createMockNetwork>[0] = {},
  suppliedOwner?: PayloadOwner & { readonly kind: "temporary-files" },
): PayloadNetwork {
  const buffered = createBufferedPayloadOwner();
  const owner = suppliedOwner ?? buffered;
  if (suppliedOwner && options.state !== undefined)
    throw new Error("Cannot restore disk payloads");
  if (
    options.model &&
    (options.state !== undefined || options.now !== undefined)
  )
    throw new Error(
      "snapshot and clock options cannot replace a supplied model",
    );
  const saved =
    options.state === undefined
      ? undefined
      : readNetworkState(options.state, options.now);
  const model =
    saved?.model ??
    options.model ??
    createIndexdModel(options.now ? { now: options.now } : {});
  const controls = createControls(options.requestLimit ?? 256);
  const chunkBytes = options.chunkBytes ?? 64 * 1024;
  if (!Number.isSafeInteger(chunkBytes) || chunkBytes < 1)
    throw new Error("chunkBytes must be a positive safe integer");
  const payloads = new Map<string, Map<string, StoredPayload>>();
  for (const [accountId, records] of saved?.payloads ?? []) {
    payloads.set(
      accountId,
      new Map(
        Array.from(records, ([id, record]) => [
          id,
          {
            identity: record.identity,
            slabId: record.slabId,
            token: buffered.finish(record.bytes),
          },
        ]),
      ),
    );
  }
  const downloadOwners = new WeakMap<
    ReadableStream<Uint8Array>,
    { close(): Promise<void>; done: Promise<void> }
  >();
  const payloadsByPin = new Map<string, Map<symbol, Set<string>>>();
  // Recreating empty trackers would accumulate weak model observers until GC runs.
  const retirementTrackers = new Map<string, SlabPinTracker>();
  for (const [accountId, owned] of payloads)
    for (const [id, record] of owned)
      indexPayload(accountId, id, record.identity);

  /** An object's slab can outlive its object record while another packed object uses it. */
  function indexPayload(accountId: string, id: string, identity: symbol): void {
    let pins = payloadsByPin.get(accountId);
    if (!pins) {
      pins = new Map();
      payloadsByPin.set(accountId, pins);
    }
    let ids = pins.get(identity);
    if (!ids) {
      ids = new Set();
      pins.set(identity, ids);
      let tracker = retirementTrackers.get(accountId);
      if (!tracker) {
        tracker = model.trackSlabPins(accountId);
        retirementTrackers.set(accountId, tracker);
      }
      tracker.watch(identity);
    }
    ids.add(id);
  }

  /** Empty index buckets must release retired identities as well as the cached bytes. */
  function forgetPayload(
    accountId: string,
    id: string,
    retired: Promise<void>[] = [],
  ): void {
    const owned = payloads.get(accountId);
    const record = owned?.get(id);
    if (!record) return;
    const retirement = owner.retire(record.token);
    retired.push(retirement);
    void retirement.catch(() => undefined);
    owned!.delete(id);
    const pins = payloadsByPin.get(accountId)!;
    const ids = pins.get(record.identity)!;
    ids.delete(id);
    if (ids.size === 0) {
      pins.delete(record.identity);
      retirementTrackers.get(accountId)!.forget(record.identity);
    }
    if (pins.size === 0) payloadsByPin.delete(accountId);
  }

  function payload(
    accountId: string,
    id: string,
    retired: Promise<void>[] = [],
  ) {
    model.accountStats(accountId);
    const record = payloads.get(accountId)?.get(id);
    if (!record) throw new Error(`payload ${id} not found`);
    // Model resets and externally pruned slabs must also invalidate retained handles.
    if (!payloadIsCurrent(model, accountId, record)) {
      forgetPayload(accountId, id, retired);
      throw new Error(`payload ${id} not found`);
    }
    return record;
  }

  /** A sibling deletion can retire the pin of a payload whose object was deleted earlier. */
  function discardStalePayloads(
    accountId: string,
    identities: Iterable<symbol>,
    retired: Promise<void>[],
  ): void {
    const pins = payloadsByPin.get(accountId);
    const owned = payloads.get(accountId);
    for (const identity of identities) {
      const ids = pins?.get(identity);
      if (!ids) continue;
      const record = owned!.get(ids.values().next().value!)!;
      if (payloadIsCurrent(model, accountId, record)) continue;
      for (const id of ids) forgetPayload(accountId, id, retired);
    }
  }

  function upload(
    accountId: string,
    id: string,
    token: FinishedPayload,
    retired: Promise<void>[] = [],
  ): MockObject {
    model.accountStats(accountId);
    const object = createMockObject(id, token.length);
    let owned = payloads.get(accountId);
    if (owned?.has(id)) {
      const prior = owned.get(id)!;
      if (payloadIsCurrent(model, accountId, prior))
        throw new Error(`payload ${id} already exists`);
    }
    const slabId = payloadSlabId(accountId, id);
    const adopt = owner.prepareAdoption(token);
    model.pinSlab(accountId, { id: slabId, size: token.length });
    if (!owned) {
      owned = new Map();
      payloads.set(accountId, owned);
    }
    const record = {
      identity: model.slabIdentity(accountId, slabId),
      slabId,
      token,
    };
    forgetPayload(accountId, id, retired);
    adopt();
    owned.set(id, record);
    indexPayload(accountId, id, record.identity);
    return object;
  }

  function diskStream(
    lease: PayloadReader,
    position: number,
    end: number,
    request: MockRequest,
    device: string,
    signal?: AbortSignal,
  ) {
    const abort = new AbortController();
    let resolveDone!: () => void;
    let rejectDone!: (error: unknown) => void;
    const done = new Promise<void>((resolve, reject) => {
      resolveDone = resolve;
      rejectDone = reject;
    });
    void done.catch(() => undefined);
    let closure: Promise<void> | undefined;
    const closeLease = () => {
      closure ??= lease.close().then(resolveDone, (error) => {
        rejectDone(error);
        throw error;
      });
      void closure.catch(() => undefined);
      return closure;
    };
    let target: ReadableStreamDefaultController<Uint8Array>;
    let settled = false;
    const detach = () => {
      signal?.removeEventListener("abort", callerCancel);
      lease.signal?.removeEventListener("abort", retired);
    };
    const callerCancel = () => cancel(signal?.reason);
    const retired = () => cancel(lease.signal?.reason);
    const cancel = (reason: unknown = signal?.reason) => {
      if (settled) return;
      settled = true;
      request.status = "cancelled";
      abort.abort(reason);
      target.error(reason);
      detach();
      void closeLease().catch(() => undefined);
    };
    const stream = new ReadableStream<Uint8Array>(
      {
        async cancel() {
          settled = true;
          request.status = "cancelled";
          abort.abort();
          detach();
          await closeLease();
        },
        async pull(controller) {
          try {
            controls.checkOnline(device);
            if (position < end) {
              const count = Math.min(65536, chunkBytes, end - position);
              await controls.download(count, abort.signal);
              if (settled) return;
              const block = await lease.read(count);
              if (settled) return;
              if (!block) throw new Error("Unexpected payload EOF");
              controls.checkOnline(device);
              controller.enqueue(block);
              position += block.length;
              request.bytes += block.length;
            }
            if (position === end) {
              await closeLease();
              if (settled) return;
              settled = true;
              request.status = "completed";
              detach();
              controller.close();
            }
          } catch (error) {
            if (settled) return;
            settled = true;
            request.status = "failed";
            detach();
            try {
              await closeLease();
            } catch (cleanup) {
              controller.error(
                new AggregateError(
                  [error, cleanup],
                  "Payload read and close failed",
                ),
              );
              return;
            }
            controller.error(error);
          }
        },
        start(controller) {
          target = controller;
          signal?.addEventListener("abort", callerCancel, { once: true });
          lease.signal?.addEventListener("abort", retired, { once: true });
          if (signal?.aborted) callerCancel();
          else if (lease.signal?.aborted) retired();
        },
      },
      { highWaterMark: 0 },
    );
    downloadOwners.set(stream, {
      close() {
        cancel(new DOMException("Reader closed", "AbortError"));
        return closeLease();
      },
      done,
    });
    return stream;
  }

  function pin(
    accountId: string,
    id: string,
    retired: Promise<void>[] = [],
  ): void {
    const record = payload(accountId, id, retired);
    model.pinObject(accountId, { id, slabs: [record.slabId] });
  }

  async function drainRetirements(retired: Promise<void>[]) {
    const results = await Promise.allSettled(retired);
    const errors = results
      .filter((result) => result.status === "rejected")
      .map((result): unknown => result.reason);
    if (errors.length)
      throw new AggregateError(errors, "Payload retirement failed");
  }

  async function withRetirements<T>(
    action: (retired: Promise<void>[]) => Promise<T> | T,
  ): Promise<T> {
    const retired: Promise<void>[] = [];
    let value: T;
    try {
      value = await action(retired);
    } catch (error) {
      try {
        await drainRetirements(retired);
      } catch (cleanup) {
        // oxlint-disable-next-line preserve-caught-error -- Both original rejection values remain in errors.
        throw new AggregateError(
          [error, cleanup],
          "Mock operation and payload retirement failed",
          { cause: cleanup },
        );
      }
      throw error;
    }
    await drainRetirements(retired);
    return value;
  }

  return {
    closeDownload: (stream) =>
      downloadOwners.get(stream)?.close() ?? Promise.resolve(),
    control: controls.control,
    createSdk({ accountId, device = "default" }) {
      model.accountStats(accountId);

      async function run<T>(
        operation: MockOperation,
        objectId: string | undefined,
        action: (
          request: MockRequest,
          retired: Promise<void>[],
        ) => Promise<T> | T,
        stream = false,
        signal?: AbortSignal,
      ): Promise<T> {
        const request = controls.begin({
          accountId,
          device,
          operation,
          ...(objectId === undefined ? {} : { objectId }),
        });
        try {
          await controls.before(request, signal);
          signal?.throwIfAborted();
          const value =
            owner.kind === "temporary-files"
              ? await withRetirements((retired) => action(request, retired))
              : await action(request, []);
          if (!stream) request.status = "completed";
          return value;
        } catch (error) {
          request.status = signal?.aborted ? "cancelled" : "failed";
          throw error;
        }
      }

      return {
        async deleteObject(id, call = {}) {
          return run(
            "deleteObject",
            id,
            (_request, retired) => {
              const committed = call.prepareCommit?.();
              model.deleteObject(accountId, id);
              // Completion must precede Promise observers of the removed membership.
              committed?.();
              discardStalePayloads(
                accountId,
                retirementTrackers.get(accountId)?.takeRetired() ?? [],
                retired,
              );
            },
            false,
            call.signal,
          );
        },
        async download(object, range = {}) {
          const id = object.id();
          const requested = { ...range };
          return run(
            "download",
            id,
            async (request, retired) => {
              const record = payload(accountId, id, retired);
              const offset = requested.offset ?? 0;
              const length = requested.length ?? record.token.length;
              nonnegativeInteger(offset, "offset");
              nonnegativeInteger(length, "length");
              let position = Math.min(offset, record.token.length);
              const end =
                position + Math.min(length, record.token.length - position);
              if (owner.kind === "temporary-files") {
                const lease = await owner.openReader(
                  record.token,
                  offset,
                  length,
                );
                return diskStream(
                  lease,
                  position,
                  end,
                  request,
                  device,
                  requested.signal,
                );
              }
              const bufferedBytes = buffered.bytes(record.token);
              const abort = new AbortController();
              let target: ReadableStreamDefaultController<Uint8Array>;
              const cancelFromCaller = () => {
                request.status = "cancelled";
                abort.abort();
                target.error(
                  new DOMException("mock download cancelled", "AbortError"),
                );
                detach();
              };
              const detach = () =>
                requested.signal?.removeEventListener(
                  "abort",
                  cancelFromCaller,
                );
              return new ReadableStream<Uint8Array>(
                {
                  cancel() {
                    request.status = "cancelled";
                    abort.abort();
                    detach();
                  },
                  async pull(controller) {
                    try {
                      controls.checkOnline(device);
                      if (position < end) {
                        const next = Math.min(position + chunkBytes, end);
                        await controls.download(next - position, abort.signal);
                        if (abort.signal.aborted) return;
                        controls.checkOnline(device);
                        controller.enqueue(bufferedBytes.slice(position, next));
                        request.bytes += next - position;
                        position = next;
                      }
                      if (position === end) {
                        request.status = "completed";
                        detach();
                        controller.close();
                      }
                    } catch (error) {
                      if (abort.signal.aborted) return;
                      request.status = "failed";
                      detach();
                      controller.error(error);
                    }
                  },
                  start(controller) {
                    target = controller;
                    requested.signal?.addEventListener(
                      "abort",
                      cancelFromCaller,
                      { once: true },
                    );
                    if (requested.signal?.aborted) cancelFromCaller();
                  },
                },
                { highWaterMark: 0 },
              );
            },
            true,
            requested.signal,
          );
        },
        async object(id, call = {}) {
          return run(
            "object",
            id,
            (_request, retired) => {
              if (!model.object(accountId, id)) {
                const cached = payloads.get(accountId)?.get(id);
                if (cached && !payloadIsCurrent(model, accountId, cached))
                  forgetPayload(accountId, id, retired);
                throw new Error(`object ${id} not found`);
              }
              return createMockObject(
                id,
                payload(accountId, id, retired).token.length,
              );
            },
            false,
            call.signal,
          );
        },
        async pinObject(object, call = {}) {
          const id = object.id();
          return run(
            "pinObject",
            id,
            (_request, retired) => {
              const committed = call.prepareCommit?.();
              pin(accountId, id, retired);
              // Awaiting the SDK Promise before completion would expose the old metadata on a pinned object.
              committed?.();
            },
            false,
            call.signal,
          );
        },
        async pruneSlabs(call = {}) {
          return run(
            "pruneSlabs",
            undefined,
            (_request, retired) => {
              model.pruneSlabs(accountId);
              // External deletions can retire a pin before this prune call sees it.
              discardStalePayloads(
                accountId,
                payloadsByPin.get(accountId)?.keys() ?? [],
                retired,
              );
            },
            false,
            call.signal,
          );
        },
        async upload(bytes, { id, prepareCommit, signal }) {
          if (owner.kind !== "buffered")
            throw new Error("Disk upload requires an admitted payload token");
          const owned = buffered.finish(bytes);
          return run(
            "upload",
            id,
            async (request, retired) => {
              await controls.upload(owned.length, signal);
              signal?.throwIfAborted();
              controls.checkOnline(device);
              const committed = prepareCommit?.();
              const object = upload(accountId, id, owned, retired);
              // Bookkeeping must precede observers and SDK Promise delivery.
              committed?.();
              request.bytes = owned.length;
              return object;
            },
            false,
            signal,
          );
        },
        async uploadPayload(token, { id, prepareCommit, signal }) {
          owner.prepareAdoption(token);
          return run(
            "upload",
            id,
            async (request, retired) => {
              await controls.upload(token.length, signal);
              signal?.throwIfAborted();
              controls.checkOnline(device);
              const committed = prepareCommit?.();
              const object = upload(accountId, id, token, retired);
              committed?.();
              request.bytes = token.length;
              return object;
            },
            false,
            signal,
          );
        },
      };
    },
    discardUpload(accountId, id) {
      const discard = (retired: Promise<void>[]) => {
        const record = payload(accountId, id, retired);
        if (model.object(accountId, id))
          throw new Error("Cannot discard a pinned object");
        if (model.slabIdentity(accountId, record.slabId) !== record.identity)
          throw new Error("Upload slab identity changed");
        model.unpinSlab(accountId, record.slabId);
        forgetPayload(accountId, id, retired);
      };
      if (owner.kind === "temporary-files") return withRetirements(discard);
      discard([]);
      return Promise.resolve();
    },
    downloadDone: (stream) =>
      downloadOwners.get(stream)?.done ?? Promise.resolve(),
    drain: () => owner.drain(),
    model,
    seedObject(accountId, id, bytes) {
      if (owner.kind !== "buffered")
        throw new Error("Disk seed requires an admitted payload token");
      const object = upload(accountId, id, buffered.finish(bytes));
      try {
        pin(accountId, id);
      } catch (error) {
        const record = payloads.get(accountId)!.get(id)!;
        model.unpinSlab(accountId, record.slabId);
        forgetPayload(accountId, id);
        throw error;
      }
      return object;
    },
    serialize() {
      if (owner.kind !== "buffered")
        throw new Error("Cannot serialize temporary-file payload storage");
      const records: BufferedPayloadStore = new Map();
      for (const [accountId, owned] of payloads)
        records.set(
          accountId,
          new Map(
            Array.from(owned, ([id, record]) => [
              id,
              {
                bytes: buffered.bytes(record.token),
                identity: record.identity,
                slabId: record.slabId,
              },
            ]),
          ),
        );
      return serializeNetworkState(model, records);
    },
  };
}
