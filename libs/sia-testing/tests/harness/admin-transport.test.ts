/** Owned HTTP fixtures check that admin transport cannot leave the recorded resource URLs. */
import { once } from "node:events";
import { createServer, type RequestListener } from "node:http";
import { expect, it } from "vitest";
import {
  cleanupIndexd,
  provisionIndexd,
} from "../../src/e2e/internal/indexd-provision.mjs";

const fetchImpl = (url: URL, init: RequestInit) => fetch(url, init);

/** Each fixture owns its sockets so failed transport assertions cannot leave a listener behind. */
async function withServer(
  handle: RequestListener,
  run: (adminURL: string) => Promise<void>,
) {
  const server = createServer(handle);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("Owned HTTP fixture did not start");
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    const closed = new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    server.closeAllConnections();
    await closed;
  }
}

it.each(["absence", "creation", "cleanup"])(
  "refuses redirected admin %s requests without contacting another resource",
  async (phase) => {
    const requests: string[] = [];
    await withServer(
      (request, response) => {
        requests.push(`${request.method} ${request.url}`);
        if (request.url === "/not-owned") {
          response.writeHead(phase === "absence" ? 404 : 204).end();
        } else if (
          (phase === "absence" && request.method === "GET") ||
          (phase === "creation" && request.method === "PUT") ||
          (phase === "cleanup" && request.method === "DELETE")
        ) {
          response.writeHead(307, { location: "/not-owned" }).end();
        } else if (request.method === "GET") {
          response.writeHead(404).end();
        } else if (request.method === "POST") {
          response.setHeader("content-type", "application/json");
          request.pipe(response);
        } else {
          response.writeHead(204).end();
        }
      },
      async (adminURL) => {
        const operation =
          phase === "cleanup"
            ? cleanupIndexd({
                adminURL,
                created: { quota: true },
                fetchImpl,
                password: "fixture-only",
                quotaKey: "owned-quota",
              })
            : provisionIndexd({
                adminURL,
                appID: "ab".repeat(32),
                fetchImpl,
                password: "fixture-only",
                recovery: { persist: () => Promise.resolve() },
              });
        const failure: unknown = await operation.catch(
          (error: unknown) => error,
        );
        expect(
          requests.some((request) => request.endsWith(" /not-owned")),
        ).toBe(false);
        expect(failure).toBeInstanceOf(Error);
        if (phase === "absence")
          expect(requests.every((request) => request.startsWith("GET "))).toBe(
            true,
          );
      },
    );
  },
);
