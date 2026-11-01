/** Byte fixtures for browser and Node SDK tests, without a transport replacement. */
export const byteSource = (
  bytes: Iterable<number>,
): ReadableStream<Uint8Array> =>
  new ReadableStream({
    start(controller) {
      controller.enqueue(Uint8Array.from(bytes));
      controller.close();
    },
  });

export async function readBytes<T, Options>(
  sdk: { download(object: T, options?: Options): ReadableStream<Uint8Array> },
  object: T,
  options?: Options,
): Promise<number[]> {
  const reader = sdk.download(object, options).getReader();
  const bytes: number[] = [];
  try {
    for (;;) {
      const item = await reader.read();
      if (item.done) return bytes;
      bytes.push(...item.value);
    }
  } finally {
    reader.releaseLock();
  }
}
