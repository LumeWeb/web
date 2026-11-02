/** Scoped MSW routes use the same credential-aware dispatcher as a loopback server. */
import { http } from "msw";
import { createMockEndpoint } from "./transport.js";
import type { MockSia } from "./types.js";

export function createMockHandlers(
  mock: MockSia,
  options: { baseUrl: string },
) {
  const configured = createMockEndpoint(mock, options.baseUrl);
  return {
    ...configured.endpoint,
    handlers: [
      http.all(`${configured.endpoint.url}*`, ({ request }) =>
        configured.dispatch(request),
      ),
    ],
  };
}
