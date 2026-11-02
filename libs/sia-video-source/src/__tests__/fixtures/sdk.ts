/** In-memory byte windows keep reader unit tests independent of accounts and transports. */
import type { SiaObjectLike, SiaSdkLike } from "../../ranged-reader.js";
export function fakeObject(size: number): SiaObjectLike {
  return {
    id: () => "test-object",
    size: () => size,
    slabs: () =>
      size === 0
        ? []
        : [
            {
              encryptionKey: "",
              length: size,
              minShards: 1,
              offset: 0,
              sectors: [],
              version: 1,
            },
          ],
  };
}
export function fakeSdk(payload: Uint8Array): SiaSdkLike {
  return {
    download(_object, { length = payload.length, offset = 0 } = {}) {
      const bytes = payload.slice(offset, offset + length);
      let position = 0;
      return new ReadableStream<Uint8Array>(
        {
          pull(controller) {
            if (position >= bytes.length) {
              controller.close();
              return;
            }
            const end = Math.min(position + 64 * 1024, bytes.length);
            controller.enqueue(bytes.slice(position, end));
            position = end;
          },
        },
        { highWaterMark: 0 },
      );
    },
  };
}
