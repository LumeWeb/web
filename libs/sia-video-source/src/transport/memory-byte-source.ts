/**
 * Deterministic in-memory {@link ByteSource} for parser/index/producer tests
 * that must run without the Sia SDK, using in-memory fixtures. It is also the
 * reference for the ByteSource supersede/cancel/EOF semantics the
 * `SiaByteSource` adapter shares.
 *
 * Delivery is scheduled on a microtask so a supersede or cancel issued
 * synchronously right after `read()` always wins — a read that is superseded
 * before it starts must never deliver a byte.
 */

import {
  type ByteRange,
  type ByteSource,
  ByteSourceEpoch,
  ByteSourceSupersededError,
  emptyByteStream,
  type ReadOptions,
  supersededStream,
  toSupersededError,
} from './byte-source.ts';

export class MemoryByteSource implements ByteSource {
  get size(): number {
    return this.#bytes.byteLength;
  }

  readonly #bytes: Uint8Array;
  readonly #epochs = new ByteSourceEpoch();

  constructor(bytes: ArrayBuffer | Uint8Array) {
    this.#bytes = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  }

  cancel(reason?: unknown): void {
    this.#epochs.reset(reason);
  }

  read(range: ByteRange, options: ReadOptions): ReadableStream<Uint8Array> {
    const epoch = options.epoch;
    let superseded = false;
    let settled = false;
    let controllerRef: null | ReadableStreamDefaultController<Uint8Array> = null;

    // `settle` references `handle` and vice versa; both are only invoked after
    // `read()` finishes building its stream, so neither forward reference is
    // ever observed before the other is initialized.
    const handle = {
      stop: (reason?: unknown) => {
        if (settled) return;
        superseded = true;
        const controller = controllerRef;
        if (controller) {
          try {
            controller.error(toSupersededError(reason));
          } catch {
            /* already errored/closed */
          }
        }
        settle();
      },
    };

    if (!this.#epochs.open(epoch, handle)) {
      return supersededStream(new ByteSourceSupersededError(`stale epoch ${epoch}`));
    }

    const start = Math.max(0, Math.floor(range.offset));
    const want = Math.max(0, Math.floor(range.length));
    const end = Math.min(this.#bytes.byteLength, start + want);

    if (end <= start) {
      this.#epochs.settle(handle);
      return emptyByteStream();
    }

    const signal = options.signal;
    const onAbort = () => handle.stop(signal?.reason);
    signal?.addEventListener('abort', onAbort, { once: true });

    const settle = () => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', onAbort);
      this.#epochs.settle(handle);
    };

    const source = this.#bytes;
    return new ReadableStream<Uint8Array>({
      cancel: () => {
        handle.stop();
      },
      start: (controller) => {
        controllerRef = controller;
        if (superseded) {
          try {
            controller.error(toSupersededError());
          } catch {
            /* already errored */
          }
          settle();
          return;
        }
        queueMicrotask(() => {
          if (superseded) {
            settle();
            return;
          }
          try {
            // Deliver a copy so a caller mutating the produced bytes can
            // never corrupt the source.
            controller.enqueue(source.slice(start, end));
            controller.close();
          } catch {
            /* cancelled mid-delivery: nothing may deliver now */
          }
          settle();
        });
      },
    });
  }
}
