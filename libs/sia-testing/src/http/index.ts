/** Exposes the dispatcher through a Node HTTP server with an explicit listener lifecycle. */
import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { MockNetwork, MockSdk } from "../sdk/index.js";
import { createMockDispatcher } from "./mock-sdk.js";
import {
  createIndexdDispatcher,
  type DispatcherOptions,
} from "../dispatcher.js";
import {
  createIndexdModel,
  type IndexdModel,
  type IndexdModelOptions,
} from "../model/index.js";

export interface HttpServerOptions extends DispatcherOptions {
  allowedOrigin?: string;
  maxBodyBytes?: number;
  mockClients?: Record<string, { accountId: string; device?: string }>;
  mockNetwork?: MockNetwork;
  model?: IndexdModel;
  modelOptions?: IndexdModelOptions;
}

export interface IndexdHttpServer {
  close(): Promise<void>;
  listen(port?: number, host?: string): Promise<{ port: number }>;
  model: IndexdModel;
  server: Server;
}

export function createIndexdHttpServer(
  options: HttpServerOptions = {},
): IndexdHttpServer {
  if (
    options.mockNetwork &&
    options.model &&
    options.mockNetwork.model !== options.model
  )
    throw new Error("HTTP and mock SDK must use the same model");
  if (options.mockClients && !options.mockNetwork)
    throw new Error("mock clients require a mock network");
  const model =
    options.mockNetwork?.model ??
    options.model ??
    createIndexdModel(options.modelOptions);
  const clients = new Map<string, MockSdk>();
  for (const [name, identity] of Object.entries(options.mockClients ?? {}))
    clients.set(name, options.mockNetwork!.createSdk({ ...identity }));
  const mockDispatch = createMockDispatcher(clients);
  const calls = new Set<AbortController>();
  const dispatch = createIndexdDispatcher(model, options);
  const allowedOrigin = options.allowedOrigin ?? "*";
  const maxBodyBytes = options.maxBodyBytes ?? 1024 * 1024;

  async function respond(
    incoming: IncomingMessage,
    outgoing: ServerResponse,
  ): Promise<void> {
    outgoing.setHeader("access-control-allow-origin", allowedOrigin);
    outgoing.setHeader(
      "access-control-allow-methods",
      "GET,POST,DELETE,OPTIONS",
    );
    outgoing.setHeader(
      "access-control-allow-headers",
      "content-type, authorization",
    );
    if (incoming.method === "OPTIONS") {
      outgoing.statusCode = 204;
      outgoing.end();
      return;
    }

    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of incoming as AsyncIterable<Buffer>) {
      size += chunk.length;
      if (size <= maxBodyBytes) chunks.push(chunk);
      else chunks.length = 0;
    }
    if (size > maxBodyBytes) {
      replyError(outgoing, 413, "request body too large");
      return;
    }

    const abort = new AbortController();
    const cancelled = () => abort.abort();
    calls.add(abort);
    outgoing.once("close", cancelled);
    try {
      const method = incoming.method ?? "GET";
      const request = new Request(
        `http://${incoming.headers.host ?? "127.0.0.1"}${incoming.url ?? "/"}`,
        {
          headers: Object.entries(incoming.headers).flatMap(([key, value]) =>
            value === undefined
              ? []
              : [[key, Array.isArray(value) ? value.join(",") : value]],
          ),
          method,
          signal: abort.signal,
          ...(["GET", "HEAD"].includes(method)
            ? {}
            : { body: Buffer.concat(chunks) }),
        },
      );
      const mock = await mockDispatch(request);
      if (mock) {
        outgoing.statusCode = mock.status;
        mock.headers.forEach((value, key) => outgoing.setHeader(key, value));
        outgoing.flushHeaders();
        if (mock.body)
          await pipeline(Readable.from(responseChunks(mock.body)), outgoing);
        else outgoing.end();
        return;
      }
      const response = await dispatch(request);
      // Read before copying headers so a failed body cannot leave its length or encoding on the error response.
      const body = Buffer.from(await response.arrayBuffer());
      outgoing.statusCode = response.status;
      response.headers.forEach((value, key) => outgoing.setHeader(key, value));
      outgoing.end(body);
    } finally {
      calls.delete(abort);
      outgoing.removeListener("close", cancelled);
    }
  }

  const server = createServer((incoming, outgoing) => {
    // Node does not await request listeners, including failures while reading an aborted body.
    void respond(incoming, outgoing).catch(() => {
      if (outgoing.headersSent || outgoing.destroyed) outgoing.destroy();
      else replyError(outgoing, 500, "internal error");
    });
  });

  return {
    close() {
      for (const call of calls) call.abort();
      return new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    },
    listen(port = 0, host = "127.0.0.1") {
      return new Promise((resolve, reject) => {
        const cleanup = () => {
          server.off("error", onError);
          server.off("listening", onListening);
        };
        const onError = (error: Error) => {
          cleanup();
          reject(error);
        };
        const onListening = () => {
          cleanup();
          const address = server.address();
          resolve({
            port: typeof address === "object" && address ? address.port : port,
          });
        };
        server.once("error", onError);
        server.once("listening", onListening);
        try {
          server.listen(port, host);
        } catch (error) {
          onError(
            error instanceof Error ? error : new Error("HTTP listen failed"),
          );
        }
      });
    },
    model,
    server,
  };
}

function replyError(
  response: ServerResponse,
  status: number,
  error: string,
): void {
  response.statusCode = status;
  response.setHeader("content-type", "application/json");
  response.end(JSON.stringify({ error }));
}

/** Buffering mock bodies would hide transfer pacing and prevent socket closure from cancelling a read. */
async function* responseChunks(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) return;
      yield chunk.value;
    }
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

export const setupIndexdHttpServer = createIndexdHttpServer;
