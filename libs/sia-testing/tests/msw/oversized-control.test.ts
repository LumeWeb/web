/** Oversized application JSON must release dispatch without waiting for MSW's logging clone. */
import { setupServer } from "msw/node";
import { expect, it } from "vitest";
import { createMockApplication } from "../../src/client.js";
import { bytesFixture, createMockSia } from "../../src/mock.js";
import { createMockHandlers } from "../../src/msw.js";
import { app } from "../harness/application-scenarios.js";

async function observe<T>(promise: Promise<T>) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise.then(
        (value) => ({ state: "fulfilled" as const, value }),
        (error: unknown) => ({ error, state: "rejected" as const }),
      ),
      new Promise<{ state: "pending" }>((resolve) => {
        // This guard bounds a failed test, not the endpoint's API deadline.
        timer = setTimeout(() => resolve({ state: "pending" }), 1_000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

it("rejects oversized JSON before teardown and joins endpoint cleanup", async () => {
  const mock = createMockSia();
  const endpoint = createMockHandlers(mock, {
    baseUrl: "https://oversized-control.example.invalid/",
  });
  const server = setupServer(...endpoint.handlers);
  server.listen({ onUnhandledRequest: "error" });
  let writer: ReturnType<typeof createMockApplication> | undefined;
  let pending: Promise<unknown> | undefined;
  try {
    await mock.run({ app }, async (run) => {
      const connection = endpoint.connection({
        access: run.ownerAccess,
        as: mock.actor("writer"),
      });
      writer = createMockApplication(connection, connection.credential);
      pending = writer.events({
        cursor: { after: "2026-01-01T00:00:00.000Z", id: "a".repeat(17_000) },
        limit: 1,
      });
      const outcome = await observe(pending);
      expect(outcome).toMatchObject({
        error: { code: "invalid-input" },
        state: "rejected",
      });
      expect(await writer.events({ cursor: null, limit: 1 })).toMatchObject({
        events: [],
      });
      expect(await observe(endpoint.close())).toMatchObject({
        state: "fulfilled",
      });
    });
  } finally {
    try {
      await writer?.close();
      if (pending) await observe(pending);
    } finally {
      try {
        const cleanup = await observe(endpoint.close());
        if (cleanup.state === "pending")
          console.info("Endpoint cleanup still pending after client abort");
      } finally {
        server.close();
        await mock.close();
      }
    }
  }
});

it.each([16_383, 16_384, 16_385])(
  "reads application JSON at %i bytes without blocking endpoint cleanup",
  async (size) => {
    const mock = createMockSia();
    const endpoint = createMockHandlers(mock, {
      baseUrl: "https://json-cap.example.invalid/",
    });
    const server = setupServer(...endpoint.handlers);
    const abort = new AbortController();
    let pending: Promise<unknown> | undefined;
    let intercepted: Request | undefined;
    server.events.on("request:start", ({ request }) => {
      intercepted = request;
    });
    server.listen({ onUnhandledRequest: "error" });
    try {
      await mock.run({ app }, async (run) => {
        const connection = endpoint.connection({
          access: run.ownerAccess,
          as: mock.actor("writer"),
        });
        const empty = JSON.stringify({ cursor: null, limit: 1, padding: "" });
        const body = JSON.stringify({
          cursor: null,
          limit: 1,
          padding: "x".repeat(size - empty.length),
        });
        expect(new TextEncoder().encode(body).byteLength).toBe(size);
        pending = fetch(
          new URL(`${connection.client}/app-events`, connection.url),
          {
            body,
            headers: {
              authorization: `Bearer ${connection.credential.keyHex}`,
            },
            method: "POST",
            signal: abort.signal,
          },
        ).then((response) => response.json());
        expect(await observe(pending)).toMatchObject({
          state: "fulfilled",
          value: size <= 16_384 ? { events: [] } : { code: "invalid-input" },
        });
        expect(intercepted?.body?.locked).toBe(false);
        expect(await observe(endpoint.close())).toMatchObject({
          state: "fulfilled",
        });
      });
    } finally {
      abort.abort();
      try {
        await pending?.catch(() => undefined);
        await observe(endpoint.close());
      } finally {
        server.close();
        await mock.close();
      }
    }
  },
);

it("an oversized admitted MSW body releases bytes without refunding its attempt", async () => {
  const mock = createMockSia();
  const endpoint = createMockHandlers(mock, {
    baseUrl: "https://raw-oversized.example.invalid/",
  });
  const server = setupServer(...endpoint.handlers);
  const abort = new AbortController();
  const requests: Promise<unknown>[] = [];
  server.listen({ onUnhandledRequest: "error" });
  try {
    const result = await mock.run(
      { app, limits: { maxLogicalUploadBytes: 1, maxObjects: 2 } },
      async (run) => {
        const connection = endpoint.connection({
          access: run.ownerAccess,
          as: mock.actor("writer"),
        });
        const file = await bytesFixture({ bytes: Uint8Array.of(1), name: "n" });
        const post = (
          operation: string,
          body: string | Uint8Array<ArrayBuffer>,
        ) => {
          const request = fetch(
            new URL(`${connection.client}/${operation}`, connection.url),
            {
              body,
              headers: {
                authorization: `Bearer ${connection.credential.keyHex}`,
              },
              method: "POST",
              signal: abort.signal,
            },
          ).then((response) => response.json());
          requests.push(request);
          return request;
        };
        const admission = JSON.stringify({
          metadata: [],
          name: "n",
          sha256: file.sha256,
          sizeBytes: 1,
        });
        const first = (await post("app-upload-admit", admission)) as {
          token: string;
        };
        expect(
          await observe(
            post(`app-upload-body?token=${first.token}`, Uint8Array.of(1, 2)),
          ),
        ).toMatchObject({
          state: "fulfilled",
          value: { code: "invalid-input" },
        });
        expect(
          mock.history().filter((row) => row.operation === "upload"),
        ).toEqual([]);
        expect(
          await post(`app-upload-body?token=${first.token}`, Uint8Array.of(1)),
        ).toMatchObject({ code: "denied" });
        const second = (await post("app-upload-admit", admission)) as {
          token: string;
        };
        expect(second.token).toEqual(expect.any(String));
        expect(
          await post(`app-upload-body?token=${second.token}`, Uint8Array.of(1)),
        ).toHaveProperty("id");
        const empty = JSON.stringify({
          metadata: [],
          name: "empty",
          sha256: "0".repeat(64),
          sizeBytes: 0,
        });
        expect(await post("app-upload-admit", empty)).toMatchObject({
          code: "limit",
        });
        expect(
          mock.history().filter((row) => row.operation === "upload"),
        ).toMatchObject([{ committed: true, status: "completed" }]);
        expect(await observe(endpoint.close())).toMatchObject({
          state: "fulfilled",
        });
      },
    );
    expect(result.summary.logicalUploadedBytes).toBe(1);
  } finally {
    abort.abort();
    try {
      await Promise.allSettled(requests);
      await observe(endpoint.close());
    } finally {
      server.close();
      await mock.close();
    }
  }
});
