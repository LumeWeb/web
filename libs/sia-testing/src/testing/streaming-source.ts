/** Spool collection owns cancellation and filesystem cleanup separately from producer read failures. */
import type { FinishedPayload, PayloadSpool } from "../sdk/payload-store.js";

export async function collectPayload(
  open: () => ReadableStream<Uint8Array>,
  spool: PayloadSpool,
  signal: AbortSignal,
  checkpoint: (bytes: number) => Promise<void> | void = () => undefined,
  cleanupError: (error: unknown) => void = () => undefined,
  descriptor?: { sha256: string; sizeBytes: number },
): Promise<FinishedPayload> {
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let closed: Promise<{ failed: boolean }> | undefined;
  let cancellation: Promise<void> | undefined;
  const cancel = (reason: unknown) => {
    if (!reader) return;
    cancellation ??= reader.cancel(reason);
    void cancellation.catch(() => undefined);
  };
  const abort = () => cancel(signal.reason);
  const errors: unknown[] = [];
  let complete = false;
  let token: FinishedPayload | undefined;
  try {
    signal.throwIfAborted();
    reader = open().getReader();
    closed = reader.closed.then(
      () => ({ failed: false }),
      () => ({ failed: true }),
    );
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
    const initial = checkpoint(0);
    if (initial) await initial;
    let length = 0;
    for (;;) {
      signal.throwIfAborted();
      const next = await reader.read();
      signal.throwIfAborted();
      if (next.done) break;
      // append validates intrinsic capacities and snapshots synchronously, before its first write await.
      const accepted = intrinsicLength(next.value);
      await spool.append(next.value);
      length += accepted;
      const pending = checkpoint(length);
      if (pending) await pending;
    }
    token = await spool.finish();
    if (
      descriptor &&
      (token.length !== descriptor.sizeBytes ||
        token.sha256 !== descriptor.sha256)
    )
      throw Object.assign(
        new Error("Fixture content does not match its descriptor"),
        { code: "invalid-input" },
      );
    signal.throwIfAborted();
    complete = true;
  } catch (error) {
    errors.push(error);
  }
  signal.removeEventListener("abort", abort);
  if (!complete) cancel(errors[0]);
  try {
    await cancellation;
  } catch (error) {
    // Cancel on an errored reader repeats its stored failure without invoking producer cancellation.
    // Cancel on a readable reader closes reader.closed even if the producer's cancel rejects.
    if (!(await closed)?.failed) {
      errors.push(error);
      cleanupError(error);
    }
  } finally {
    reader?.releaseLock();
  }
  if (!complete) {
    try {
      await spool.discard();
    } catch (error) {
      errors.push(error);
      cleanupError(error);
    }
    if (errors.length === 1) throw errors[0];
    throw new AggregateError(errors, "Payload source and cleanup failed");
  }
  return token!;
}

function intrinsicLength(value: Uint8Array): number {
  const prototype = Object.getPrototypeOf(Uint8Array.prototype) as object;
  return Object.getOwnPropertyDescriptor(prototype, "byteLength")!.get!.call(
    value,
  ) as number;
}
