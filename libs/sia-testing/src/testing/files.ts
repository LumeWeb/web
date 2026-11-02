/** Replayable byte fixtures detach caller memory before hashing or opening streams. */
import type { TestFile } from "./types.js";

export async function bytesFixture(input: {
  bytes: Uint8Array;
  name: string;
}): Promise<TestFile> {
  const stored = new Uint8Array(input.bytes);
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
): Promise<Uint8Array> {
  signal.throwIfAborted();
  const reader = file.open().getReader();
  let cancellation: Promise<void> | undefined;
  const cancel = () => {
    cancellation ??= reader.cancel(signal.reason);
    void cancellation.catch(() => undefined);
  };
  signal.addEventListener("abort", cancel, { once: true });
  let complete = false;
  const failures: unknown[] = [];
  let result: Uint8Array | undefined;
  try {
    // The accepted byte length also bounds storage when a source emits arbitrarily many empty chunks.
    const bytes = new Uint8Array(file.sizeBytes);
    let length = 0;
    for (;;) {
      signal.throwIfAborted();
      const next = await reader.read();
      signal.throwIfAborted();
      if (next.done) break;
      if (
        !(next.value instanceof Uint8Array) ||
        length + next.value.byteLength > file.sizeBytes
      )
        throw invalidFile();
      bytes.set(next.value, length);
      length += next.value.byteLength;
    }
    if (length !== file.sizeBytes) throw invalidFile();
    complete = true;
    if ((await digest(bytes)) !== file.sha256) throw invalidFile();
    signal.throwIfAborted();
    result = bytes;
  } catch (error) {
    failures.push(error);
  }
  signal.removeEventListener("abort", cancel);
  if (!complete) cancel();
  try {
    await cancellation;
  } catch (error) {
    failures.push(error);
  } finally {
    reader.releaseLock();
  }
  if (failures.length === 1) throw failures[0];
  if (failures.length > 1)
    throw new AggregateError(
      failures,
      "Fixture read and source cancellation failed",
      { cause: failures[1] },
    );
  return result!;
}

function invalidFile(): Error & { code: string } {
  return Object.assign(
    new Error("Fixture content does not match its descriptor"),
    { code: "invalid-input" },
  );
}
