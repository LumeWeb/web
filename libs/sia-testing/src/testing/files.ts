/** Replayable byte fixtures detach caller memory before hashing or opening streams. */
import type { TestFile } from "./types.js";

export async function bytesFixture(input: {
  bytes: Uint8Array;
  name: string;
}): Promise<TestFile> {
  const stored = input.bytes.slice();
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
  const value = await crypto.subtle.digest("SHA-256", bytes.slice().buffer);
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
  const cancel = () => {
    void reader.cancel(signal.reason).catch(() => undefined);
  };
  signal.addEventListener("abort", cancel, { once: true });
  let complete = false;
  try {
    const chunks: Uint8Array[] = [];
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
      const bytes = next.value.slice();
      length += bytes.byteLength;
      chunks.push(bytes);
    }
    if (length !== file.sizeBytes) throw invalidFile();
    complete = true;
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    if ((await digest(bytes)) !== file.sha256) throw invalidFile();
    signal.throwIfAborted();
    return bytes;
  } finally {
    signal.removeEventListener("abort", cancel);
    if (!complete) cancel();
    reader.releaseLock();
  }
}

function invalidFile(): Error & { code: string } {
  return Object.assign(
    new Error("Fixture content does not match its descriptor"),
    { code: "invalid-input" },
  );
}
