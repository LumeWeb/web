/** Approval tests keep both the credential recipient and redirect destination on owned loopback listeners. */
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { approveLiveConnection } from "../../src/testing/live/approval.js";
import { loadLiveProfile } from "../../src/testing/live/profile.js";
async function fixture(
  handle: (
    request: IncomingMessage,
    body: unknown,
  ) => { body?: string; location?: string; status: number },
) {
  let requests = 0;
  const server = createServer((request, response) => {
    void respond(request, response).catch(() => response.destroy());
  });
  async function respond(request: IncomingMessage, response: ServerResponse) {
    requests++;
    const chunks: Buffer[] = [];
    for await (const chunk of request as AsyncIterable<Buffer>)
      chunks.push(chunk);
    const text = Buffer.concat(chunks).toString();
    const result = handle(
      request,
      text ? (JSON.parse(text) as unknown) : undefined,
    );
    response
      .writeHead(
        result.status,
        result.location ? { location: result.location } : {},
      )
      .end(result.body ?? "null");
  }
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Missing loopback address");
  const url = `http://127.0.0.1:${address.port}/prefix/`;
  const directory = await mkdtemp(join(tmpdir(), "sia-approval-"));
  const path = join(directory, "profile.json");
  await writeFile(
    path,
    JSON.stringify({
      apiBaseUrl: url,
      app: {
        description: "Loopback auth",
        id: "0".repeat(64),
        name: "Auth",
        serviceUrl: "https://example.invalid",
      },
      auth: {
        connectKey: "synthetic-connect-key",
        kind: "register",
        phrase: "synthetic private phrase",
      },
      encoding: { dataShards: 1, maxBufferedSlabs: 1, parityShards: 0 },
      version: 1,
    }),
    { mode: 0o600 },
  );
  const profile = await loadLiveProfile(path, {
    apiBaseUrl: url,
    mutations: true,
    transfers: true,
  });
  return {
    async close() {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
      await rm(directory, { force: true, recursive: true });
    },
    profile,
    requests: () => requests,
    url,
  };
}
it("approval uses the connect key as the Basic password and sends an explicit decision", async () => {
  let received:
    | undefined
    | {
        basic: string;
        body: unknown;
        method: string | undefined;
        path: string | undefined;
      };
  const server = await fixture((request, body) => {
    received = {
      basic: Buffer.from(
        (request.headers.authorization ?? "").replace(/^Basic /, ""),
        "base64",
      ).toString(),
      body,
      method: request.method,
      path: request.url,
    };
    return { status: 200 };
  });
  try {
    await approveLiveConnection(
      server.profile,
      new URL("auth/connect/request-1", server.url).href,
    );
    expect(received).toEqual({
      basic: ":synthetic-connect-key",
      body: { approve: true },
      method: "POST",
      path: "/prefix/auth/connect/request-1",
    });
    await approveLiveConnection(
      server.profile,
      new URL("auth/connect/request-1", server.url).href,
      false,
    );
    expect(received?.body).toEqual({ approve: false });
  } finally {
    await server.close();
  }
});
it.each([
  "other/request-1",
  "auth/connect/request-1/status",
  "auth/connect/request-1?redirect=yes",
  "auth/connect/request-1#fragment",
])("unexpected approval URL %s causes no request", async (suffix) => {
  const server = await fixture(() => ({ status: 200 }));
  try {
    await expect(
      approveLiveConnection(server.profile, new URL(suffix, server.url).href),
    ).rejects.toMatchObject({ code: "invalid-approval" });
    expect(server.requests()).toBe(0);
  } finally {
    await server.close();
  }
});
it("approval never follows a redirect to another owned listener", async () => {
  const target = await fixture(() => ({ status: 200 }));
  const origin = await fixture(() => ({
    location: new URL("auth/connect/request-1", target.url).href,
    status: 307,
  }));
  try {
    await expect(
      approveLiveConnection(
        origin.profile,
        new URL("auth/connect/request-1", origin.url).href,
      ),
    ).rejects.toMatchObject({ code: "approval-denied" });
    expect(target.requests()).toBe(0);
    await expect(
      approveLiveConnection(
        origin.profile,
        new URL("auth/connect/request-1", target.url).href,
      ),
    ).rejects.toMatchObject({ code: "invalid-approval" });
    expect(target.requests()).toBe(0);
  } finally {
    await origin.close();
    await target.close();
  }
});
it("a server rejection cannot echo its credential-bearing response body", async () => {
  const server = await fixture(() => ({
    body: "synthetic-connect-key synthetic private phrase",
    status: 403,
  }));
  try {
    const failure: unknown = await approveLiveConnection(
      server.profile,
      new URL("auth/connect/request-1", server.url).href,
    ).catch((error: unknown) => error);
    expect(failure).toMatchObject({ code: "approval-denied" });
    expect(String(failure)).not.toContain("synthetic");
  } finally {
    await server.close();
  }
});
