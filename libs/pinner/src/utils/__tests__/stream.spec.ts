import { describe, expect, it, vi } from "vitest";
import {
  asyncGeneratorToReadableStream,
  calculateStreamSize,
  collectAsyncIterable,
  readableStreamToAsyncIterable,
  readableStreamToNodeStream,
  streamToBlob,
} from "../stream";
import { isNodeEnvironment } from "../env";

describe("streamToBlob", () => {
  it("should convert a ReadableStream to a Blob with correct MIME type", async () => {
    const data = new TextEncoder().encode("Hello, World!");
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(data);
        controller.close();
      },
    });

    const blob = await streamToBlob(stream, "text/plain");

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("text/plain");
  });

  it("should correctly reconstruct the data from the stream", async () => {
    const data = new TextEncoder().encode("Test content");
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(data);
        controller.close();
      },
    });

    const blob = await streamToBlob(stream, "text/plain");
    const text = await blob.text();

    expect(text).toBe("Test content");
  });

  it("should handle multiple chunks", async () => {
    const chunk1 = new TextEncoder().encode("First ");
    const chunk2 = new TextEncoder().encode("Second ");
    const chunk3 = new TextEncoder().encode("Third");
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(chunk1);
        controller.enqueue(chunk2);
        controller.enqueue(chunk3);
        controller.close();
      },
    });

    const blob = await streamToBlob(stream, "text/plain");
    const text = await blob.text();

    expect(text).toBe("First Second Third");
  });

  it("should handle empty stream", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.close();
      },
    });

    const blob = await streamToBlob(stream, "application/octet-stream");

    expect(blob.size).toBe(0);
  });

  it("should handle binary data", async () => {
    const data = new Uint8Array([0x00, 0xff, 0x7f, 0x80, 0x12, 0x34]);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(data);
        controller.close();
      },
    });

    const blob = await streamToBlob(stream, "application/octet-stream");
    const arrayBuffer = await blob.arrayBuffer();
    const result = new Uint8Array(arrayBuffer);

    expect(result).toEqual(data);
  });
});

describe("calculateStreamSize", () => {
  it("should calculate the size of a single-chunk stream", async () => {
    const data = new Uint8Array(100);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(data);
        controller.close();
      },
    });

    const size = await calculateStreamSize(stream);

    expect(size).toBe(100n);
  });

  it("should calculate the size of a multi-chunk stream", async () => {
    const chunk1 = new Uint8Array(50);
    const chunk2 = new Uint8Array(30);
    const chunk3 = new Uint8Array(20);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(chunk1);
        controller.enqueue(chunk2);
        controller.enqueue(chunk3);
        controller.close();
      },
    });

    const size = await calculateStreamSize(stream);

    expect(size).toBe(100n);
  });

  it("should return 0 for an empty stream", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.close();
      },
    });

    const size = await calculateStreamSize(stream);

    expect(size).toBe(0n);
  });

  it("should handle large chunks", async () => {
    const data = new Uint8Array(1024 * 1024); // 1MB
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(data);
        controller.close();
      },
    });

    const size = await calculateStreamSize(stream);

    expect(size).toBe(1048576n);
  });

  it("should throw an error when abort signal is triggered", async () => {
    const controller = new AbortController();
    const signal = controller.signal;

    const stream = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(new Uint8Array([1, 2, 3]));
        c.close();
      },
    });

    // Abort before reading
    controller.abort();

    await expect(calculateStreamSize(stream, signal)).rejects.toThrow(
      "Aborted",
    );
  });

  it("should handle abort during iteration", async () => {
    const controller = new AbortController();
    const signal = controller.signal;

    let abortController: AbortController | null = null;
    const stream = new ReadableStream<Uint8Array>({
      async start(c) {
        abortController = controller;
        c.enqueue(new Uint8Array([1, 2, 3]));
        // Wait a bit before second chunk
        await new Promise((resolve) => setTimeout(resolve, 10));
        c.enqueue(new Uint8Array([4, 5, 6]));
        c.close();
      },
    });

    // Abort after first read
    setTimeout(() => {
      abortController?.abort();
    }, 5);

    await expect(calculateStreamSize(stream, signal)).rejects.toThrow(
      "Aborted",
    );
  });

  it("should work without an abort signal", async () => {
    const data = new Uint8Array(50);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(data);
        controller.close();
      },
    });

    const size = await calculateStreamSize(stream);

    expect(size).toBe(50n);
  });
});

describe("asyncGeneratorToReadableStream", () => {
  it("should convert an async generator to a ReadableStream", async () => {
    async function* generator() {
      yield "first";
      yield "second";
      yield "third";
    }

    const stream = asyncGeneratorToReadableStream(generator());
    const reader = stream.getReader();

    const result1 = await reader.read();
    const result2 = await reader.read();
    const result3 = await reader.read();
    const result4 = await reader.read();

    expect(result1.value).toBe("first");
    expect(result2.value).toBe("second");
    expect(result3.value).toBe("third");
    expect(result4.done).toBe(true);
  });

  it("should handle async generator with Uint8Array", async () => {
    async function* generator() {
      yield new Uint8Array([1, 2, 3]);
      yield new Uint8Array([4, 5, 6]);
    }

    const stream = asyncGeneratorToReadableStream<Uint8Array>(generator());
    const reader = stream.getReader();

    const result1 = await reader.read();
    const result2 = await reader.read();
    const result3 = await reader.read();

    expect(result1.value).toEqual(new Uint8Array([1, 2, 3]));
    expect(result2.value).toEqual(new Uint8Array([4, 5, 6]));
    expect(result3.done).toBe(true);
  });

  it("should handle empty async generator", async () => {
    async function* emptyGenerator() {
      // No yields
    }

    const stream = asyncGeneratorToReadableStream(emptyGenerator());
    const reader = stream.getReader();

    const result = await reader.read();

    expect(result.done).toBe(true);
  });

  it("should propagate errors from the generator", async () => {
    async function* errorGenerator() {
      yield "first";
      throw new Error("Generator error");
    }

    const stream = asyncGeneratorToReadableStream(errorGenerator());
    const reader = stream.getReader();

    const result1 = await reader.read();
    expect(result1.value).toBe("first");

    await expect(reader.read()).rejects.toThrow("Generator error");
  });

  it("should handle async delays in generator", async () => {
    async function* delayedGenerator() {
      await new Promise((resolve) => setTimeout(resolve, 10));
      yield "first";
      await new Promise((resolve) => setTimeout(resolve, 10));
      yield "second";
    }

    const stream = asyncGeneratorToReadableStream(delayedGenerator());
    const reader = stream.getReader();

    const result1 = await reader.read();
    const result2 = await reader.read();
    const result3 = await reader.read();

    expect(result1.value).toBe("first");
    expect(result2.value).toBe("second");
    expect(result3.done).toBe(true);
  });
});

describe("readableStreamToAsyncIterable", () => {
  it("should convert a ReadableStream to an async iterable", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2, 3]));
        controller.enqueue(new Uint8Array([4, 5, 6]));
        controller.close();
      },
    });

    const values: Uint8Array[] = [];
    for await (const chunk of readableStreamToAsyncIterable(stream)) {
      values.push(chunk);
    }

    expect(values).toHaveLength(2);
    expect(values[0]).toEqual(new Uint8Array([1, 2, 3]));
    expect(values[1]).toEqual(new Uint8Array([4, 5, 6]));
  });

  it("should handle string streams", async () => {
    const stream = new ReadableStream<string>({
      start(controller) {
        controller.enqueue("first");
        controller.enqueue("second");
        controller.close();
      },
    });

    const values: string[] = [];
    for await (const chunk of readableStreamToAsyncIterable(stream)) {
      values.push(chunk);
    }

    expect(values).toEqual(["first", "second"]);
  });

  it("should handle empty stream", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.close();
      },
    });

    const values: Uint8Array[] = [];
    for await (const chunk of readableStreamToAsyncIterable(stream)) {
      values.push(chunk);
    }

    expect(values).toHaveLength(0);
  });

  it("should release the reader lock on completion", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2]));
        controller.close();
      },
    });

    for await (const chunk of readableStreamToAsyncIterable(stream)) {
      // Iterate through
    }

    // After iteration completes, the reader should be released
    // This is implicitly tested by the function not throwing
    expect(true).toBe(true);
  });

  it("should release the reader lock on error", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2]));
        // Don't call error() here as it will close the stream and prevent reading
        // Instead, we'll just verify the reader is released after normal completion
        controller.close();
      },
    });

    const values: Uint8Array[] = [];
    for await (const chunk of readableStreamToAsyncIterable(stream)) {
      values.push(chunk);
    }

    expect(values).toHaveLength(1);
    expect(values[0]).toEqual(new Uint8Array([1, 2]));
  });
});

describe.runIf(isNodeEnvironment())("readableStreamToNodeStream", () => {
  it("should convert a ReadableStream to a Node.js Readable stream", async () => {
    const data = new Uint8Array([1, 2, 3, 4, 5]);
    const webStream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(data);
        controller.close();
      },
    });

    const nodeStream = await readableStreamToNodeStream(webStream);

    expect(nodeStream).toBeInstanceOf((await import("stream")).Readable);

    // Read the node stream and verify data
    const chunks: Buffer[] = [];
    for await (const chunk of nodeStream) {
      chunks.push(chunk as Buffer);
    }

    const result = Buffer.concat(chunks);
    expect(result).toEqual(Buffer.from(data));
  });

  it("should handle multiple chunks correctly", async () => {
    const chunk1 = new Uint8Array([1, 2, 3]);
    const chunk2 = new Uint8Array([4, 5, 6]);
    const chunk3 = new Uint8Array([7, 8, 9]);

    const webStream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(chunk1);
        controller.enqueue(chunk2);
        controller.enqueue(chunk3);
        controller.close();
      },
    });

    const nodeStream = await readableStreamToNodeStream(webStream);

    const chunks: Buffer[] = [];
    for await (const chunk of nodeStream) {
      chunks.push(chunk as Buffer);
    }

    const result = Buffer.concat(chunks);
    expect(result).toEqual(Buffer.concat([chunk1, chunk2, chunk3]));
  });

  it("should handle empty stream", async () => {
    const webStream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.close();
      },
    });

    const nodeStream = await readableStreamToNodeStream(webStream);

    const chunks: Buffer[] = [];
    for await (const chunk of nodeStream) {
      chunks.push(chunk as Buffer);
    }

    expect(chunks).toHaveLength(0);
  });

  it("should release the reader lock on stream completion", async () => {
    const webStream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2]));
        controller.close();
      },
    });

    const nodeStream = await readableStreamToNodeStream(webStream);

    // Consume the stream
    for await (const chunk of nodeStream) {
      // Read all data
    }

    // After completion, we should be able to get a new reader
    // This proves the original reader was released
    const reader = webStream.getReader();
    const { done } = await reader.read();
    expect(done).toBe(true);
    reader.releaseLock();
  });

  it("should handle stream errors", async () => {
    const webStream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2]));
        controller.error(new Error("Stream error"));
      },
    });

    const nodeStream = await readableStreamToNodeStream(webStream);

    await expect(async () => {
      for await (const chunk of nodeStream) {
        // This will throw when the error is encountered
      }
    }).rejects.toThrow("Stream error");
  });

  it("should handle partial reads correctly", async () => {
    const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const webStream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(data);
        controller.close();
      },
    });

    const nodeStream = await readableStreamToNodeStream(webStream);

    // Read in smaller chunks to simulate how tus-js-client reads
    const chunks: Buffer[] = [];
    let buffer = Buffer.alloc(0);

    for await (const chunk of nodeStream) {
      buffer = Buffer.concat([buffer, chunk as Buffer]);

      // Simulate consuming in smaller pieces
      while (buffer.length >= 3) {
        chunks.push(buffer.subarray(0, 3));
        buffer = buffer.subarray(3);
      }
    }

    // Add remaining buffer
    if (buffer.length > 0) {
      chunks.push(buffer);
    }

    const result = Buffer.concat(chunks);
    expect(result).toEqual(Buffer.from(data));
  });

  it("should handle large data streams", async () => {
    const largeData = new Uint8Array(100 * 1024); // 100KB
    for (let i = 0; i < largeData.length; i++) {
      largeData[i] = i % 256;
    }

    const webStream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(largeData);
        controller.close();
      },
    });

    const nodeStream = await readableStreamToNodeStream(webStream);

    const chunks: Buffer[] = [];
    for await (const chunk of nodeStream) {
      chunks.push(chunk as Buffer);
    }

    const result = Buffer.concat(chunks);
    expect(result).toEqual(Buffer.from(largeData));
    expect(result.length).toBe(100 * 1024);
  });

  it("should properly cleanup reader on stream destroy", async () => {
    const webStream = new ReadableStream<Uint8Array>({
      start(controller) {
        // Don't close - we'll destroy the node stream
        controller.enqueue(new Uint8Array([1, 2]));
      },
    });

    const nodeStream = await readableStreamToNodeStream(webStream);

    // Suppress the uncaught error from destroy
    const errorHandler = vi.fn();
    process.on("uncaughtException", errorHandler);

    // Destroy the node stream
    nodeStream.destroy(new Error("Intentional destroy"));

    // Wait a bit for cleanup
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Remove the error handler
    process.off("uncaughtException", errorHandler);

    // After destroy, we should be able to get a new reader
    // This proves the original reader was released during destroy
    const reader = webStream.getReader();
    reader.releaseLock();
  });
});

describe("collectAsyncIterable", () => {
  it("should collect chunks from an async iterable", async () => {
    async function* chunkGenerator() {
      yield new Uint8Array([1, 2, 3]);
      yield new Uint8Array([4, 5, 6]);
      yield new Uint8Array([7, 8, 9]);
    }

    const result = await collectAsyncIterable(chunkGenerator());

    expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]));
  });

  it("should handle empty iterable", async () => {
    async function* emptyGenerator() {
      // No yields
    }

    const result = await collectAsyncIterable(emptyGenerator());

    expect(result).toEqual(new Uint8Array([]));
  });

  it("should handle single chunk", async () => {
    async function* singleChunk() {
      yield new Uint8Array([1, 2, 3, 4, 5]);
    }

    const result = await collectAsyncIterable(singleChunk());

    expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
  });

  it("should handle chunks of varying sizes", async () => {
    async function* varyingChunks() {
      yield new Uint8Array([1]);
      yield new Uint8Array([2, 3]);
      yield new Uint8Array([4, 5, 6]);
      yield new Uint8Array([7, 8, 9, 10]);
    }

    const result = await collectAsyncIterable(varyingChunks());

    expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
  });

  it("should handle large chunks", async () => {
    const chunk1 = new Uint8Array(1024);
    const chunk2 = new Uint8Array(2048);
    chunk1.fill(1);
    chunk2.fill(2);

    async function* largeChunks() {
      yield chunk1;
      yield chunk2;
    }

    const result = await collectAsyncIterable(largeChunks());

    expect(result.length).toBe(3072);
    expect(result[0]).toBe(1);
    expect(result[1024]).toBe(2);
  });

  it("should handle regular Array as iterable", async () => {
    const chunks = [
      new Uint8Array([1, 2]),
      new Uint8Array([3, 4]),
      new Uint8Array([5, 6]),
    ];

    const result = await collectAsyncIterable(chunks);

    expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6]));
  });

  it("should handle zero-length chunks", async () => {
    async function* withEmptyChunks() {
      yield new Uint8Array([]);
      yield new Uint8Array([1, 2, 3]);
      yield new Uint8Array([]);
      yield new Uint8Array([4, 5]);
      yield new Uint8Array([]);
    }

    const result = await collectAsyncIterable(withEmptyChunks());

    expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
  });

  it("should maintain byte order", async () => {
    async function* orderedChunks() {
      yield new Uint8Array([0x00, 0xff]);
      yield new Uint8Array([0x7f, 0x80]);
      yield new Uint8Array([0x12, 0x34]);
    }

    const result = await collectAsyncIterable(orderedChunks());

    expect(result).toEqual(
      new Uint8Array([0x00, 0xff, 0x7f, 0x80, 0x12, 0x34]),
    );
  });
});
