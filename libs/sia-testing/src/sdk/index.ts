/** In-process payload mocks for app tests; no Sia encryption or host protocols are performed. */
import { createIndexdModel, type IndexdModel } from "../model/index.js";
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
  payloadSlabId,
  type PayloadStore,
  readNetworkState,
  serializeNetworkState,
} from "./state.js";

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
  createSdk(options: { accountId: string; device?: string }): MockSdk;
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
  const payloads: PayloadStore = saved?.payloads ?? new Map();

  function payload(accountId: string, id: string) {
    model.accountStats(accountId);
    const record = payloads.get(accountId)?.get(id);
    if (!record) throw new Error(`payload ${id} not found`);
    // Model resets and externally pruned slabs must also invalidate retained handles.
    try {
      model.getSlab(accountId, record.slabId);
    } catch {
      throw new Error(`payload ${id} not found`);
    }
    return record;
  }

  function upload(
    accountId: string,
    id: string,
    bytes: Uint8Array,
  ): MockObject {
    model.accountStats(accountId);
    const object = createMockObject(id, bytes.byteLength);
    let owned = payloads.get(accountId);
    if (owned?.has(id)) {
      const prior = owned.get(id)!;
      if (model.listSlabs(accountId).some((slab) => slab.id === prior.slabId))
        throw new Error(`payload ${id} already exists`);
    }
    const slabId = payloadSlabId(accountId, id);
    model.pinSlab(accountId, { id: slabId, size: bytes.byteLength });
    if (!owned) {
      owned = new Map();
      payloads.set(accountId, owned);
    }
    owned.set(id, { bytes: bytes.slice(), slabId });
    return object;
  }

  function pin(accountId: string, id: string): void {
    const record = payload(accountId, id);
    model.pinObject(accountId, { id, slabs: [record.slabId] });
  }

  return {
    control: controls.control,
    createSdk({ accountId, device = "default" }) {
      model.accountStats(accountId);

      async function run<T>(
        operation: MockOperation,
        objectId: string | undefined,
        action: (request: MockRequest) => Promise<T> | T,
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
          const value = await action(request);
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
            () => model.deleteObject(accountId, id),
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
            (request) => {
              const record = payload(accountId, id);
              const offset = requested.offset ?? 0;
              const length = requested.length ?? record.bytes.byteLength;
              nonnegativeInteger(offset, "offset");
              nonnegativeInteger(length, "length");
              let position = Math.min(offset, record.bytes.byteLength);
              const end =
                position + Math.min(length, record.bytes.byteLength - position);
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
                        controller.enqueue(record.bytes.slice(position, next));
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
            () => {
              if (!model.object(accountId, id))
                throw new Error(`object ${id} not found`);
              return createMockObject(
                id,
                payload(accountId, id).bytes.byteLength,
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
            () => pin(accountId, id),
            false,
            call.signal,
          );
        },
        async pruneSlabs(call = {}) {
          return run(
            "pruneSlabs",
            undefined,
            () => {
              const removed = new Set(model.pruneSlabs(accountId));
              for (const [id, record] of payloads.get(accountId) ?? []) {
                if (removed.has(record.slabId))
                  payloads.get(accountId)!.delete(id);
              }
            },
            false,
            call.signal,
          );
        },
        async upload(bytes, { id, signal }) {
          const owned = bytes.slice();
          return run(
            "upload",
            id,
            async (request) => {
              await controls.upload(owned.byteLength, signal);
              controls.checkOnline(device);
              const object = upload(accountId, id, owned);
              request.bytes = owned.byteLength;
              return object;
            },
            false,
            signal,
          );
        },
      };
    },
    model,
    seedObject(accountId, id, bytes) {
      const object = upload(accountId, id, bytes);
      try {
        pin(accountId, id);
      } catch (error) {
        const record = payloads.get(accountId)!.get(id)!;
        model.unpinSlab(accountId, record.slabId);
        payloads.get(accountId)!.delete(id);
        throw error;
      }
      return object;
    },
    serialize: () => serializeNetworkState(model, payloads),
  };
}
