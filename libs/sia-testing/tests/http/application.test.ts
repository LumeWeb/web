import { expect, it, vi } from "vitest";
import { bytesFixture, createMockSia } from "../../src/mock.js";
import { createMockApplication } from "../../src/client.js";
import { startMockServer } from "../../src/testing/http.js";
it("an HTTP upload waits for admission before opening its source", async () => {
  const mock = createMockSia();
  const server = await startMockServer(mock);
  try {
    await mock.run(
      {
        app: {
          description: "Owned writes",
          id: "a".repeat(64),
          name: "Writes",
          serviceUrl: "https://example.invalid",
        },
        limits: { maxObjects: 0 },
      },
      async (run) => {
        const connection = server.connection({
          access: run.ownerAccess,
          as: mock.actor("writer"),
        });
        const writer = createMockApplication(connection, connection.credential);
        const file = await bytesFixture({
          bytes: Uint8Array.of(1),
          name: "note",
        });
        let opened = false;
        await expect(
          writer.upload({
            file: {
              ...file,
              open() {
                opened = true;
                return file.open();
              },
            },
            metadata: new Uint8Array(),
            name: file.name,
          }),
        ).rejects.toMatchObject({ code: "limit" });
        expect(opened).toBe(false);
        await writer.close();
      },
    );
  } finally {
    await server.close();
    await mock.close();
  }
});
import { applicationScenarios } from "../harness/application-scenarios.js";
applicationScenarios(async (mock, run, actor) => {
  const server = await startMockServer(mock);
  const connection = server.connection({ access: run.ownerAccess, as: actor });
  return {
    close: () => server.close(),
    writer: createMockApplication(connection, connection.credential),
  };
});
it("admission tokens reject replay and another connection before consuming bytes", async () => {
  const mock = createMockSia();
  const server = await startMockServer(mock);
  try {
    await mock.run(
      {
        app: {
          description: "Owned writes",
          id: "a".repeat(64),
          name: "Writes",
          serviceUrl: "https://example.invalid",
        },
      },
      async (run) => {
        const first = server.connection({
          access: run.ownerAccess,
          as: mock.actor("first"),
        });
        const second = server.connection({
          access: run.ownerAccess,
          as: mock.actor("second"),
        });
        const file = await bytesFixture({ bytes: Uint8Array.of(1), name: "n" });
        const headers = { authorization: `Bearer ${first.credential.keyHex}` };
        const admit = await fetch(
          new URL(`${first.client}/app-upload-admit`, first.url),
          {
            body: JSON.stringify({
              metadata: [],
              name: "n",
              sha256: file.sha256,
              sizeBytes: 1,
            }),
            headers,
            method: "POST",
          },
        );
        const { token } = (await admit.json()) as { token: string };
        const post = (client: string, body: Uint8Array) =>
          fetch(
            new URL(`${client}/app-upload-body?token=${token}`, first.url),
            { body: new Uint8Array(body), headers, method: "POST" },
          );
        expect((await post(second.client, Uint8Array.of(1))).status).toBe(403);
        const response = await post(first.client, Uint8Array.of(1));
        expect(response.status).toBe(200);
        expect((await post(first.client, Uint8Array.of(1))).status).toBe(403);
        const changed = await fetch(
          new URL(`${first.client}/app-inspect`, first.url),
          {
            body: JSON.stringify({
              ref: ((await response.json()) as { id: string }).id,
            }),
            headers,
            method: "POST",
          },
        );
        expect(((await changed.json()) as { code: string }).code).toBe(
          "foreign-handle",
        );
      },
    );
  } finally {
    await server.close();
    await mock.close();
  }
});
import { request as httpRequest } from "node:http";
it("a disconnected raw upload cannot consume the next upload's byte allowance", async () => {
  const mock = createMockSia();
  const server = await startMockServer(mock);
  try {
    await mock.run(
      {
        app: {
          description: "Owned writes",
          id: "a".repeat(64),
          name: "Writes",
          serviceUrl: "https://example.invalid",
        },
        limits: { maxLogicalUploadBytes: 2 },
      },
      async (run) => {
        const connection = server.connection({
          access: run.ownerAccess,
          as: mock.actor("writer"),
        });
        const file = await bytesFixture({
          bytes: Uint8Array.of(1, 2),
          name: "n",
        });
        const headers = {
          authorization: `Bearer ${connection.credential.keyHex}`,
        };
        const admitted = await fetch(
          new URL(`${connection.client}/app-upload-admit`, connection.url),
          {
            body: JSON.stringify({
              metadata: [],
              name: "n",
              sha256: file.sha256,
              sizeBytes: 2,
            }),
            headers,
            method: "POST",
          },
        );
        const { token } = (await admitted.json()) as { token: string };
        await new Promise<void>((resolve) => {
          const request = httpRequest(
            new URL(
              `${connection.client}/app-upload-body?token=${token}`,
              connection.url,
            ),
            { headers, method: "POST" },
            (response) => {
              response.resume();
            },
          );
          request.on("error", () => resolve());
          request.flushHeaders();
          request.write(Buffer.of(1));
          setTimeout(() => {
            request.destroy();
            resolve();
          }, 20);
        });
        const writer = createMockApplication(connection, connection.credential);
        // The explicit cancel joins backend work if the disconnect has not reached its reader yet.
        await fetch(
          new URL(
            `${connection.client}/app-upload-cancel?token=${token}`,
            connection.url,
          ),
          { headers, method: "POST" },
        );
        const object = await writer.upload({
          file,
          metadata: new Uint8Array(),
          name: "n",
        });
        expect(await writer.inspect(object)).toBe("uploaded");
        await writer.close();
      },
    );
  } finally {
    await server.close();
    await mock.close();
  }
});
it("oversized raw bodies cannot create payload state", async () => {
  const mock = createMockSia();
  const server = await startMockServer(mock);
  try {
    const result = await mock.run(
      {
        app: {
          description: "Owned writes",
          id: "a".repeat(64),
          name: "Writes",
          serviceUrl: "https://example.invalid",
        },
      },
      async (run) => {
        const connection = server.connection({
          access: run.ownerAccess,
          as: mock.actor("writer"),
        });
        const file = await bytesFixture({ bytes: Uint8Array.of(1), name: "n" });
        const headers = {
          authorization: `Bearer ${connection.credential.keyHex}`,
        };
        const response = await fetch(
          new URL(`${connection.client}/app-upload-admit`, connection.url),
          {
            body: JSON.stringify({
              metadata: [],
              name: "n",
              sha256: file.sha256,
              sizeBytes: 1,
            }),
            headers,
            method: "POST",
          },
        );
        const { token } = (await response.json()) as { token: string };
        const sent = await fetch(
          new URL(
            `${connection.client}/app-upload-body?token=${token}`,
            connection.url,
          ),
          { body: Uint8Array.of(1, 2), headers, method: "POST" },
        ).catch((error: unknown) => error);
        if (sent instanceof Response) expect(sent.ok).toBe(false);
        else expect(sent).toBeInstanceOf(Error);
        expect(
          mock
            .history()
            .filter((row) => row.operation === "upload" && row.committed),
        ).toEqual([]);
      },
    );
    expect(result.summary.logicalUploadedBytes).toBe(0);
  } finally {
    await server.close();
    await mock.close();
  }
});
it("client-local references cannot arm backend object controls", async () => {
  const mock = createMockSia();
  const server = await startMockServer(mock);
  try {
    await mock.run(
      {
        app: {
          description: "Owned writes",
          id: "a".repeat(64),
          name: "Writes",
          serviceUrl: "https://example.invalid",
        },
      },
      async (run) => {
        const actor = mock.actor("writer");
        const connection = server.connection({
          access: run.ownerAccess,
          as: actor,
        });
        const writer = createMockApplication(connection, connection.credential);
        try {
          const file = await bytesFixture({
            bytes: Uint8Array.of(1),
            name: "n",
          });
          const object = await writer.upload({
            file,
            metadata: new Uint8Array(),
            name: "n",
          });
          expect(() =>
            mock.mutationFaults.hold({
              actor,
              object,
              operation: "pin",
              stage: "beforeCommit",
            }),
          ).toThrow();
          expect(() =>
            mock.mutationFaults.fail(
              {
                actor,
                object: { ...object },
                operation: "pin",
                stage: "beforeCommit",
              },
              { code: "denied", times: 1 },
            ),
          ).toThrow();
          await writer.pin(object);
          expect(await writer.inspect(object)).toBe("pinned");
        } finally {
          await writer.close();
        }
      },
    );
  } finally {
    await server.close();
    await mock.close();
  }
});
import { createMockEndpoint } from "../../src/testing/transport.js";
it("endpoint close retains errors cancelling a malformed body source", async () => {
  const mock = createMockSia();
  const endpoint = createMockEndpoint(mock, "http://127.0.0.1/");
  let closeError: unknown;
  try {
    await expect(
      mock.run(
        {
          app: {
            description: "Owned writes",
            id: "a".repeat(64),
            name: "Writes",
            serviceUrl: "https://example.invalid",
          },
        },
        async (run) => {
          const connection = endpoint.endpoint.connection({
            access: run.ownerAccess,
            as: mock.actor("writer"),
          });
          const headers = {
            authorization: `Bearer ${connection.credential.keyHex}`,
          };
          const response = await endpoint.dispatch(
            new Request(
              new URL(`${connection.client}/app-upload-admit`, connection.url),
              {
                body: JSON.stringify({
                  metadata: [],
                  name: "n",
                  sha256: "0".repeat(64),
                  sizeBytes: 1,
                }),
                headers,
                method: "POST",
              },
            ),
          );
          const { token } = (await response.json()) as { token: string };
          const source = new ReadableStream<Uint8Array>({
            cancel() {
              throw new Error("body cancel failed");
            },
            start(controller) {
              controller.enqueue(Uint8Array.of(1, 2));
            },
          });
          const result = await endpoint.dispatch(
            new Request(
              new URL(
                `${connection.client}/app-upload-body?token=${token}`,
                connection.url,
              ),
              { body: source, headers, method: "POST", ...{ duplex: "half" } },
            ),
          );
          expect(result.ok).toBe(false);
          closeError = await endpoint.close().catch((error: unknown) => error);
        },
      ),
    ).rejects.toBeInstanceOf(AggregateError);
    expect(closeError).toBeInstanceOf(AggregateError);
  } finally {
    await mock.close();
  }
});
it("disconnect cancels a body supplied just before the synthetic reader attaches", async () => {
  const mock = createMockSia();
  const endpoint = createMockEndpoint(mock, "http://127.0.0.1/");
  try {
    await mock.run(
      {
        app: {
          description: "Owned writes",
          id: "a".repeat(64),
          name: "Writes",
          serviceUrl: "https://example.invalid",
        },
      },
      async (run) => {
        const connection = endpoint.endpoint.connection({
          access: run.ownerAccess,
          as: mock.actor("writer"),
        });
        const headers = {
          authorization: `Bearer ${connection.credential.keyHex}`,
        };
        const admission = await endpoint.dispatch(
          new Request(
            new URL(`${connection.client}/app-upload-admit`, connection.url),
            {
              body: JSON.stringify({
                metadata: [],
                name: "n",
                sha256: "0".repeat(64),
                sizeBytes: 1,
              }),
              headers,
              method: "POST",
            },
          ),
        );
        const { token } = (await admission.json()) as { token: string };
        let cancelled = false;
        const source = new ReadableStream<Uint8Array>({
          cancel() {
            cancelled = true;
          },
        });
        const abort = new AbortController();
        const response = endpoint.dispatch(
          new Request(
            new URL(
              `${connection.client}/app-upload-body?token=${token}`,
              connection.url,
            ),
            {
              body: source,
              headers,
              method: "POST",
              signal: abort.signal,
              ...{ duplex: "half" },
            },
          ),
        );
        abort.abort();
        await response;
        await endpoint.close();
        expect(cancelled).toBe(true);
      },
    );
  } finally {
    await endpoint.close();
    await mock.close();
  }
});
it("an unrelated route ending in the upload name keeps the small body cap", async () => {
  const mock = createMockSia();
  const server = await startMockServer(mock);
  try {
    const response = await fetch(
      new URL("/unrelated/app-upload-body", server.url),
      { body: new Uint8Array(16_385), method: "POST" },
    );
    expect(response.status).toBe(413);
  } finally {
    await server.close();
    await mock.close();
  }
});
it("endpoint close cancels admission JSON before it can reserve an upload", async () => {
  const mock = createMockSia();
  const endpoint = createMockEndpoint(mock, "http://127.0.0.1/");
  try {
    await mock.run(
      {
        app: {
          description: "Owned writes",
          id: "a".repeat(64),
          name: "Writes",
          serviceUrl: "https://example.invalid",
        },
        limits: { maxObjects: 1 },
      },
      async (run) => {
        const actor = mock.actor("writer");
        const connection = endpoint.endpoint.connection({
          access: run.ownerAccess,
          as: actor,
        });
        const created = vi.spyOn(mock, "application");
        let controller!: ReadableStreamDefaultController<Uint8Array>;
        let read!: () => void;
        const reading = new Promise<void>((resolve) => {
          read = resolve;
        });
        let cancelled = false;
        const source = new ReadableStream<Uint8Array>({
          cancel() {
            cancelled = true;
          },
          pull() {
            read();
          },
          start(value) {
            controller = value;
            controller.enqueue(new TextEncoder().encode('{"name":"n",'));
          },
        });
        const pending = endpoint.dispatch(
          new Request(
            new URL(`${connection.client}/app-upload-admit`, connection.url),
            {
              body: source,
              headers: {
                authorization: `Bearer ${connection.credential.keyHex}`,
              },
              method: "POST",
              ...{ duplex: "half" },
            },
          ),
        );
        try {
          await reading;
          await endpoint.close();
          expect(cancelled).toBe(true);
          expect((await pending).ok).toBe(false);
          expect(created).not.toHaveBeenCalled();
        } finally {
          if (!cancelled) {
            controller.enqueue(
              new TextEncoder().encode(
                `"metadata":[],"sha256":"${"0".repeat(64)}","sizeBytes":1}`,
              ),
            );
            controller.close();
          }
          await pending;
          await endpoint.close();
          created.mockRestore();
        }
        const writer = mock.application({ access: run.ownerAccess, as: actor });
        try {
          const file = await bytesFixture({
            bytes: Uint8Array.of(1),
            name: "n",
          });
          expect(
            await writer.inspect(
              await writer.upload({
                file,
                metadata: new Uint8Array(),
                name: "n",
              }),
            ),
          ).toBe("uploaded");
        } finally {
          await writer.close();
        }
      },
    );
  } finally {
    await endpoint.close();
    await mock.close();
  }
});
it("endpoint close joins admission-body cancellation and retains its failure", async () => {
  const mock = createMockSia();
  const endpoint = createMockEndpoint(mock, "http://127.0.0.1/");
  const cancelFailure = new Error("admission cancellation failed");
  let finish!: () => void;
  const finishing = new Promise<void>((resolve) => {
    finish = resolve;
  });
  try {
    await mock.run(
      {
        app: {
          description: "Owned writes",
          id: "a".repeat(64),
          name: "Writes",
          serviceUrl: "https://example.invalid",
        },
      },
      async (run) => {
        const connection = endpoint.endpoint.connection({
          access: run.ownerAccess,
          as: mock.actor("writer"),
        });
        let read!: () => void;
        const reading = new Promise<void>((resolve) => {
          read = resolve;
        });
        let cancelling!: () => void;
        const cancellation = new Promise<void>((resolve) => {
          cancelling = resolve;
        });
        const source = new ReadableStream<Uint8Array>({
          async cancel() {
            cancelling();
            await finishing;
            throw cancelFailure;
          },
          pull() {
            read();
          },
        });
        const pending = endpoint.dispatch(
          new Request(
            new URL(`${connection.client}/app-upload-admit`, connection.url),
            {
              body: source,
              headers: {
                authorization: `Bearer ${connection.credential.keyHex}`,
              },
              method: "POST",
              ...{ duplex: "half" },
            },
          ),
        );
        await reading;
        let settled = false;
        const closing = endpoint.close();
        expect(endpoint.close()).toBe(closing);
        void closing.then(
          () => {
            settled = true;
          },
          () => {
            settled = true;
          },
        );
        await cancellation;
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        expect(settled).toBe(false);
        finish();
        const error: unknown = await closing.catch(
          (failure: unknown) => failure,
        );
        expect((await pending).ok).toBe(false);
        expect(error).toBeInstanceOf(AggregateError);
        const dispatchError = (error as AggregateError)
          .errors[0] as AggregateError;
        expect(dispatchError).toBeInstanceOf(AggregateError);
        expect(dispatchError.errors).toContain(cancelFailure);
        await expect(endpoint.close()).rejects.toBe(error);
      },
    );
  } finally {
    finish();
    await endpoint.close().catch(() => undefined);
    await mock.close();
  }
});
it("endpoint close waits for an upload writer still finishing failed admission cleanup", async () => {
  const mock = createMockSia();
  const endpoint = createMockEndpoint(mock, "http://127.0.0.1/");
  const cleanupFailure = new AggregateError([
    new Error("writer cleanup failed"),
  ]);
  let finish!: () => void;
  const finishing = new Promise<void>((resolve) => {
    finish = resolve;
  });
  let cleanupStarted!: () => void;
  const cleanup = new Promise<void>((resolve) => {
    cleanupStarted = resolve;
  });
  const application = mock.application.bind(mock);
  const replacement = vi
    .spyOn(mock, "application")
    .mockImplementation((input) => {
      const writer = application(input);
      return {
        ...writer,
        async close() {
          await writer.close();
          cleanupStarted();
          await finishing;
          throw cleanupFailure;
        },
      };
    });
  try {
    await mock.run(
      {
        app: {
          description: "Owned writes",
          id: "a".repeat(64),
          name: "Writes",
          serviceUrl: "https://example.invalid",
        },
        limits: { maxObjects: 0 },
      },
      async (run) => {
        const connection = endpoint.endpoint.connection({
          access: run.ownerAccess,
          as: mock.actor("writer"),
        });
        const response = endpoint.dispatch(
          new Request(
            new URL(`${connection.client}/app-upload-admit`, connection.url),
            {
              body: JSON.stringify({
                metadata: [],
                name: "n",
                sha256: "0".repeat(64),
                sizeBytes: 1,
              }),
              headers: {
                authorization: `Bearer ${connection.credential.keyHex}`,
              },
              method: "POST",
            },
          ),
        );
        await cleanup;
        expect((await response).ok).toBe(false);
        let settled = false;
        const closing = endpoint.close();
        void closing.then(
          () => {
            settled = true;
          },
          () => {
            settled = true;
          },
        );
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        expect(settled).toBe(false);
        finish();
        const error: unknown = await closing.catch(
          (failure: unknown) => failure,
        );
        expect(error).toBeInstanceOf(AggregateError);
        expect((error as AggregateError).errors).toContain(cleanupFailure);
      },
    );
  } finally {
    finish();
    replacement.mockRestore();
    await endpoint.close().catch(() => undefined);
    await mock.close();
  }
});
