/** Owned HTTP fixtures check that admin transport cannot leave the recorded resource URLs. */
import { once } from "node:events";
import { createServer, type RequestListener } from "node:http";
import { expect, it, vi } from "vitest";
import {
  approveIndexd,
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

it.each(["absence", "quota-body", "cleanup-body", "approval"])(
  "aborts stalled admin %s requests",
  async (phase) => {
    const requests: string[] = [];
    let deadline: AbortController | undefined;
    let operation: Promise<unknown> | undefined;
    let bodyReadStarted = false;
    const timeout = vi.spyOn(AbortSignal, "timeout").mockImplementation(() => {
      deadline = new AbortController();
      return deadline.signal;
    });
    // Body deadlines fire after fetch returns headers, while the real body read is pending.
    const timedFetch = async (url: URL, init: RequestInit) => {
      const response = await fetchImpl(url, init);
      if (
        phase.endsWith("body") &&
        (init.method === "PUT" || url.pathname.startsWith("/api/account/"))
      ) {
        const controller = deadline;
        setImmediate(() => {
          bodyReadStarted = response.bodyUsed;
          controller?.abort(
            new DOMException("Fixture deadline", "TimeoutError"),
          );
        });
      }
      return response;
    };
    try {
      await withServer(
        (request, response) => {
          requests.push(`${request.method} ${request.url}`);
          if (
            (phase === "absence" && request.method === "GET") ||
            (phase === "approval" && request.method === "POST") ||
            (phase === "quota-body" && request.method === "PUT") ||
            (phase === "cleanup-body" &&
              request.url?.startsWith("/api/account/"))
          ) {
            if (phase.endsWith("body")) {
              response.writeHead(200, { "content-type": "application/json" });
              response.write("{");
            } else {
              deadline?.abort(
                new DOMException("Fixture deadline", "TimeoutError"),
              );
            }
          } else {
            response.writeHead(request.method === "GET" ? 404 : 204).end();
          }
        },
        async (adminURL) => {
          if (phase === "approval") {
            operation = approveIndexd({
              connectKey: "fixture-connect",
              fetchImpl: timedFetch,
              indexdURL: adminURL,
              responseURL: `${adminURL}/auth/connect/owned`,
            });
          } else if (phase === "cleanup-body") {
            operation = cleanupIndexd({
              accountKey: `ed25519:${"ab".repeat(32)}`,
              adminURL,
              created: { connectKey: "fixture-connect", quota: true },
              fetchImpl: timedFetch,
              password: "fixture-only",
              quotaKey: "owned-quota",
            });
          } else {
            operation = provisionIndexd({
              adminURL,
              appID: "ab".repeat(32),
              fetchImpl: timedFetch,
              password: "fixture-only",
              recovery: { persist: () => Promise.resolve() },
            });
          }
          let timer: ReturnType<typeof setTimeout> | undefined;
          try {
            const failure: unknown = await Promise.race([
              operation.catch((error: unknown) => error),
              new Promise<"pending">((resolve) => {
                timer = setTimeout(() => resolve("pending"), 500);
              }),
            ]);
            expect(failure).toBeInstanceOf(Error);
            if (phase.endsWith("body")) expect(bodyReadStarted).toBe(true);
            if (phase === "cleanup-body")
              expect(requests).toEqual([
                `DELETE /api/account/ed25519%3A${"ab".repeat(32)}`,
                "DELETE /api/apps/connect/keys/fixture-connect",
                "DELETE /api/quotas/owned-quota",
              ]);
            if (phase === "absence")
              expect(
                requests.every((request) => request.startsWith("GET ")),
              ).toBe(true);
          } finally {
            clearTimeout(timer);
          }
        },
      );
    } finally {
      await operation?.catch(() => undefined);
      timeout.mockRestore();
    }
  },
);
