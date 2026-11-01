/** Fetch-backed payload SDK for app processes sharing a test server. */
import type { MockCallOptions, MockSdk } from "./index.js";
import { createMockObject, type MockObject } from "./object.js";
import type { MockOperation } from "./control.js";
import { MOCK_SDK_PATH, mockMethods } from "./protocol.js";

export interface RemoteMockSdkOptions {
  client: string;
  url: string | URL;
}

/** Client names select server-bound mock identities, not credentials for a real Sia SDK. */
export function createRemoteMockSdk(options: RemoteMockSdkOptions): MockSdk {
  const base = new URL(options.url);
  if (
    !options.client ||
    !["http:", "https:"].includes(base.protocol) ||
    base.username ||
    base.password
  )
    throw new Error(
      "a mock client and HTTP server URL without credentials are required",
    );
  const root = new URL(
    `${MOCK_SDK_PATH}${encodeURIComponent(options.client)}/`,
    base,
  );

  async function call(
    operation: MockOperation,
    id?: string,
    options: MockCallOptions = {},
    body?: Uint8Array,
    range?: { length?: number; offset?: number },
  ): Promise<Response> {
    const url = new URL(operation, root);
    if (id !== undefined) url.searchParams.set("id", id);
    if (range?.offset !== undefined)
      url.searchParams.set("offset", String(range.offset));
    if (range?.length !== undefined)
      url.searchParams.set("length", String(range.length));
    const response = await fetch(url, {
      ...(body ? { body: body.slice().buffer } : {}),
      method: mockMethods[operation],
      redirect: "error",
      ...(options.signal ? { signal: options.signal } : {}),
    });
    if (!response.ok) {
      const value: unknown = await response.json();
      const error = value as { error?: unknown };
      throw new Error(
        typeof error?.error === "string"
          ? error.error
          : `mock request failed (${response.status})`,
      );
    }
    return response;
  }

  async function objectResponse(response: Response): Promise<MockObject> {
    const value: unknown = await response.json();
    const record = value as { id?: unknown; size?: unknown };
    if (typeof record?.id !== "string" || typeof record?.size !== "number")
      throw new Error("invalid mock object response");
    return createMockObject(record.id, record.size);
  }

  return {
    async deleteObject(id, options) {
      await call("deleteObject", id, options);
    },
    download(object, options = {}) {
      if (options.signal?.aborted)
        return Promise.reject(
          new DOMException("mock download cancelled", "AbortError"),
        );
      const abort = new AbortController();
      let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
      let stopped = false;
      let onAbort: (() => void) | undefined;
      const detach = () => {
        if (onAbort) options.signal?.removeEventListener("abort", onAbort);
      };
      // Firefox can wait for body bytes before resolving fetch. Expose cancellation
      // before that wait so a replaced source can abort a held or paced request.
      const stream = new ReadableStream<Uint8Array>({
        async cancel(reason: unknown) {
          stopped = true;
          detach();
          abort.abort();
          await reader?.cancel(reason).catch(() => undefined);
        },
        async pull(controller) {
          try {
            if (!reader) {
              const response = await call(
                "download",
                object.id(),
                { signal: abort.signal },
                undefined,
                options,
              );
              if (stopped) {
                await response.body?.cancel();
                return;
              }
              if (!response.body)
                throw new Error("mock download response has no body");
              reader = response.body.getReader();
            }
            const next = await reader.read();
            if (stopped) return;
            if (next.done) {
              stopped = true;
              detach();
              reader.releaseLock();
              controller.close();
            } else controller.enqueue(next.value);
          } catch (error) {
            if (stopped) return;
            stopped = true;
            detach();
            abort.abort();
            controller.error(error);
          }
        },
        start(controller) {
          onAbort = () => {
            stopped = true;
            detach();
            abort.abort();
            controller.error(
              new DOMException("mock download cancelled", "AbortError"),
            );
            void reader?.cancel().catch(() => undefined);
          };
          options.signal?.addEventListener("abort", onAbort, { once: true });
        },
      });
      return Promise.resolve(stream);
    },
    async object(id, options) {
      return objectResponse(await call("object", id, options));
    },
    async pinObject(object, options) {
      await call("pinObject", object.id(), options);
    },
    async pruneSlabs(options) {
      await call("pruneSlabs", undefined, options);
    },
    async upload(bytes, options) {
      return objectResponse(await call("upload", options.id, options, bytes));
    },
  };
}
