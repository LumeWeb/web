/** Incomplete HTTP bodies remain listener-owned until dispatch or parser completion. */
import { once } from "node:events";
import { Agent, type IncomingMessage, request } from "node:http";
import { connect } from "node:net";
import { expect, it } from "vitest";
import { bytesFixture, createMockSia } from "../../src/mock.js";
import { startMockServer } from "../../src/http.js";
import { createMockAuth } from "../../src/client.js";

const app = {
  description: "Synthetic loopback",
  id: "a".repeat(64),
  name: "Body shutdown",
  serviceUrl: "https://example.invalid",
};

async function bounded<T>(pending: Promise<T>, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      pending,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(label)), 2000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

it.each([
  { mode: "complete", status: 200 },
  { mode: "partial", status: undefined },
  { mode: "denied", status: 403 },
  { mode: "options", status: 204 },
  { mode: "upload-method", status: 405 },
  { mode: "upload-denied", status: 403 },
  { mode: "upload-token", status: 403 },
])(
  "listener close settles with a $mode request body before peer cleanup",
  async ({ mode, status }) => {
    const mock = createMockSia();
    const server = await startMockServer(mock);
    const agent = new Agent({ keepAlive: true });
    let client: ReturnType<typeof request> | undefined;
    let clientClosed: Promise<void> | undefined;
    let response: IncomingMessage | undefined;
    let closing: Promise<void> | undefined;
    try {
      await mock.run({ app }, async (run) => {
        const connection = server.connection({
          access: run.ownerAccess,
          as: mock.actor("events"),
        });
        const json = '{"cursor":null,"limit":1}';
        const operation = mode.startsWith("upload-")
          ? "app-upload-body"
          : "app-events";
        client = request(
          new URL(`${connection.client}/${operation}`, connection.url),
          {
            agent,
            headers: {
              "authorization": `Bearer ${mode === "upload-denied" ? "b".repeat(64) : connection.credential.keyHex}`,
              "content-length":
                mode === "complete" ? Buffer.byteLength(json) : 64,
              "content-type": "application/json",
              "expect": "100-continue",
              ...(mode === "denied"
                ? { origin: "https://denied.example.invalid" }
                : {}),
            },
            method:
              mode === "options"
                ? "OPTIONS"
                : mode === "upload-method"
                  ? "GET"
                  : "POST",
          },
        );
        client.on("error", () => {
          // An incomplete request may disconnect without an HTTP response.
        });
        clientClosed = new Promise<void>((resolve) =>
          client!.once("close", () => resolve()),
        );
        const replied = new Promise<number | undefined>((resolve, reject) => {
          client!.on("response", (incoming) => {
            response = incoming;
            incoming.on("error", reject);
            incoming.resume();
            incoming.on("end", () => resolve(incoming.statusCode));
          });
        });
        void replied.catch(() => {
          // Awaited early replies below still report delivery failures.
        });
        const continued = once(client, "continue");
        client.flushHeaders();
        await bounded(continued, "server did not accept request headers");
        if (mode === "complete") {
          client.end(json);
        } else {
          await new Promise<void>((resolve, reject) => {
            client!.write('{"cursor":null,', (error) =>
              error ? reject(error) : resolve(),
            );
          });
        }
        if (status !== undefined)
          expect(await bounded(replied, "response did not end")).toBe(status);
        closing = server.close();
        expect(server.close()).toBe(closing);
        await bounded(closing, "listener close waited for peer cleanup");
        if (mode !== "complete") expect(mock.history()).toEqual([]);
      });
    } finally {
      response?.destroy();
      client?.destroy();
      agent.destroy();
      try {
        await bounded(
          closing ?? server.close(),
          "listener did not close after peer cleanup",
        );
        if (clientClosed) await bounded(clientClosed, "client did not close");
      } finally {
        await mock.close();
      }
    }
  },
);

it.each(["POST", "OPTIONS"])(
  "listener close preserves a held reply before a pipelined incomplete %s body",
  async (method) => {
    const mock = createMockSia();
    const server = await startMockServer(mock);
    let peer: ReturnType<typeof connect> | undefined;
    let disconnected: Promise<void> | undefined;
    let closing: Promise<void> | undefined;
    try {
      await mock.run({ app }, async (run) => {
        const actor = mock.actor("pipelined reader");
        const connection = server.connection({
          access: run.ownerAccess,
          as: actor,
        });
        const hold = mock.faults.hold({ actor, operation: "objects" });
        const url = new URL(connection.url);
        peer = connect({ host: url.hostname, port: Number(url.port) });
        peer.on("error", () => {
          // Shutdown can reset the incomplete pipelined body.
        });
        disconnected = new Promise<void>((resolve) =>
          peer!.once("close", () => resolve()),
        );
        let received = "";
        peer.on("data", (chunk: Buffer) => {
          received += chunk.toString();
        });
        await bounded(once(peer, "connect"), "peer did not connect");
        const authorization = `Authorization: Bearer ${connection.credential.keyHex}\r\n`;
        peer.write(
          `GET ${url.pathname}${connection.client}/objects?offset=0&limit=1 HTTP/1.1\r\nHost: ${url.host}\r\n${authorization}\r\n` +
            `${method} ${url.pathname}${connection.client}/app-events HTTP/1.1\r\nHost: ${url.host}\r\n${authorization}Content-Length: 64\r\nContent-Type: application/json\r\n\r\n{"cursor":null,`,
        );
        await bounded(hold.started(), "first request did not dispatch");
        closing = server.close();
        await bounded(closing, "pipelined body kept listener open");
        await bounded(
          disconnected,
          "listener did not disconnect incomplete body",
        );
        expect(received).toContain('"code":"closed"');
        if (method === "OPTIONS") expect(received).toContain("204 No Content");
        expect(await hold.cancelled()).toMatchObject({ status: "cancelled" });
        expect(mock.history()).toHaveLength(1);
      });
    } finally {
      peer?.destroy();
      try {
        await bounded(
          closing ?? server.close(),
          "listener did not close after peer cleanup",
        );
        if (disconnected) await bounded(disconnected, "peer did not close");
      } finally {
        await mock.close();
      }
    }
  },
);

it("listener close leaves a late-completing registration unconsumed while preserving an earlier reply", async () => {
  const mock = createMockSia();
  const server = await startMockServer(mock);
  const observer = await startMockServer(mock);
  let peer: ReturnType<typeof connect> | undefined;
  let disconnected: Promise<void> | undefined;
  let closing: Promise<void> | undefined;
  try {
    await mock.run({ app }, async (run) => {
      const auth = createMockAuth(
        observer.connection({
          access: run.auth.registrationAccess,
          as: mock.actor("auth observer"),
        }),
      );
      try {
        const approval = await auth.requestConnection(app);
        await run.auth.approve(approval.responseUrl);
        const file = await bytesFixture({
          bytes: Uint8Array.of(1),
          name: "backpressure",
        });
        // Small replies can finish into the socket buffer before reads pause.
        await run.objects.upload({
          file,
          metadata: new Uint8Array(16 * 1024 * 1024),
          name: file.name,
        });
        const big = server.connection({
          access: run.ownerAccess,
          as: mock.actor("large reply"),
        });
        const actor = mock.actor("held reader");
        const owner = server.connection({ access: run.ownerAccess, as: actor });
        const registration = server.connection({
          access: run.auth.registrationAccess,
          as: mock.actor("late registration"),
        });
        const hold = mock.faults.hold({ actor, operation: "objects" });
        const url = new URL(owner.url);
        const body = JSON.stringify({
          id: approval.id,
          phrase: run.auth.fixturePhrase,
        });
        peer = connect({ host: url.hostname, port: Number(url.port) });
        peer.on("error", () => {
          // Delivery failures remain visible through the response assertions.
        });
        disconnected = new Promise<void>((resolve) =>
          peer!.once("close", () => resolve()),
        );
        let received = "";
        peer.on("data", (chunk: Buffer) => {
          received += chunk.toString();
        });
        await bounded(once(peer, "connect"), "peer did not connect");
        peer.write(
          `GET ${url.pathname}${big.client}/objects?offset=0&limit=1 HTTP/1.1\r\nHost: ${url.host}\r\nAuthorization: Bearer ${big.credential.keyHex}\r\n\r\n` +
            `GET ${url.pathname}${owner.client}/objects?offset=0&limit=1 HTTP/1.1\r\nHost: ${url.host}\r\nAuthorization: Bearer ${owner.credential.keyHex}\r\n\r\n` +
            `POST ${url.pathname}${registration.client}/auth-register HTTP/1.1\r\nHost: ${url.host}\r\nAuthorization: Bearer ${registration.credential.keyHex}\r\nContent-Length: ${Buffer.byteLength(body)}\r\nContent-Type: application/json\r\nConnection: close\r\n\r\n${body.slice(0, 1)}`,
        );
        await bounded(hold.started(), "held request did not dispatch");
        peer.pause();
        closing = server.close();
        await bounded(
          new Promise<void>((resolve, reject) =>
            peer!.write(body.slice(1), (error) =>
              error ? reject(error) : resolve(),
            ),
          ),
          "peer did not finish registration body",
        );
        peer.resume();
        await bounded(closing, "completed registration kept listener open");
        await bounded(disconnected, "peer did not finish responses");
        expect(received).toContain('"code":"closed"');
        expect(await hold.cancelled()).toMatchObject({ status: "cancelled" });
        expect(
          mock.history().filter((entry) => entry.status === "cancelled"),
        ).toHaveLength(1);
        // Another listener shares the active run, so successful registration proves approval survived.
        await expect(
          auth.register(approval, run.auth.fixturePhrase),
        ).resolves.toEqual(owner.credential);
        expect(received).toContain("HTTP/1.1 200 OK");
        expect(received).toContain("\r\n0\r\n\r\nHTTP/1.1 410 Gone");
        expect(received.match(/410 Gone/g)).toHaveLength(2);
      } finally {
        await auth.close();
      }
    });
  } finally {
    peer?.destroy();
    try {
      await bounded(
        closing ?? server.close(),
        "listener did not close after peer cleanup",
      );
      if (disconnected) await bounded(disconnected, "peer did not close");
    } finally {
      try {
        await observer.close();
      } finally {
        await mock.close();
      }
    }
  }
});
