/** Replayable byte fixtures detach caller memory before hashing or opening streams. */
import type { TestFile } from "./types.js";
import { boundedByteView } from "./byte-view.js";

export async function bytesFixture(input: {
  bytes: Uint8Array;
  name: string;
}): Promise<TestFile> {
  const bytes = input.bytes;
  let view: Uint8Array;
  try {
    view = boundedByteView(bytes, Number.POSITIVE_INFINITY);
  } catch {
    throw Object.assign(new Error("Fixture bytes must be a valid Uint8Array"), {
      code: "invalid-input",
    });
  }
  const stored = new Uint8Array(view);
  return Object.freeze({
    name: input.name,
    open: () =>
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(stored.slice());
          controller.close();
        },
      }),
    sha256: await digest(stored),
    sizeBytes: stored.byteLength,
  });
}

export async function digest(bytes: Uint8Array): Promise<string> {
  const value = await crypto.subtle.digest(
    "SHA-256",
    new Uint8Array(bytes).buffer,
  );
  return [...new Uint8Array(value)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Cancelling the source resolves a pending read even when no chunk has arrived. */
export async function readFixture(
  file: TestFile,
  signal: AbortSignal,
  checkpoint?: (bytes: number) => Promise<void>,
  cleanupError?: (error: unknown) => void,
): Promise<Uint8Array> {
  signal.throwIfAborted();
  const reader = file.open().getReader();
  const closed = reader.closed.then(
    () => ({ failed: false as const }),
    (error: unknown) => ({ error, failed: true as const }),
  );
  let readFailure: undefined | { error: unknown };
  let cancellation: Promise<void> | undefined;
  const cancel = (reason: unknown = signal.reason) => {
    cancellation ??= reader.cancel(reason);
    void cancellation.catch(() => undefined);
  };
  const abort = () => cancel();
  signal.addEventListener("abort", abort, { once: true });
  let complete = false;
  let cancellationFailed = false;
  const failures: unknown[] = [];
  let result: Uint8Array | undefined;
  try {
    // The accepted byte length also bounds storage when a source emits arbitrarily many empty chunks.
    const bytes = new Uint8Array(file.sizeBytes);
    let length = 0;
    await checkpoint?.(0);
    for (;;) {
      signal.throwIfAborted();
      let next: ReadableStreamReadResult<Uint8Array>;
      try {
        next = await reader.read();
      } catch (error) {
        readFailure = { error };
        throw error;
      }
      signal.throwIfAborted();
      if (next.done) break;
      let view: Uint8Array;
      try {
        view = boundedByteView(next.value, file.sizeBytes - length);
      } catch {
        throw invalidFile();
      }
      bytes.set(view, length);
      length += view.byteLength;
      await checkpoint?.(length);
    }
    if (length !== file.sizeBytes) throw invalidFile();
    complete = true;
    if ((await digest(bytes)) !== file.sha256) throw invalidFile();
    signal.throwIfAborted();
    result = bytes;
  } catch (error) {
    failures.push(error);
  }
  signal.removeEventListener("abort", abort);
  if (!complete) cancel(failures[0]);
  try {
    await cancellation;
  } catch (error) {
    const state = await closed;
    const repeatedReaderError =
      (readFailure !== undefined && Object.is(readFailure.error, error)) ||
      (state.failed && Object.is(state.error, error));
    if (!repeatedReaderError) {
      cancellationFailed = true;
      failures.push(error);
    }
  } finally {
    reader.releaseLock();
  }
  if (failures.length) {
    const failure =
      failures.length === 1
        ? failures[0]
        : new AggregateError(
            failures,
            "Fixture read and source cancellation failed",
            { cause: failures[1] },
          );
    if (cancellationFailed) cleanupError?.(failure);
    throw failure;
  }
  return result!;
}

function invalidFile(): Error & { code: string } {
  return Object.assign(
    new Error("Fixture content does not match its descriptor"),
    { code: "invalid-input" },
  );
}
