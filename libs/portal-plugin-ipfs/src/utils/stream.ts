/**
 * Convert a ReadableStream to a Blob
 * @param readableStream - The stream to convert
 * @param mimeType - Optional MIME type for the resulting blob
 * @returns Promise that resolves to a Blob
 */
export async function streamToBlob(
  readableStream: ReadableStream<any>,
  mimeType?: string,
): Promise<Blob> {
  const response = new Response(readableStream);
  const blob = await response.blob();
  return mimeType !== undefined ? new Blob([blob], { type: mimeType }) : blob;
}

/**
 * Convert a ReadableStream to an AsyncIterable
 * @param readableStream - The stream to convert
 * @returns AsyncIterable that yields chunks from the stream
 */
export function readableStreamToAsyncIterable<T>(
  readableStream: ReadableStream<T>,
): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator]: async function* () {
      const reader = readableStream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          yield value;
        }
      } finally {
        reader.releaseLock();
      }
    },
  };
}

/**
 * Calculate the total size of a ReadableStream by consuming it entirely
 * @param stream - The ReadableStream<Uint8Array> to calculate size for
 * @param onProgress - Optional callback to report progress (0% at start, 100% at end)
 * @param abortSignal - Optional abort signal to cancel the operation
 * @returns Promise that resolves to the total size as bigint
 */
export async function calculateStreamSize(
  stream: ReadableStream<Uint8Array>,
  onProgress?: (progress: number) => void,
  abortSignal?: AbortSignal
): Promise<bigint> {
  let size = 0n;
  const reader = stream.getReader();
  
  try {
    // Report 0% progress at the start if callback provided
    if (onProgress) {
      onProgress(0);
    }
    
    while (true) {
      // Check for abort signal
      if (abortSignal?.aborted) {
        throw new Error("Operation aborted");
      }
      
      const { done, value } = await reader.read();
      if (done) break;
      
      size += BigInt(value.byteLength);
    }
    
    // Report 100% progress at the end if callback provided
    if (onProgress) {
      onProgress(100);
    }
  } catch (err) {
    throw err;
  } finally {
    reader.releaseLock();
  }
  return size;
}

/**
 * Convert an AsyncGenerator to a ReadableStream
 * @param asyncGenerator - The async generator to convert
 * @param abortSignal - Optional abort signal to cancel the stream
 * @returns ReadableStream that yields values from the async generator
 */
export function asyncGeneratorToReadableStream<T>(
  asyncGenerator: AsyncGenerator<T>,
  abortSignal?: AbortSignal,
): ReadableStream<T> {
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of asyncGenerator) {
          // Check if operation was aborted
          if (abortSignal?.aborted) {
            controller.error(new Error("Operation aborted"));
            return;
          }

          controller.enqueue(chunk);
        }

        // Check if operation was aborted before closing
        if (abortSignal?.aborted) {
          controller.error(new Error("Operation aborted"));
        } else {
          controller.close();
        }
      } catch (err) {
        // Handle abort errors specifically
        if (abortSignal?.aborted) {
          controller.error(new Error("Operation aborted"));
        } else {
          controller.error(err);
        }
      }
    },
  });
}
