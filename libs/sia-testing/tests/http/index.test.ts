import { createServer, type IncomingMessage } from "node:http";
import { createConnection } from "node:net";
import { once } from "node:events";
import { credentials, owner } from "../fixtures/auth.js";
import { afterEach, describe, expect, it } from "vitest";
import {
  createIndexdHttpServer,
  type IndexdHttpServer,
} from "../../src/http/index.js";

const servers: IndexdHttpServer[] = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
});

describe("Indexd HTTP server", () => {
  it("removes the listen error handler after a successful start", async () => {
    const server = createIndexdHttpServer();
    servers.push(server);
    await server.listen();
    expect(server.server.listenerCount("error")).toBe(0);
  });

  it("removes the listening handler after a failed start", async () => {
    const occupied = createIndexdHttpServer();
    servers.push(occupied);
    const { port } = await occupied.listen();
    const native = createServer();
    const failed = once(native, "error");
    native.listen(port, "127.0.0.1");
    await failed;
    const server = createIndexdHttpServer();
    await expect(server.listen(port)).rejects.toMatchObject({
      code: "EADDRINUSE",
    });
    // Node retains its own listening handler after EADDRINUSE; the adapter must add none.
    expect(server.server.listenerCount("listening")).toBe(
      native.listenerCount("listening"),
    );
    await server.listen();
    servers.push(server);
  });

  it("leaves a running server usable after a second listen rejects", async () => {
    const server = createIndexdHttpServer();
    servers.push(server);
    server.model.createAccount({ publicKey: owner });
    const { port } = await server.listen();
    await expect(server.listen()).rejects.toMatchObject({
      code: "ERR_SERVER_ALREADY_LISTEN",
    });
    expect(server.server.listenerCount("error")).toBe(0);
    const response = await fetch(
      `http://127.0.0.1:${port}/account?${credentials()}`,
    );
    expect(response.status).toBe(200);
    await response.body?.cancel();
  });

  it("keeps serving after a client aborts a request body", async () => {
    const server = createIndexdHttpServer();
    servers.push(server);
    server.model.createAccount({ publicKey: owner });
    const { port } = await server.listen();
    const accepted = new Promise<IncomingMessage>((resolve) =>
      server.server.once("request", resolve),
    );
    const socket = createConnection({ host: "127.0.0.1", port });
    try {
      await once(socket, "connect");
      socket.write(
        "POST /slabs HTTP/1.1\r\nHost: 127.0.0.1\r\nContent-Length: 100\r\n\r\n{",
      );
      const incoming = await accepted;
      const closed = new Promise<void>((resolve) =>
        incoming.once("close", resolve),
      );
      socket.destroy();
      await closed;
      const response = await fetch(
        `http://127.0.0.1:${port}/account?${credentials()}`,
      );
      expect(response.status).toBe(200);
      await response.body?.cancel();
      expect(server.model.listSlabs(owner)).toEqual([]);
    } finally {
      socket.destroy();
    }
  });

  it("rejects an oversized body before the model changes", async () => {
    const server = createIndexdHttpServer({ maxBodyBytes: 1 });
    servers.push(server);
    server.model.createAccount({ publicKey: owner });
    const { port } = await server.listen();
    const response = await fetch(
      `http://127.0.0.1:${port}/slabs?${credentials()}`,
      {
        body: JSON.stringify({ id: "slab", size: 1 }),
        method: "POST",
      },
    );
    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({
      error: "request body too large",
    });
    expect(server.model.listSlabs(owner)).toEqual([]);
  });

  it("returns an error response when an asynchronous response hook rejects", async () => {
    const server = createIndexdHttpServer({
      responseOverride: () =>
        Promise.reject(new Error("private response failure")),
    });
    servers.push(server);
    server.model.createAccount({ publicKey: owner });
    const { port } = await server.listen();
    const response = await fetch(
      `http://127.0.0.1:${port}/slabs?${credentials()}`,
      {
        body: JSON.stringify({ id: "slab", size: 1 }),
        headers: { "content-type": "application/json" },
        method: "POST",
        signal: AbortSignal.timeout(1000),
      },
    ).catch(() => undefined);
    expect(response?.status).toBe(500);
    await expect(response?.json()).resolves.toEqual({
      error: "internal error",
    });
    expect(server.model.listSlabs(owner)).toEqual([{ id: "slab", size: 1 }]);
  });

  it("discards failed response headers before sending an error", async () => {
    const server = createIndexdHttpServer({
      responseOverride: () =>
        new Response(
          new ReadableStream({
            start(controller) {
              controller.error(new Error("private body failure"));
            },
          }),
          {
            headers: {
              "content-encoding": "gzip",
              "content-length": "999",
              "x-private-detail": "private response metadata",
            },
          },
        ),
    });
    servers.push(server);
    server.model.createAccount({ publicKey: owner });
    const { port } = await server.listen();
    const response = await fetch(
      `http://127.0.0.1:${port}/account?${credentials()}`,
    );
    expect(response.status).toBe(500);
    expect(response.headers.get("content-encoding")).toBeNull();
    expect(response.headers.get("x-private-detail")).toBeNull();
    await expect(response.json()).resolves.toEqual({ error: "internal error" });
  });

  it("writes dispatcher response bytes to the Node response", async () => {
    const server = createIndexdHttpServer();
    servers.push(server);
    server.model.createAccount({ publicKey: owner });
    const { port } = await server.listen();

    const response = await fetch(
      `http://127.0.0.1:${port}/account?${credentials()}`,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      app: { name: "Sia testing browser" },
      ready: true,
    });
  });
});
