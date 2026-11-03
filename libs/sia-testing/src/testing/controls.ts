/** Request receipts outlive bounded history, and aborted holds remove their waiters. */
import { createTransferLink } from "../sdk/link.js";
import type { ActorRef, TestObject } from "./types.js";
export interface MockFaults {
  fail(
    selector: RequestSelector,
    options: { code: "denied" | "not-found" | "unavailable"; times: number },
  ): void;
  hold(selector: RequestSelector): RequestHold;
  setLink(
    actor: ActorRef,
    input: {
      downloadBytesPerSecond?: null | number;
      latencyMs?: number;
      online?: boolean;
    },
  ): void;
}
export interface RequestHold {
  cancelled(): Promise<RequestReceipt>;
  release(): void;
  started(): Promise<RequestReceipt>;
}
export interface RequestReceipt {
  actor: ActorRef;
  bytes: number;
  id: string;
  objectId?: string;
  operation: RequestSelector["operation"];
  status: "cancelled" | "completed" | "failed" | "pending";
}
export interface RequestSelector {
  actor?: ActorRef;
  object?: TestObject;
  operation:
    | "download"
    | "object"
    | "objects"
    | "owner-share"
    | "owner-share-objects"
    | "owner-shares";
}
interface Held {
  cancel(record: RequestReceipt): void;
  cancellation: Promise<RequestReceipt>;
  matched: boolean;
  released: boolean;
  selector: RequestSelector;
  start(record: RequestReceipt): void;
  started: Promise<RequestReceipt>;
  waiters: Set<() => void>;
}
interface LinkState {
  latency: number;
  online: boolean;
  rate: null | number;
  transfer: ReturnType<typeof createTransferLink>;
}
export function createRequestControls() {
  const holds = new Set<Held>();
  const links = new Map<ActorRef, LinkState>();
  function link(actor: ActorRef): LinkState {
    let value = links.get(actor);
    if (!value) {
      const current: LinkState = {
        latency: 0,
        online: true,
        rate: null,
        transfer: createTransferLink(() => current.rate ?? 0),
      };
      value = current;
      links.set(actor, current);
    }
    return value;
  }
  const faults: {
    code: string;
    remaining: number;
    selector: RequestSelector;
  }[] = [];
  const records: RequestReceipt[] = [];
  function matches(selector: RequestSelector, request: RequestReceipt) {
    return (
      selector.operation === request.operation &&
      (!selector.actor || selector.actor === request.actor) &&
      (!selector.object || selector.object.id === request.objectId)
    );
  }
  const control: MockFaults = {
    fail(selector, options) {
      if (!Number.isSafeInteger(options.times) || options.times < 1)
        throw new Error("Fault count must be positive");
      faults.push({
        code: options.code,
        remaining: options.times,
        selector: { ...selector },
      });
    },
    hold(selector) {
      let started!: (record: RequestReceipt) => void;
      let cancelled!: (record: RequestReceipt) => void;
      const hold: Held = {
        cancel: (record) => cancelled({ ...record }),
        cancellation: new Promise((resolve) => {
          cancelled = resolve;
        }),
        matched: false,
        released: false,
        selector: { ...selector },
        start: (record) => started({ ...record }),
        started: new Promise((resolve) => {
          started = resolve;
        }),
        waiters: new Set(),
      };
      holds.add(hold);
      return {
        cancelled: () => hold.cancellation,
        release() {
          hold.released = true;
          holds.delete(hold);
          for (const resolve of hold.waiters) resolve();
          hold.waiters.clear();
        },
        started: () => hold.started,
      };
    },
    setLink(actor, input) {
      if (
        input.downloadBytesPerSecond !== undefined &&
        input.downloadBytesPerSecond !== null &&
        (!Number.isFinite(input.downloadBytesPerSecond) ||
          input.downloadBytesPerSecond <= 0)
      )
        throw new Error("Download rate must be positive or null");
      if (
        input.latencyMs !== undefined &&
        (!Number.isFinite(input.latencyMs) || input.latencyMs < 0)
      )
        throw new Error("Latency must be nonnegative");
      const current = link(actor);
      if (input.downloadBytesPerSecond !== undefined)
        current.rate = input.downloadBytesPerSecond;
      if (input.latencyMs !== undefined) current.latency = input.latencyMs;
      if (input.online !== undefined) current.online = input.online;
    },
  };
  return {
    async begin(
      actor: ActorRef,
      operation: RequestSelector["operation"],
      objectId: string | undefined,
      signal: AbortSignal,
    ) {
      signal.throwIfAborted();
      const record: RequestReceipt = {
        actor,
        bytes: 0,
        id: crypto.randomUUID(),
        operation,
        status: "pending",
        ...(objectId === undefined ? {} : { objectId }),
      };
      records.push(record);
      if (records.length > 256) records.shift();
      const hold = [...holds].find(
        (entry) => !entry.matched && matches(entry.selector, record),
      );
      if (hold) {
        hold.matched = true;
        hold.start(record);
      }
      try {
        const current = link(actor);
        if (!current.online)
          throw Object.assign(new Error("Device offline"), {
            code: "unavailable",
          });
        if (current.latency > 0)
          await new Promise<void>((resolve, reject) => {
            const aborted = () => {
              clearTimeout(timer);
              signal.removeEventListener("abort", aborted);
              reject(
                signal.reason instanceof Error
                  ? signal.reason
                  : new DOMException("Operation aborted", "AbortError"),
              );
            };
            const timer = setTimeout(() => {
              signal.removeEventListener("abort", aborted);
              resolve();
            }, current.latency);
            signal.addEventListener("abort", aborted, { once: true });
            if (signal.aborted) aborted();
          });
        if (hold && !hold.released)
          await new Promise<void>((resolve, reject) => {
            const finish = () => {
              signal.removeEventListener("abort", abort);
              hold.waiters.delete(finish);
              resolve();
            };
            const abort = () => {
              signal.removeEventListener("abort", abort);
              hold.waiters.delete(finish);
              reject(
                signal.reason instanceof Error
                  ? signal.reason
                  : new DOMException("Operation aborted", "AbortError"),
              );
            };
            hold.waiters.add(finish);
            signal.addEventListener("abort", abort, { once: true });
            if (signal.aborted) abort();
          });
        signal.throwIfAborted();
        const faultIndex = faults.findIndex(
          (entry) => entry.remaining > 0 && matches(entry.selector, record),
        );
        const fault = faults[faultIndex];
        if (fault) {
          fault.remaining--;
          if (fault.remaining === 0) faults.splice(faultIndex, 1);
          throw Object.assign(new Error("Injected mock failure"), {
            code: fault.code,
          });
        }
        return record;
      } catch (error) {
        record.status = signal.aborted ? "cancelled" : "failed";
        if (record.status === "cancelled") hold?.cancel(record);
        throw error;
      }
    },
    control,
    history: () => records.map((record) => ({ ...record })),
    observe(
      record: RequestReceipt,
      stream: ReadableStream<Uint8Array>,
      signal: AbortSignal,
    ) {
      const cancellation = new AbortController();
      signal = AbortSignal.any([signal, cancellation.signal]);
      const reader = stream.getReader();
      let ended = false;
      let target!: ReadableStreamDefaultController<Uint8Array>;
      const detach = () => signal.removeEventListener("abort", abort);
      const abort = () => {
        if (ended) return;
        ended = true;
        record.status = "cancelled";
        detach();
        target.error(signal.reason);
        void reader.cancel(signal.reason).catch(() => undefined);
      };
      return new ReadableStream<Uint8Array>(
        {
          cancel(reason) {
            ended = true;
            record.status = "cancelled";
            detach();
            cancellation.abort(reason);
            return reader.cancel(reason);
          },
          async pull(controller) {
            try {
              const next = await reader.read();
              if (ended) return;
              if (next.done) {
                ended = true;
                record.status = "completed";
                detach();
                reader.releaseLock();
                controller.close();
              } else {
                const current = link(record.actor);
                if (!current.online)
                  throw Object.assign(new Error("Device offline"), {
                    code: "unavailable",
                  });
                await current.transfer(next.value.byteLength, signal);
                signal.throwIfAborted();
                record.bytes += next.value.byteLength;
                controller.enqueue(next.value);
              }
            } catch (error) {
              if (!ended) {
                ended = true;
                record.status = signal.aborted ? "cancelled" : "failed";
                detach();
                let failure = error;
                try {
                  await reader.cancel(error);
                } catch (cancelError) {
                  if (cancelError !== error)
                    failure = new AggregateError(
                      [error, cancelError],
                      "Download and source cancellation failed",
                    );
                } finally {
                  reader.releaseLock();
                }
                controller.error(failure);
              }
            }
          },
          start(controller) {
            target = controller;
            signal.addEventListener("abort", abort, { once: true });
            if (signal.aborted) abort();
          },
        },
        { highWaterMark: 0 },
      );
    },
  };
}
