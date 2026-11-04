/** Scoped MSW routes use the same credential-aware dispatcher as a loopback server. */
import { http, HttpResponse } from "msw";
import { isLostReply } from "./reply-loss.js";
import { createMockEndpoint } from "./transport.js";
import type { MockSia } from "./types.js";

export function createMockHandlers(
  mock: MockSia,
  options: { baseUrl: string },
) {
  const configured = createMockEndpoint(mock, options.baseUrl, applicationBody);
  return {
    ...configured.endpoint,
    close: () => configured.close(),
    handlers: [
      http.all(`${configured.endpoint.url}*`, async ({ request }) => {
        try {
          return await configured.dispatch(request);
        } catch (error) {
          if (isLostReply(error)) return HttpResponse.error();
          throw error;
        }
      }),
    ],
  };
}

/** MSW owns a logging clone, so upstream cancellation cannot be joined by the resolver. */
function applicationBody(request: Request): null | ReadableStream<Uint8Array> {
  const body = request.body;
  if (!body) return null;
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let stopped = false;
  const release = () => {
    reader?.releaseLock();
    reader = undefined;
  };
  return new ReadableStream<Uint8Array>(
    {
      cancel(reason) {
        stopped = true;
        reader ??= body.getReader();
        // cancel closes this branch synchronously; its promise also waits for MSW's sibling.
        void reader.cancel(reason).catch(() => undefined);
        release();
      },
      async pull(controller) {
        reader ??= body.getReader();
        try {
          const next = await reader.read();
          if (stopped) return;
          if (next.done) {
            stopped = true;
            controller.close();
            release();
          } else controller.enqueue(next.value);
        } catch (error) {
          if (!stopped) {
            stopped = true;
            controller.error(error);
            release();
          }
        }
      },
    },
    { highWaterMark: 0 },
  );
}
