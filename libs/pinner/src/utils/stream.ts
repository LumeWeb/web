import { isNodeEnvironment } from "./env";

type AwaitIterable<T> = Iterable<T> | AsyncIterable<T>;

/**
 * Convert a ReadableStream to a Blob.
 */
export async function streamToBlob(
  stream: ReadableStream<Uint8Array>,
  mimeType: string,
): Promise<Blob> {
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return new Blob(chunks as any, { type: mimeType });
}

/**
 * Calculate the total size of a ReadableStream by consuming it.
 */
export async function calculateStreamSize(
  stream: ReadableStream<Uint8Array>,
  signal?: AbortSignal,
): Promise<bigint> {
  let size = 0n;
  const reader = stream.getReader();

  while (true) {
    if (signal?.aborted) {
      throw new Error("Aborted");
    }

    const { done, value } = await reader.read();
    if (done) break;
    size += BigInt(value.length);
  }

  return size;
}

/**
 * Convert an async generator to a ReadableStream.
 */
export function asyncGeneratorToReadableStream<T>(
  generator: AsyncGenerator<T>,
): ReadableStream<T> {
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const item of generator) {
          controller.enqueue(item);
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

/**
 * Convert a ReadableStream to an async iterable.
 */
export async function* readableStreamToAsyncIterable<T>(
  stream: ReadableStream<T>,
): AsyncIterable<T> {
  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Convert a web ReadableStream to a Node.js stream.Readable
 * This is needed for Node.js environments where tus-js-client expects Node streams.
 */
export async function readableStreamToNodeStream(
  stream: ReadableStream<Uint8Array>,
): Promise<import("stream").Readable> {
  if (!isNodeEnvironment()) {
    throw new Error(
      "readableStreamToNodeStream can only be used in Node.js environment",
    );
  }

  const { Readable } = await import("stream");

  // Create a single reader for the entire stream lifecycle
  // The read() method is called multiple times by Node.js, so we cannot
  // call getReader() inside it - that would create multiple readers and
  // cause "ReadableStream is locked" errors
  const reader = stream.getReader();

  return new Readable({
    async read() {
      try {
        const { done, value } = await reader.read();
        if (done) {
          reader.releaseLock();
          this.push(null);
        } else {
          this.push(Buffer.from(value));
        }
      } catch (error) {
        reader.releaseLock();
        this.destroy(error as Error);
      }
    },

    // Ensure reader is released if stream is destroyed
    destroy(error, callback) {
      try {
        reader.releaseLock();
      } catch (e) {
        // Ignore errors during cleanup
      }
      if (callback) callback(error);
    },
  });
}

/**
 * Convert a ReadableStream to a Blob using the Response API.
 * This is the preferred method in browser environments as it's built-in and efficient.
 */
export async function streamToBlobViaResponse(
  stream: ReadableStream<Uint8Array>,
): Promise<Blob> {
  return new Response(stream).blob();
}

/**
 * Convert a File to a ReadableStream of Uint8Array without loading entire blob into memory.
 * This streams the file content chunk by chunk.
 */
export function fileToReadableStream(file: File): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const reader = (file as any).stream().getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            break;
          }
          controller.enqueue(value);
        }
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

/**
 * Collect all chunks from an async iterable or iterable into a single Uint8Array.
 */
export async function collectAsyncIterable(
  iterable: AwaitIterable<Uint8Array>,
): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of iterable) {
    chunks.push(chunk);
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}
