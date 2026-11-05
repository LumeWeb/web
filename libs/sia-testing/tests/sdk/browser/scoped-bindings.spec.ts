/** Owner and recipient pages must never inherit each other's storage or endpoint authority. */
import { expect } from "@playwright/test";
import { createSiaTest } from "../../../src/testing/playwright.js";
import { bytesFixture } from "../../../src/testing/mock.js";
const test = createSiaTest({
  backend: {
    app: {
      description: "Binding test",
      id: "a".repeat(64),
      name: "Bindings",
      serviceUrl: "https://example.invalid",
    },
    kind: "mock",
  },
});
test("bindings isolate browser storage and enforce revoked recipient access", async ({
  sia,
}) => {
  const file = await bytesFixture({
    bytes: Uint8Array.of(1, 2),
    name: "video",
  });
  const object = await sia.objects.upload({
    file,
    metadata: new Uint8Array(),
    name: file.name,
  });
  const share = await sia.shares.create({ objects: [object] });
  const owner = await sia.browser.open({
    access: sia.ownerAccess,
    async apply(page) {
      await page.goto("/scoped.html");
      await page.evaluate(() =>
        localStorage.setItem("private-owner-value", "owner"),
      );
    },
  });
  let read!: () => Promise<number>;
  const recipient = await sia.browser.open({
    access: share.access,
    async apply(page, connection) {
      await page.goto("/scoped.html");
      const backend = connection.backend;
      read = () =>
        page.evaluate(
          async ({ connection, id, keyHex }) => {
            const response = await fetch(
              new URL(`${connection.client}/object?id=${id}`, connection.url),
              { headers: { authorization: `Bearer ${keyHex}` } },
            );
            return response.status;
          },
          {
            connection: backend.connection,
            id: object.id,
            keyHex: backend.credential.keyHex,
          },
        );
    },
  });
  expect(owner.context()).not.toBe(recipient.context());
  expect(
    await recipient.evaluate(() => localStorage.getItem("private-owner-value")),
  ).toBeNull();
  expect(await read()).toBe(200);
  await sia.shares.revoke(share);
  expect(await read()).toBe(403);
});
test("a browser uploads an admitted raw body over the loopback listener", async ({
  sia,
}) => {
  const clientEntry = `/@fs${new URL("../../../src/client.ts", import.meta.url).pathname}`;
  const mockEntry = `/@fs${new URL("../../../src/mock.ts", import.meta.url).pathname}`;
  let result: unknown;
  await sia.browser.open({
    access: sia.ownerAccess,
    async apply(page, connection) {
      await page.goto("/scoped.html");
      result = await page.evaluate(
        async ({ backend, clientEntry, mockEntry }) => {
          const { createMockApplication } = (await import(
            clientEntry
          )) as typeof import("../../../src/client.js");
          const { bytesFixture } = (await import(
            mockEntry
          )) as typeof import("../../../src/mock.js");
          const writer = createMockApplication(
            backend.connection,
            backend.credential,
          );
          try {
            const file = await bytesFixture({
              bytes: new Uint8Array(20_000).fill(7),
              name: "browser",
            });
            const object = await writer.upload({
              file,
              metadata: new Uint8Array(),
            });
            const uploaded = await writer.inspect(object);
            await writer.pin(object);
            return {
              events: (await writer.events({ cursor: null, limit: 10 })).events,
              pinned: await writer.inspect(object),
              uploaded,
            };
          } finally {
            await writer.close();
          }
        },
        { backend: connection.backend, clientEntry, mockEntry },
      );
    },
  });
  expect(result).toEqual({
    events: [],
    pinned: "pinned",
    uploaded: "uploaded",
  });
});
test("a browser inspects its known object after the pin connection drops", async ({
  sia,
}) => {
  const actor = sia.mock.actor("browser-writer");
  sia.mock.mutationFaults.loseReply({ actor, operation: "pin" }, { times: 1 });
  const clientEntry = `/@fs${new URL("../../../src/client.ts", import.meta.url).pathname}`;
  const mockEntry = `/@fs${new URL("../../../src/mock.ts", import.meta.url).pathname}`;
  let result: unknown;
  await sia.browser.open({
    access: sia.ownerAccess,
    async apply(page, connection) {
      await page.goto("/scoped.html");
      result = await page.evaluate(
        async ({ backend, clientEntry, mockEntry }) => {
          const { createMockApplication } = (await import(
            clientEntry
          )) as typeof import("../../../src/client.js");
          const { bytesFixture } = (await import(
            mockEntry
          )) as typeof import("../../../src/mock.js");
          const writer = createMockApplication(
            backend.connection,
            backend.credential,
          );
          try {
            const file = await bytesFixture({
              bytes: Uint8Array.of(1),
              name: "browser",
            });
            const object = await writer.upload({
              file,
              metadata: new Uint8Array(),
              name: file.name,
            });
            let networkFailure = false;
            try {
              await writer.pin(object);
            } catch (error) {
              networkFailure = error instanceof TypeError;
            }
            return {
              events: (await writer.events({ cursor: null, limit: 10 })).events,
              networkFailure,
              state: await writer.inspect(object),
            };
          } finally {
            await writer.close();
          }
        },
        { backend: connection.backend, clientEntry, mockEntry },
      );
    },
    mockActor: actor,
  });
  expect(result).toEqual({ events: [], networkFailure: true, state: "pinned" });
  expect(
    sia.mock.history().filter((row) => row.operation === "pin"),
  ).toMatchObject([{ committed: true, status: "failed" }]);
});

test("an iframe caller abort cancels a held Fetch read before readers close", async ({
  sia,
}) => {
  const actor = sia.mock.actor("iframe-fetch");
  const hold = sia.mock.faults.hold({ actor, operation: "objects" });
  const clientEntry = `/@fs${new URL("../../../src/client.ts", import.meta.url).pathname}`;
  async function bounded<T>(work: Promise<T>, label: string): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        work,
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error(label)), 3000);
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  }
  let result: unknown;
  try {
    await sia.browser.open({
      access: sia.ownerAccess,
      async apply(page, connection) {
        await page.exposeFunction(
          "waitForIframeRead",
          async (phase: string) => {
            // The backend receipt must arrive while the browser reader is still open.
            const receipt = await bounded(
              phase === "started" ? hold.started() : hold.cancelled(),
              `Fetch read did not report ${phase}`,
            );
            return { actorLabel: receipt.actorLabel, status: receipt.status };
          },
        );
        await page.goto("/scoped.html");
        result = await page.evaluate(
          async ({ backend, clientEntry }) => {
            const { createMockReader } = (await import(
              clientEntry
            )) as typeof import("../../../src/client.js");
            const bridge = (
              window as unknown as {
                waitForIframeRead(
                  this: void,
                  phase: string,
                ): Promise<{ actorLabel: string; status: string }>;
              }
            ).waitForIframeRead;
            async function bounded<T>(
              work: Promise<T>,
              label: string,
            ): Promise<T> {
              let timer: ReturnType<typeof setTimeout> | undefined;
              try {
                return await Promise.race([
                  work,
                  new Promise<never>((_, reject) => {
                    timer = setTimeout(() => reject(new Error(label)), 4000);
                  }),
                ]);
              } finally {
                clearTimeout(timer);
              }
            }
            const frame = document.createElement("iframe");
            const loaded = new Promise<void>((resolve) => {
              frame.onload = () => resolve();
            });
            frame.src = "/scoped.html";
            document.body.append(frame);
            await loaded;
            const foreign = frame.contentWindow as typeof globalThis & Window;
            const controller = new foreign.AbortController();
            const identity = {
              constructorDiffers: foreign.AbortController !== AbortController,
              foreignInstance: controller.signal instanceof foreign.AbortSignal,
              hostInstance: controller.signal instanceof AbortSignal,
              signalConstructorDiffers: foreign.AbortSignal !== AbortSignal,
            };
            const reader = createMockReader(
              backend.connection,
              backend.credential,
            );
            const independent = createMockReader(
              backend.connection,
              backend.credential,
            );
            const pending = reader
              .objects({ limit: 1, offset: 0, signal: controller.signal })
              .then(
                () => ({ name: "", rejected: false }),
                (error: unknown) => ({
                  name:
                    error instanceof foreign.DOMException
                      ? error.name
                      : "unknown",
                  rejected: true,
                }),
              );
            try {
              const started = await bridge("started");
              controller.abort();
              const rejected = await bounded(
                pending,
                "caller abort did not reject Fetch read",
              );
              const cancelled = await bridge("cancelled");
              const pre = new foreign.AbortController();
              pre.abort();
              const preAborted = await reader
                .objects({ limit: 1, offset: 0, signal: pre.signal })
                .then(
                  () => false,
                  (error: unknown) =>
                    error instanceof foreign.DOMException &&
                    error.name === "AbortError",
                );
              return {
                cancelled,
                identity,
                started,
                ...rejected,
                independent: (
                  await independent.objects({ limit: 1, offset: 0 })
                ).done,
                preAborted,
                sameReader: (await reader.objects({ limit: 1, offset: 0 }))
                  .done,
              };
            } finally {
              await reader.close();
              await independent.close();
              await pending;
              frame.remove();
            }
          },
          { backend: connection.backend, clientEntry },
        );
      },
      mockActor: actor,
    });
  } finally {
    hold.release();
  }
  expect(result).toEqual({
    cancelled: { actorLabel: "iframe-fetch", status: "cancelled" },
    identity: {
      constructorDiffers: true,
      foreignInstance: true,
      hostInstance: false,
      signalConstructorDiffers: true,
    },
    independent: true,
    name: "AbortError",
    preAborted: true,
    rejected: true,
    sameReader: true,
    started: { actorLabel: "iframe-fetch", status: "pending" },
  });
});

test("iframe upload accepts foreign metadata and pin copies it before caller mutation", async ({
  sia,
}) => {
  const clientEntry = `/@fs${new URL("../../../src/client.ts", import.meta.url).pathname}`;
  const mockEntry = `/@fs${new URL("../../../src/mock.ts", import.meta.url).pathname}`;
  let result: unknown;
  await sia.browser.open({
    access: sia.ownerAccess,
    async apply(page, connection) {
      await page.goto("/scoped.html");
      result = await page.evaluate(
        async ({ backend, clientEntry, mockEntry }) => {
          const { createMockApplication, createMockReader } = (await import(
            clientEntry
          )) as typeof import("../../../src/client.js");
          const { bytesFixture } = (await import(
            mockEntry
          )) as typeof import("../../../src/mock.js");
          const frame = document.createElement("iframe");
          const loaded = new Promise<void>((resolve) => {
            frame.onload = () => resolve();
          });
          frame.src = "/scoped.html";
          document.body.append(frame);
          await loaded;
          const foreign = frame.contentWindow as typeof globalThis & Window;
          let hooks = 0;
          function bytes(first = 4, second = 5) {
            const value = foreign.Uint8Array.of(99, first, second, 88).subarray(
              1,
              3,
            );
            for (const key of [
              "buffer",
              "byteLength",
              "byteOffset",
              Symbol.iterator,
              Symbol.toStringTag,
            ]) {
              Object.defineProperty(value, key, {
                get() {
                  hooks++;
                  throw new Error("shadow hook read");
                },
              });
            }
            return value;
          }
          const metadata = bytes();
          const identity = {
            constructorDiffers: foreign.Uint8Array !== Uint8Array,
            foreignInstance: metadata instanceof foreign.Uint8Array,
            hostInstance: metadata instanceof Uint8Array,
          };
          const writer = createMockApplication(
            backend.connection,
            backend.credential,
          );
          const reader = createMockReader(
            backend.connection,
            backend.credential,
          );
          try {
            const file = await bytesFixture({ bytes: bytes(), name: "iframe" });
            const uploading = writer.upload({ file, metadata });
            const object = await uploading;
            await writer.pin(object);
            const uploaded = await reader.object(object.id);
            const pinMetadata = bytes(6, 7);
            const pinning = writer.pin(object, { metadata: pinMetadata });
            pinMetadata.fill(66);
            await pinning;
            const pinned = await reader.object(object.id);
            const body = [
              ...new Uint8Array(
                await new Response(await reader.download(pinned)).arrayBuffer(),
              ),
            ];
            return {
              body,
              hooks,
              identity,
              pinned: [...pinned.metadata],
              sizeBytes: pinned.sizeBytes,
              uploaded: [...uploaded.metadata],
            };
          } finally {
            await writer.close();
            await reader.close();
            frame.remove();
          }
        },
        { backend: connection.backend, clientEntry, mockEntry },
      );
    },
  });
  expect(result).toEqual({
    body: [4, 5],
    hooks: 0,
    identity: {
      constructorDiffers: true,
      foreignInstance: true,
      hostInstance: false,
    },
    pinned: [6, 7],
    sizeBytes: 2,
    uploaded: [4, 5],
  });
});

test("a browser upload reply loss leaves no handle and opens its source once", async ({
  sia,
}) => {
  const actor = sia.mock.actor("browser-upload-loss");
  sia.mock.mutationFaults.loseReply(
    { actor, operation: "upload" },
    { times: 1 },
  );
  const clientEntry = `/@fs${new URL("../../../src/client.ts", import.meta.url).pathname}`;
  const mockEntry = `/@fs${new URL("../../../src/mock.ts", import.meta.url).pathname}`;
  let result: unknown;
  await sia.browser.open({
    access: sia.ownerAccess,
    async apply(page, connection) {
      await page.goto("/scoped.html");
      result = await page.evaluate(
        async ({ backend, clientEntry, mockEntry }) => {
          const { createMockApplication } = (await import(
            clientEntry
          )) as typeof import("../../../src/client.js");
          const { bytesFixture } = (await import(
            mockEntry
          )) as typeof import("../../../src/mock.js");
          const writer = createMockApplication(
            backend.connection,
            backend.credential,
          );
          let opened = 0;
          let handle = false;
          let failed = false;
          try {
            const file = await bytesFixture({
              bytes: Uint8Array.of(7),
              name: "browser-lost",
            });
            try {
              await writer.upload({
                file: {
                  ...file,
                  open() {
                    opened++;
                    return file.open();
                  },
                },
                metadata: Uint8Array.of(19),
              });
              handle = true;
            } catch (error) {
              failed = error instanceof Error;
            }
            return {
              events: (await writer.events({ cursor: null, limit: 10 })).events,
              failed,
              handle,
              opened,
            };
          } finally {
            await writer.close();
          }
        },
        { backend: connection.backend, clientEntry, mockEntry },
      );
    },
    mockActor: actor,
  });
  expect(result).toEqual({
    events: [],
    failed: true,
    handle: false,
    opened: 1,
  });
  const uploads = sia.mock
    .history()
    .filter((row) => row.operation === "upload");
  expect(uploads).toMatchObject([
    { committed: true, objectId: expect.any(String), status: "failed" },
  ]);
  const writer = sia.mock.application({ access: sia.ownerAccess, as: actor });
  const reader = sia.mock.reader({ access: sia.ownerAccess, as: actor });
  try {
    const forged = { id: uploads[0]!.objectId! } as Parameters<
      typeof writer.inspect
    >[0];
    await expect(writer.inspect(forged)).rejects.toMatchObject({
      code: "foreign-handle",
    });
    await sia.mock.publish({ access: sia.ownerAccess });
    expect((await writer.events({ cursor: null, limit: 10 })).events).toEqual(
      [],
    );
    await expect(reader.object(forged.id)).rejects.toBeDefined();
    expect(
      sia.mock.history().filter((row) => row.operation === "upload"),
    ).toHaveLength(1);
  } finally {
    await writer.close();
    await reader.close();
  }
});

test("chunked browser fixtures reach a backend collection hold before the upload commits", async ({
  sia,
}) => {
  const actor = sia.mock.actor("chunked-browser");
  const hold = sia.mock.mutationFaults.hold({
    actor,
    afterBytes: 3,
    operation: "upload",
    stage: "collect",
  });
  const clientEntry = `/@fs${new URL("../../../src/client.ts", import.meta.url).pathname}`;
  const mockEntry = `/@fs${new URL("../../../src/mock.ts", import.meta.url).pathname}`;
  let completed!: Promise<unknown>;
  await sia.browser.open({
    access: sia.ownerAccess,
    async apply(page, connection) {
      await page.goto("/scoped.html");
      completed = page.evaluate(
        async ({ backend, clientEntry, mockEntry }) => {
          const { createMockApplication } = (await import(
            clientEntry
          )) as typeof import("../../../src/client.js");
          const { chunkedFixture } = (await import(
            mockEntry
          )) as typeof import("../../../src/mock.js");
          const file = await chunkedFixture({
            chunkSizeBytes: 3,
            name: "chunks",
            pattern: Uint8Array.of(1, 2),
            sizeBytes: 7,
          });
          const writer = createMockApplication(
            backend.connection,
            backend.credential,
          );
          try {
            const object = await writer.upload({
              file,
              metadata: new Uint8Array(),
            });
            return { hash: file.sha256, state: await writer.inspect(object) };
          } finally {
            await writer.close();
          }
        },
        { backend: connection.backend, clientEntry, mockEntry },
      );
    },
    mockActor: actor,
  });
  const started = await hold.started();
  expect(started.stage).toBe("collect");
  expect(started.bytes).toBeGreaterThanOrEqual(3);
  expect(
    sia.mock.history().filter((row) => row.operation === "upload"),
  ).toHaveLength(0);
  hold.release();
  expect(await completed).toMatchObject({ state: "uploaded" });
  expect(
    sia.mock.history().filter((row) => row.operation === "upload"),
  ).toHaveLength(1);
});
