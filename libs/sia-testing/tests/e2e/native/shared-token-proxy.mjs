/// <reference types="node" />
// @ts-check
/** Loopback forward observer for one HTTP app authority; only decoded shared-host copies reach the observer. */
import { tokenEvidence } from "./shared-token-checks.ts";
import { randomBytes } from "node:crypto";
import { createServer, request } from "node:http";
import { brotliDecompressSync, gunzipSync, inflateSync } from "node:zlib";

/** Prevents a misconfigured app URL from forwarding native traffic to the admin listener. */
/** @param {string} appURL @param {string} adminURL */
export function nativeAppOrigin(appURL, adminURL) {
  let admin, app;
  try {
    app = new URL(appURL);
    admin = new URL(adminURL);
  } catch {
    throw new Error("Invalid app origin");
  }
  const loopback = ["127.0.0.1", "[::1]", "localhost"];
  if (
    app.protocol !== "http:" ||
    admin.protocol !== "http:" ||
    !loopback.includes(app.hostname) ||
    !loopback.includes(admin.hostname)
  )
    throw new Error("Invalid app origin");
  if ((app.port || "80") === (admin.port || "80"))
    throw new Error("App proxy cannot target admin");
  return app.origin;
}

/** Only the dedicated SDK child's environment receives these proxy settings. */
/** @param {NodeJS.ProcessEnv} environment @param {string} proxyURL */
export function scopedProxyEnvironment(environment, proxyURL) {
  const result = { ...environment };
  for (const key of Object.keys(result))
    if (/^(http_proxy|https_proxy|all_proxy|no_proxy)$/i.test(key))
      delete result[key];
  return {
    ...result,
    HTTP_PROXY: proxyURL,
    http_proxy: proxyURL,
    NO_PROXY: "",
    no_proxy: "",
  };
}

/** @param {{ appOrigin: string, observer: import("../support/shared-token-observer.ts").SharedTokenObserver, maxBodyBytes?: number, drainTimeoutMs?: number, maxCaptureBytes?: number, maxRecords?: number, maxResponses?: number, maxPendingRequests?: number }} options */
export async function startSharedTokenProxy({
  appOrigin,
  drainTimeoutMs = 10_000,
  maxBodyBytes = 1_048_576,
  maxCaptureBytes = 4_194_304,
  maxPendingRequests = 64,
  maxRecords = 4096,
  maxResponses = 256,
  observer,
}) {
  let app;
  try {
    app = new URL(appOrigin);
  } catch {
    throw new Error("Invalid proxy app origin");
  }
  if (
    app.protocol !== "http:" ||
    !["127.0.0.1", "[::1]", "localhost"].includes(app.hostname) ||
    app.origin !== appOrigin ||
    app.username ||
    app.password ||
    app.search ||
    app.hash ||
    !Number.isSafeInteger(maxBodyBytes) ||
    maxBodyBytes < 1 ||
    maxBodyBytes > 1_048_576
  ) {
    throw new Error("Invalid proxy app origin");
  }
  for (const limit of [
    drainTimeoutMs,
    maxCaptureBytes,
    maxRecords,
    maxResponses,
    maxPendingRequests,
  ])
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 16_777_216)
      throw new Error("Invalid proxy limits");
  /** @type {Map<Promise<void>, () => void>} */
  const pending = new Map();
  /** @type {Set<Buffer[]>} */
  const captures = new Set();
  let capturedBytes = 0,
    records = 0,
    responses = 0;
  /** @type {null | { authorizationEndedAtMs: number, firstRejectingReadStartedAtMs: number, maximumDeliveredExpiryMs: number }} */
  let finalEvidence = null;
  /** @type {Set<import('node:net').Socket>} */
  const sockets = new Set();
  /** @type {Set<import('node:http').ClientRequest>} */
  const upstreams = new Set();
  let closed = false,
    failed = false,
    forwardedRequests = 0;
  const fail = () => {
    failed = true;
    for (const chunks of captures) chunks.length = 0;
  };
  const controlPath = `/observations/${randomBytes(32).toString("hex")}`;
  const drain = async () => {
    let timer;
    try {
      await Promise.race([
        (async () => {
          while (pending.size && !failed)
            await Promise.all([...pending.keys()]);
        })(),
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            fail();
            reject(new Error("Shared-host observation failed"));
          }, drainTimeoutMs);
        }),
      ]);
      if (failed || closed) throw new Error("Shared-host observation failed");
    } finally {
      clearTimeout(timer);
    }
  };
  const server = createServer((incoming, outgoing) => {
    if (incoming.url === controlPath && incoming.method === "POST") {
      const chunks = [];
      let size = 0;
      incoming.on(
        "data",
        /** @param {Buffer} chunk */ (chunk) => {
          size += chunk.length;
          if (size > 1024) {
            fail();
            incoming.destroy();
            outgoing.destroy();
          } else chunks.push(chunk);
        },
      );
      incoming.on("error", fail);
      incoming.on("end", () => {
        try {
          if (failed || closed || finalEvidence) throw new Error();
          /** @type {unknown} */
          const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          finalEvidence = tokenEvidence(value);
          outgoing.writeHead(204).end();
        } catch {
          fail();
          outgoing.writeHead(400).end();
        }
        chunks.length = 0;
      });
      return;
    }
    if (incoming.url === controlPath && incoming.method === "GET") {
      void drain().then(
        () => {
          outgoing.writeHead(200, { "content-type": "application/json" });
          outgoing.end(JSON.stringify(observer.snapshot()));
        },
        () => {
          outgoing.writeHead(500);
          outgoing.end("Shared-host observation failed");
        },
      );
      return;
    }
    let target;
    try {
      target = new URL(incoming.url);
    } catch {
      outgoing.writeHead(403).end();
      return;
    }
    if (
      target.origin !== app.origin ||
      target.username ||
      target.password ||
      target.hash ||
      incoming.headers.host !== app.host ||
      incoming.headers["proxy-authorization"] ||
      incoming.headers.upgrade
    ) {
      outgoing.writeHead(403).end();
      return;
    }
    if (closed || pending.size >= maxPendingRequests) {
      fail();
      incoming.destroy();
      outgoing.destroy();
      return;
    }
    forwardedRequests++;
    const started = Date.now();
    /** @type {() => void} */
    let complete = () => undefined;
    /** @type {Promise<void>} */
    const task = new Promise((resolve) => {
      complete = resolve;
    });
    pending.set(task, complete);
    void task.finally(() => pending.delete(task));
    const headers = { ...incoming.headers };
    delete headers["proxy-connection"];
    const upstream = request(
      target,
      { agent: false, headers, method: incoming.method },
      (response) => {
        const received = Date.now();
        outgoing.writeHead(
          response.statusCode,
          response.statusMessage,
          response.rawHeaders,
        );
        const observe = target.pathname === "/shared/hosts";
        if (observe && ++responses > maxResponses) fail();
        /** @type {Buffer[]} */
        const chunks = [];
        if (observe) captures.add(chunks);
        let overflow = false,
          size = 0;
        response.on(
          "data",
          /** @param {Buffer} chunk */ (chunk) => {
            if (!observe || overflow || closed || failed) return;
            size += chunk.length;
            capturedBytes += chunk.length;
            if (size > maxBodyBytes || capturedBytes > maxCaptureBytes) {
              overflow = true;
              chunks.length = 0;
              fail();
            } else chunks.push(chunk);
          },
        );
        response.on("end", () => {
          if (observe && !overflow && !closed && !failed) {
            try {
              const status = response.statusCode;
              /** @type {unknown} */
              let body;
              if (status !== 401) {
                if (status < 200 || status > 299) throw new Error();
                let bytes = Buffer.concat(chunks);
                const encoding =
                  response.headers["content-encoding"] ?? "identity";
                const options = { maxOutputLength: maxBodyBytes };
                if (encoding === "gzip") bytes = gunzipSync(bytes, options);
                else if (encoding === "deflate")
                  bytes = inflateSync(bytes, options);
                else if (encoding === "br")
                  bytes = brotliDecompressSync(bytes, options);
                else if (encoding !== "identity") throw new Error();
                if (encoding !== "identity") capturedBytes += bytes.length;
                if (capturedBytes > maxCaptureBytes) throw new Error();
                if (
                  response.headers["content-type"]?.split(";")[0].trim() !==
                  "application/json"
                )
                  throw new Error();
                body = JSON.parse(bytes.toString("utf8"));
              }
              const count =
                status === 401
                  ? 1
                  : Array.isArray(body)
                    ? Math.max(1, body.length)
                    : maxRecords + 1;
              if (records + count > maxRecords) throw new Error();
              observer.observe({
                body,
                requestStartedAtMs: started,
                responseReceivedAtMs: received,
                status,
                url: target.href,
              });
              records += count;
            } catch {
              fail();
            }
          }
          chunks.length = 0;
          captures.delete(chunks);
          complete();
        });
        response.on("error", () => {
          fail();
          complete();
          outgoing.destroy();
        });
        response.on("aborted", () => {
          fail();
          complete();
          outgoing.destroy();
        });
        response.pipe(outgoing);
      },
    );
    upstreams.add(upstream);
    upstream.on("close", () => upstreams.delete(upstream));
    upstream.on("error", () => {
      fail();
      if (!outgoing.headersSent) outgoing.writeHead(502);
      outgoing.end();
      complete();
    });
    incoming.on("aborted", () => {
      fail();
      upstream.destroy();
      complete();
    });
    outgoing.on("close", () => {
      if (!outgoing.writableFinished) {
        fail();
        upstream.destroy();
        complete();
      }
    });
    incoming.pipe(upstream);
  });
  server.on("connection", (socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
  });
  server.on("connect", (_req, socket) =>
    socket.end(
      "HTTP/1.1 403 Forbidden\r\nConnection: close\r\nContent-Length: 0\r\n\r\n",
    ),
  );
  server.on("clientError", (_error, socket) => socket.destroy());
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.removeListener("error", reject);
      resolve();
    });
  });
  return {
    async close() {
      if (closed) return;
      closed = true;
      for (const chunks of captures) chunks.length = 0;
      captures.clear();
      for (const upstream of upstreams) upstream.destroy();
      for (const socket of sockets) socket.destroy();
      await new Promise((resolve) => server.close(resolve));
      for (const complete of pending.values()) complete();
      await Promise.all([...pending.keys()]);
    },
    controlURL: `http://127.0.0.1:${server.address().port}${controlPath}`,
    drain,
    evidence: () => (finalEvidence ? { ...finalEvidence } : null),
    routing: () => ({ forwardedRequests }),
    url: `http://127.0.0.1:${server.address().port}`,
  };
}
