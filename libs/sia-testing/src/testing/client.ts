/** Fetch-backed read ports expose cancellation before the server sends headers. */
import { domainError } from "./diagnostics.js";
import type { MockCredential } from "./runtime.js";
import type { MockConnection } from "./transport.js";
import type { ReadObject, ReadPort } from "./types.js";

export function createMockCalls(
  connection: MockConnection,
  credential: MockCredential,
) {
  const root = new URL(connection.url);
  if (
    !["http:", "https:"].includes(root.protocol) ||
    root.username ||
    root.password ||
    !/^[a-f0-9]{64}$/.test(credential.keyHex)
  )
    throw new Error("Invalid mock connection");
  const lifetime = new AbortController();
  const call = async (
    operation: string,
    query: Record<string, number | string>,
    signal?: AbortSignal,
  ) => {
    lifetime.signal.throwIfAborted();
    const url = new URL(
      `${encodeURIComponent(connection.client)}/${operation}`,
      root,
    );
    for (const [key, value] of Object.entries(query))
      url.searchParams.set(key, String(value));
    const response = await fetch(url, {
      headers: { authorization: `Bearer ${credential.keyHex}` },
      redirect: "error",
      signal: signal
        ? AbortSignal.any([signal, lifetime.signal])
        : lifetime.signal,
    });
    if (!response.ok) {
      const value: unknown = await response.json();
      throw domainError(operation, value);
    }
    return response;
  };
  return { call, lifetime };
}
export function createMockReader(
  connection: MockConnection,
  credential: MockCredential,
): ReadPort {
  const { call, lifetime } = createMockCalls(connection, credential);
  return {
    close() {
      lifetime.abort();
      return Promise.resolve();
    },
    download(object, range = {}) {
      const abort = new AbortController();
      const signal = AbortSignal.any([
        lifetime.signal,
        abort.signal,
        ...(range.signal ? [range.signal] : []),
      ]);
      let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
      let stopped = false;
      const stream = new ReadableStream<Uint8Array>(
        {
          cancel(reason) {
            stopped = true;
            abort.abort();
            return reader?.cancel(reason);
          },
          async pull(controller) {
            try {
              if (!reader) {
                const response = await call(
                  "download",
                  {
                    id: object.id,
                    ...(range.offset === undefined
                      ? {}
                      : { offset: range.offset }),
                    ...(range.length === undefined
                      ? {}
                      : { length: range.length }),
                  },
                  signal,
                );
                if (stopped) {
                  await response.body?.cancel();
                  return;
                }
                if (!response.body)
                  throw new Error("Missing mock response body");
                reader = response.body.getReader();
              }
              const next = await reader.read();
              if (stopped) return;
              if (next.done) {
                stopped = true;
                reader.releaseLock();
                controller.close();
              } else controller.enqueue(next.value);
            } catch (error) {
              if (!stopped) {
                stopped = true;
                controller.error(error);
              }
            }
          },
        },
        { highWaterMark: 0 },
      );
      return Promise.resolve(stream);
    },
    async object(id, options = {}) {
      return readObject(
        await (await call("object", { id }, options.signal)).json(),
      );
    },
    async objects(input) {
      const value = (await (
        await call(
          "objects",
          { limit: input.limit, offset: input.offset },
          input.signal,
        )
      ).json()) as {
        done: boolean;
        nextOffset: number;
        objects: unknown[];
      };
      return { ...value, objects: value.objects.map(readObject) };
    },
  };
}
export function readObject(value: unknown): ReadObject {
  if (
    !value ||
    typeof value !== "object" ||
    !("id" in value) ||
    typeof value.id !== "string" ||
    !("sizeBytes" in value) ||
    !Number.isSafeInteger(value.sizeBytes) ||
    Number(value.sizeBytes) < 0 ||
    !("metadata" in value) ||
    !Array.isArray(value.metadata) ||
    !value.metadata.every(
      (byte: unknown) =>
        Number.isInteger(byte) && Number(byte) >= 0 && Number(byte) <= 255,
    )
  )
    throw new Error("Invalid mock object response");
  return {
    id: value.id,
    metadata: Uint8Array.from(value.metadata as number[]),
    sizeBytes: Number(value.sizeBytes),
  };
}
