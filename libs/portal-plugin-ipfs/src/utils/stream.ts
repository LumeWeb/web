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