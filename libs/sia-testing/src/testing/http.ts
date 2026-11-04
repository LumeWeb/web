/** Hosts scoped mock ports on a loopback listener with owned request cancellation. */
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createMockEndpoint, type MockEndpoint } from "./transport.js";
import { endpointShutdown } from "./diagnostics.js";
import { isLostReply } from "./reply-loss.js";
import { incomingBody } from "./http-body.js";
import { mockRuntime } from "./runtime.js";
import type { BrowserAccess, MockSia } from "./types.js";
export { createMockReader } from "./client.js";

export function mockCredential(mock: MockSia, access: BrowserAccess) {
  return mockRuntime(mock).credential(access);
}
export async function startMockServer(
  mock: MockSia,
  options: {
    allowedOrigins?: readonly string[];
    host?: "127.0.0.1" | "::1";
    port?: number;
  } = {},
): Promise<MockEndpoint & { close(): Promise<void> }> {
  if (
    options.host !== undefined &&
    options.host !== "127.0.0.1" &&
    options.host !== "::1"
  )
    throw Object.assign(new Error("Mock listener host must be loopback"), {
      code: "invalid-input",
    });
  const calls = new Set<AbortController>();
  const bodies = new Map<IncomingMessage, ServerResponse>();
  // Queued pipelined replies have no response socket until earlier replies finish.
  const replies = new Map<ServerResponse, IncomingMessage["socket"]>();
  let stopping = false;
  function ownBody(incoming: IncomingMessage, outgoing: ServerResponse) {
    bodies.set(incoming, outgoing);
    const releaseBody = () => {
      bodies.delete(incoming);
      incoming.removeListener("end", releaseBody);
      incoming.removeListener("close", releaseBody);
    };
    incoming.once("end", releaseBody);
    incoming.once("close", releaseBody);
    return releaseBody;
  }
  function cancelBodies() {
    if (!stopping) return;
    for (const [incoming, outgoing] of bodies) {
      if (incoming.complete || incoming.destroyed) continue;
      // Destroying a later pipelined request also destroys earlier replies.
      // Let those replies, and any early response to this body, flush first.
      const waiting = [...replies].some(
        ([reply, socket]) =>
          socket === incoming.socket &&
          (reply !== outgoing || reply.headersSent),
      );
      if (!waiting) incoming.destroy();
    }
  }
  // Body completion can outlive close while an earlier pipelined reply flushes.
  const dispatch = (request: Request) =>
    stopping
      ? Promise.resolve(Response.json({ code: "closed" }, { status: 410 }))
      : configured.dispatch(request);
  async function respond(
    incoming: IncomingMessage,
    outgoing: ServerResponse,
    releaseBody: () => void,
  ) {
    const origin = incoming.headers.origin;
    if (origin) {
      const permitted =
        options.allowedOrigins?.includes(origin) ??
        ["127.0.0.1", "[::1]", "localhost"].includes(new URL(origin).hostname);
      if (!permitted) {
        outgoing.writeHead(403).end();
        return;
      }
      outgoing.setHeader("access-control-allow-origin", origin);
      outgoing.setHeader("vary", "Origin");
    }
    outgoing.setHeader(
      "access-control-allow-headers",
      "authorization, content-type",
    );
    outgoing.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
    if (incoming.method === "OPTIONS") {
      outgoing.writeHead(204).end();
      return;
    }
    const abort = new AbortController();
    const cancel = () => abort.abort();
    calls.add(abort);
    // A request parsed after close starts missed the controller cancellation pass.
    if (stopping) abort.abort(endpointShutdown());
    outgoing.once("close", cancel);
    try {
      const pathname = new URL(incoming.url ?? "/", "http://localhost")
        .pathname;
      const root = new URL(configured.endpoint.url).pathname;
      const parts = pathname.startsWith(root)
        ? pathname.substring(root.length).split("/")
        : [];
      const rawUpload =
        parts.length === 2 &&
        /^[a-f0-9-]{36}$/.test(parts[0]!) &&
        parts[1] === "app-upload-body";
      const chunks: Buffer[] = [];
      let size = 0;
      if (!rawUpload)
        for await (const value of incoming as AsyncIterable<Buffer>) {
          size += value.length;
          if (size > 16_384) {
            outgoing.writeHead(413).end();
            return;
          }
          chunks.push(value);
        }
      const request = new Request(
        `http://${incoming.headers.host}${incoming.url}`,
        {
          ...(["GET", "HEAD"].includes(incoming.method ?? "GET")
            ? {}
            : rawUpload
              ? {
                  body: incomingBody(incoming, abort.signal),
                  duplex: "half",
                }
              : { body: Buffer.concat(chunks) }),
          headers: Object.entries(incoming.headers).flatMap(([key, value]) =>
            value === undefined
              ? []
              : [[key, Array.isArray(value) ? value.join(",") : value]],
          ),
          method: incoming.method ?? "GET",
          signal: abort.signal,
        },
      );
      // Streaming uploads transfer cancellation to the endpoint's body collector.
      releaseBody();
      let response: Response;
      try {
        response = await dispatch(request);
      } finally {
        // Rejections before a streaming collector attaches leave the body unread.
        // Dispatch must settle before the listener can own cancellation again.
        if (rawUpload && !incoming.complete && !incoming.destroyed)
          ownBody(incoming, outgoing);
      }
      outgoing.statusCode = response.status;
      response.headers.forEach((value, key) => outgoing.setHeader(key, value));
      outgoing.flushHeaders();
      if (response.body)
        await pipeline(
          Readable.fromWeb(
            response.body as import("node:stream/web").ReadableStream,
          ),
          outgoing,
        );
      else outgoing.end();
    } finally {
      calls.delete(abort);
      outgoing.removeListener("close", cancel);
    }
  }
  const server = createServer((incoming, outgoing) => {
    const releaseBody = ownBody(incoming, outgoing);
    replies.set(outgoing, incoming.socket);
    const releaseReply = () => {
      replies.delete(outgoing);
      outgoing.removeListener("finish", releaseReply);
      outgoing.removeListener("close", releaseReply);
      cancelBodies();
    };
    outgoing.once("finish", releaseReply);
    outgoing.once("close", releaseReply);
    void respond(incoming, outgoing, releaseBody).catch((error: unknown) => {
      if (isLostReply(error)) {
        // An empty socket close lets browsers replay POST on a reused connection.
        // Flush an incomplete body so delivery fails without repeating the effect.
        outgoing.writeHead(200, {
          "content-length": "4",
          "content-type": "application/json",
        });
        outgoing.write("n", () => outgoing.destroy());
      } else if (outgoing.headersSent) outgoing.destroy();
      else outgoing.writeHead(500).end();
    });
    cancelBodies();
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port ?? 0, options.host ?? "127.0.0.1", () => {
      server.removeListener("error", reject);
      resolve();
    });
  });
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Mock listener has no address");
  const host =
    address.family === "IPv6" ? `[${address.address}]` : address.address;
  const configured = createMockEndpoint(
    mock,
    `http://${host}:${address.port}/`,
  );
  let closing: Promise<void> | undefined;
  return {
    ...configured.endpoint,
    close() {
      closing ??= (async () => {
        stopping = true;
        const results = await Promise.allSettled([
          configured.close(),
          new Promise<void>((resolve, reject) => {
            for (const call of calls) call.abort(endpointShutdown());
            cancelBodies();
            server.close((error) => (error ? reject(error) : resolve()));
            server.closeIdleConnections();
          }),
        ]);
        const errors = results.flatMap((result) =>
          result.status === "rejected" ? [result.reason as unknown] : [],
        );
        if (errors.length)
          throw new AggregateError(errors, "Mock listener cleanup failed");
      })();
      return closing;
    },
  };
}
