/** Owned HTTP fixtures check exact resource URLs and deadlines through real fetch calls. */
import { once } from "node:events";
import { createServer, type RequestListener } from "node:http";
import { expect, it, onTestFinished, vi } from "vitest";
import {
  approveIndexd,
  cleanupIndexd,
  provisionIndexd,
} from "../../src/e2e/internal/indexd-provision.mjs";

const fetchImpl = (url: URL, init: RequestInit) => fetch(url, init);
const provisioning = {
  appID: "ab".repeat(32),
  fetchImpl,
  password: "fixture-only",
  recovery: { persist: () => Promise.resolve() },
};

/** Expire the current request on fixture events instead of waiting for the production timer. */
function controlledDeadline() {
  let controller: AbortController | undefined;
  const timeout = vi.spyOn(AbortSignal, "timeout").mockImplementation(() => {
    controller = new AbortController();
    return controller.signal;
  });
  onTestFinished(() => {
    timeout.mockRestore();
  });
  return () =>
    controller?.abort(new DOMException("Fixture deadline", "TimeoutError"));
}

/** Let the caller start consuming the real response before expiring its request. */
function expireReadingBody(response: Response, expire: () => void) {
  return new Promise<boolean>((resolve) => {
    setImmediate(() => {
      const reading = response.bodyUsed;
      expire();
      resolve(reading);
    });
  });
}

/** Missing abort support must fail an assertion without hanging the test or leaking its request. */
async function requestFailure(operation: Promise<unknown>): Promise<unknown> {
  const settled = operation.catch((error: unknown) => error);
  // withServer closes the stalled sockets before test-finished hooks settle their requests.
  onTestFinished(async () => {
    await settled;
  });
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      settled,
      new Promise<undefined>((resolve) => {
        timer = setTimeout(() => resolve(undefined), 500);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/** Each fixture owns its sockets so failed transport assertions cannot leave a listener behind. */
async function withServer(
  handle: RequestListener,
  run: (adminURL: string, requests: string[]) => Promise<void>,
) {
  const requests: string[] = [];
  const server = createServer((request, response) => {
    requests.push(`${request.method} ${request.url}`);
    handle(request, response);
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("Owned HTTP fixture did not start");
    await run(`http://127.0.0.1:${address.port}`, requests);
  } finally {
    const closed = new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    server.closeAllConnections();
    await closed;
  }
}

it("rejects a redirected absence check without attempting creation", async () => {
  await withServer(
    (request, response) => {
      if (request.url === "/not-owned") response.writeHead(404).end();
      else response.writeHead(307, { location: "/not-owned" }).end();
    },
    async (adminURL, requests) => {
      const failure = await requestFailure(
        provisionIndexd({ ...provisioning, adminURL }),
      );
      expect(failure).toBeInstanceOf(Error);
      expect(requests).toHaveLength(1);
      expect(requests[0]).toMatch(/^GET \/api\/quotas\//);
    },
  );
});

it("rejects a redirected quota creation without contacting another resource", async () => {
  await withServer(
    (request, response) => {
      if (request.url === "/not-owned") response.writeHead(204).end();
      else if (request.method === "GET") response.writeHead(404).end();
      else response.writeHead(307, { location: "/not-owned" }).end();
    },
    async (adminURL, requests) => {
      const failure = await requestFailure(
        provisionIndexd({ ...provisioning, adminURL }),
      );
      expect(failure).toBeInstanceOf(Error);
      expect(requests).toHaveLength(3);
      expect(requests[2]).toMatch(/^PUT \/api\/quotas\//);
    },
  );
});

it("rejects a redirected delete without contacting another resource", async () => {
  await withServer(
    (request, response) => {
      if (request.url === "/not-owned") response.writeHead(204).end();
      else response.writeHead(307, { location: "/not-owned" }).end();
    },
    async (adminURL, requests) => {
      const failure = await requestFailure(
        cleanupIndexd({
          adminURL,
          created: { quota: true },
          fetchImpl,
          password: "fixture-only",
          quotaKey: "owned-quota",
        }),
      );
      expect(failure).toBeInstanceOf(Error);
      expect(requests).toEqual(["DELETE /api/quotas/owned-quota"]);
    },
  );
});

it("aborts an absence check stalled before response headers", async () => {
  const expire = controlledDeadline();
  await withServer(
    () => expire(),
    async (adminURL, requests) => {
      const failure = await requestFailure(
        provisionIndexd({ ...provisioning, adminURL }),
      );
      expect(failure).toBeInstanceOf(Error);
      expect(requests).toHaveLength(1);
      expect(requests[0]).toMatch(/^GET \/api\/quotas\//);
    },
  );
});

it("aborts a quota creation while reading its response body", async () => {
  const expire = controlledDeadline();
  let reading: Promise<boolean> | undefined;
  const fetchQuota = async (url: URL, init: RequestInit) => {
    const response = await fetchImpl(url, init);
    if (init.method === "PUT") reading = expireReadingBody(response, expire);
    return response;
  };
  await withServer(
    (request, response) => {
      if (request.method === "GET") response.writeHead(404).end();
      else {
        response.writeHead(200, { "content-type": "application/json" });
        response.write("{");
      }
    },
    async (adminURL, requests) => {
      const failure = await requestFailure(
        provisionIndexd({ ...provisioning, adminURL, fetchImpl: fetchQuota }),
      );
      expect(failure).toBeInstanceOf(Error);
      expect(await reading).toBe(true);
      expect(requests).toHaveLength(3);
      expect(requests[2]).toMatch(/^PUT \/api\/quotas\//);
    },
  );
});

it("continues key and quota cleanup after an account delete body times out", async () => {
  const expire = controlledDeadline();
  let reading: Promise<boolean> | undefined;
  const fetchAccount = async (url: URL, init: RequestInit) => {
    const response = await fetchImpl(url, init);
    if (url.pathname.startsWith("/api/account/"))
      reading = expireReadingBody(response, expire);
    return response;
  };
  await withServer(
    (request, response) => {
      if (request.url?.startsWith("/api/account/")) {
        response.writeHead(200, { "content-type": "application/json" });
        response.write("{");
      } else response.writeHead(204).end();
    },
    async (adminURL, requests) => {
      const failure = await requestFailure(
        cleanupIndexd({
          accountKey: `ed25519:${"ab".repeat(32)}`,
          adminURL,
          created: { connectKey: "fixture-connect", quota: true },
          fetchImpl: fetchAccount,
          password: "fixture-only",
          quotaKey: "owned-quota",
        }),
      );
      expect(failure).toBeInstanceOf(Error);
      expect(await reading).toBe(true);
      expect(requests).toEqual([
        `DELETE /api/account/ed25519%3A${"ab".repeat(32)}`,
        "DELETE /api/apps/connect/keys/fixture-connect",
        "DELETE /api/quotas/owned-quota",
      ]);
    },
  );
});

it("aborts an approval stalled before response headers", async () => {
  const expire = controlledDeadline();
  await withServer(
    () => expire(),
    async (adminURL, requests) => {
      const failure = await requestFailure(
        approveIndexd({
          connectKey: "fixture-connect",
          fetchImpl,
          indexdURL: adminURL,
          responseURL: `${adminURL}/auth/connect/owned`,
        }),
      );
      expect(failure).toBeInstanceOf(Error);
      expect(requests).toEqual(["POST /auth/connect/owned"]);
    },
  );
});
