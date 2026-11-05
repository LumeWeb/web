/** Portable patterned fixtures generate and hash one chunk at a time. */
import { sha256 } from "@noble/hashes/sha2.js";
import type { TestFile } from "./types.js";
import { boundedByteView } from "./byte-view.js";

/** Patterned fixtures bound generation and hashing storage independently of declared size. */
// oxlint-disable-next-line typescript/require-await -- Matches the asynchronous fixture factory contract while hashing incrementally.
export async function chunkedFixture(input: {
  chunkSizeBytes: number;
  name: string;
  pattern: Uint8Array;
  sizeBytes: number;
}): Promise<TestFile> {
  const { chunkSizeBytes, name, sizeBytes } = input;
  if (
    !Number.isSafeInteger(sizeBytes) ||
    sizeBytes < 0 ||
    sizeBytes > 16 * 1024 * 1024 ||
    !Number.isSafeInteger(chunkSizeBytes) ||
    chunkSizeBytes < 1 ||
    chunkSizeBytes > 65536
  )
    throw Object.assign(new Error("Invalid chunked fixture size"), {
      code: "invalid-input",
    });
  let pattern: Uint8Array;
  try {
    pattern = new Uint8Array(boundedByteView(input.pattern, 65536));
    if (!pattern.length) throw new Error("Empty pattern");
  } catch {
    throw Object.assign(new Error("Invalid fixture pattern"), {
      code: "invalid-input",
    });
  }
  const chunk = (offset: number) => {
    const bytes = new Uint8Array(Math.min(chunkSizeBytes, sizeBytes - offset));
    for (let i = 0; i < bytes.length; i++)
      bytes[i] = pattern[(offset + i) % pattern.length]!;
    return bytes;
  };
  const hash = sha256.create();
  for (let offset = 0; offset < sizeBytes; offset += chunkSizeBytes)
    hash.update(chunk(offset));
  const hex = Array.from(hash.digest(), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return Object.freeze({
    name,
    open() {
      let offset = 0;
      return new ReadableStream<Uint8Array>(
        {
          pull(controller) {
            if (offset === sizeBytes) {
              controller.close();
              return;
            }
            const bytes = chunk(offset);
            offset += bytes.length;
            controller.enqueue(bytes);
          },
        },
        { highWaterMark: 0 },
      );
    },
    sha256: hex,
    sizeBytes,
  });
}
