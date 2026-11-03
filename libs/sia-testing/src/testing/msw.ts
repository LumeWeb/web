/** Scoped MSW routes use the same credential-aware dispatcher as a loopback server. */
import { http, HttpResponse } from "msw";
import { isLostReply } from "./reply-loss.js";
import { createMockEndpoint } from "./transport.js";
import type { MockSia } from "./types.js";

export function createMockHandlers(
  mock: MockSia,
  options: { baseUrl: string },
) {
  const configured = createMockEndpoint(mock, options.baseUrl);
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
