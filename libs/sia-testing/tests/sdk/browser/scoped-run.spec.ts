/** Scoped fixture hashing and recipient reads must work without Node globals. */
import { expect, test } from "@playwright/test";

test("a browser scoped run reads attached bytes and denies private bytes", async ({
  page,
}) => {
  await page.goto("/scoped.html");
  const entry = `/@fs${new URL("../../../src/testing/mock.ts", import.meta.url).pathname}`;
  const result = await page.evaluate(async (url) => {
    const { bytesFixture, createMockSia } = (await import(
      url
    )) as typeof import("../../../src/testing/mock.js");
    const mock = createMockSia();
    try {
      return await mock.run(
        {
          app: {
            description: "Portable scoped storage",
            id: "a".repeat(64),
            name: "Browser scope",
            serviceUrl: location.origin,
          },
        },
        async (run) => {
          const file = await bytesFixture({
            bytes: Uint8Array.of(1, 2, 3),
            name: "video",
          });
          const object = await run.objects.upload({
            file,
            metadata: Uint8Array.of(9),
            name: file.name,
          });
          const privateObject = await run.objects.upload({
            file,
            metadata: Uint8Array.of(8),
            name: "private",
          });
          const share = await run.shares.create({ objects: [object] });
          const reader = mock.reader({
            access: share.access,
            as: mock.actor("recipient"),
          });
          let denied = false;
          try {
            await reader.object(privateObject.id);
          } catch (error) {
            denied =
              typeof error === "object" &&
              error !== null &&
              "code" in error &&
              error.code === "denied";
          }
          const resolved = await reader.object(object.id);
          return {
            bytes: [
              ...new Uint8Array(
                await new Response(
                  await reader.download(resolved),
                ).arrayBuffer(),
              ),
            ],
            denied,
            metadata: [...resolved.metadata],
          };
        },
      );
    } finally {
      await mock.close();
    }
  }, entry);
  expect(result.value).toEqual({
    bytes: [1, 2, 3],
    denied: true,
    metadata: [9],
  });
  expect(result.summary).toMatchObject({
    cleanup: "clean",
    logicalUploadedBytes: 6,
  });
});

test("iframe bytes retain selected contents and snapshot managed metadata", async ({
  page,
}) => {
  await page.goto("/scoped.html");
  const entry = `/@fs${new URL("../../../src/mock.ts", import.meta.url).pathname}`;
  const result = await page.evaluate(async (url) => {
    const { bytesFixture, createMockSia } = (await import(
      url
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
    function bytes() {
      const value = foreign.Uint8Array.of(99, 1, 2, 3, 88).subarray(1, 4);
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
    const source = bytes();
    const identity = {
      constructorDiffers: foreign.Uint8Array !== Uint8Array,
      foreignInstance: source instanceof foreign.Uint8Array,
      hostInstance: source instanceof Uint8Array,
      streamConstructorDiffers: foreign.ReadableStream !== ReadableStream,
    };
    const mock = createMockSia();
    try {
      const pending = bytesFixture({ bytes: source, name: "foreign" });
      source.fill(77);
      const file = await pending;
      const replay = async (stream: ReadableStream<Uint8Array>) => [
        ...new Uint8Array(await new Response(stream).arrayBuffer()),
      ];
      const factory = await replay(file.open());
      const chunk = bytes();
      const stream = new foreign.ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(chunk);
          controller.close();
        },
      });
      const streamIdentity =
        stream instanceof foreign.ReadableStream &&
        !(stream instanceof ReadableStream);
      const run = await mock.run(
        {
          app: {
            description: "Iframe bytes",
            id: "a".repeat(64),
            name: "Iframe",
            serviceUrl: location.origin,
          },
        },
        async (run) => {
          const metadata = bytes();
          const uploading = run.objects.upload({
            file: { ...file, open: () => stream },
            metadata,
          });
          metadata.fill(66);
          const object = await uploading;
          const reader = mock.reader({
            access: run.ownerAccess,
            as: mock.actor("reader"),
          });
          try {
            const resolved = await reader.object(object.id);
            const collected = await replay(await reader.download(resolved));
            return {
              collected,
              managedMetadata: [...resolved.metadata],
              sizeBytes: resolved.sizeBytes,
            };
          } finally {
            await reader.close();
          }
        },
      );
      return {
        factory,
        hooks,
        identity,
        streamIdentity,
        uploadedBytes: run.summary.logicalUploadedBytes,
        value: run.value,
      };
    } finally {
      await mock.close();
      frame.remove();
    }
  }, entry);
  expect(result).toEqual({
    factory: [1, 2, 3],
    hooks: 0,
    identity: {
      constructorDiffers: true,
      foreignInstance: true,
      hostInstance: false,
      streamConstructorDiffers: true,
    },
    streamIdentity: true,
    uploadedBytes: 3,
    value: { collected: [1, 2, 3], managedMetadata: [1, 2, 3], sizeBytes: 3 },
  });
});

test("an iframe caller abort cancels a held direct read before readers close", async ({
  page,
}) => {
  await page.goto("/scoped.html");
  const entry = `/@fs${new URL("../../../src/mock.ts", import.meta.url).pathname}`;
  const result = await page.evaluate(async (url) => {
    const { createMockSia } = (await import(
      url
    )) as typeof import("../../../src/mock.js");
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
    const mock = createMockSia();
    try {
      const run = await mock.run(
        {
          app: {
            description: "Iframe abort",
            id: "a".repeat(64),
            name: "Iframe",
            serviceUrl: location.origin,
          },
        },
        async (run) => {
          const actor = mock.actor("held-reader");
          const reader = mock.reader({ access: run.ownerAccess, as: actor });
          const independent = mock.reader({
            access: run.ownerAccess,
            as: mock.actor("independent"),
          });
          const hold = mock.faults.hold({ actor, operation: "objects" });
          const reason = new Error("caller stopped");
          const pending = reader
            .objects({ limit: 1, offset: 0, signal: controller.signal })
            .then(
              () => ({ rejected: false, sameReason: false }),
              (error: unknown) => ({
                rejected: true,
                sameReason: error === reason,
              }),
            );
          try {
            await bounded(hold.started(), "direct read did not start");
            controller.abort(reason);
            const rejected = await bounded(
              pending,
              "caller abort did not reject direct read",
            );
            const receipt = await bounded(
              hold.cancelled(),
              "caller abort did not cancel direct read",
            );
            const pre = new foreign.AbortController();
            pre.abort(reason);
            const preAborted = await reader
              .objects({ limit: 1, offset: 0, signal: pre.signal })
              .then(
                () => false,
                (error: unknown) => error === reason,
              );
            return {
              ...rejected,
              independent: (await independent.objects({ limit: 1, offset: 0 }))
                .done,
              preAborted,
              sameReader: (await reader.objects({ limit: 1, offset: 0 })).done,
              status: receipt.status,
            };
          } finally {
            hold.release();
            await pending;
            await reader.close();
            await independent.close();
          }
        },
      );
      return { identity, value: run.value };
    } finally {
      await mock.close();
      frame.remove();
    }
  }, entry);
  expect(result).toEqual({
    identity: {
      constructorDiffers: true,
      foreignInstance: true,
      hostInstance: false,
      signalConstructorDiffers: true,
    },
    value: {
      independent: true,
      preAborted: true,
      rejected: true,
      sameReader: true,
      sameReason: true,
      status: "cancelled",
    },
  });
});

test("a browser edits and inspects a granted share over HTTP", async ({
  page,
}) => {
  const { createMockSia } = await import("../../../src/mock.js");
  const { startMockServer } = await import("../../../src/testing/http.js");
  const mock = createMockSia();
  const server = await startMockServer(mock);
  try {
    await mock.run(
      {
        app: {
          description: "Browser grants",
          id: "a".repeat(64),
          name: "Grants",
          serviceUrl: "https://example.invalid",
        },
      },
      async (run) => {
        const actor = mock.actor("browser editor");
        const share = await run.shares.create({ objects: [] });
        const grant = await run.shares.grant(share, {
          as: actor,
          label: "reading",
          operations: ["add", "remove", "end"],
        });
        const connection = server.connection({
          access: run.ownerAccess,
          as: actor,
          shareGrants: [grant],
        });
        await page.goto("/scoped.html");
        const entry = `/@fs${new URL("../../../src/client.ts", import.meta.url).pathname}`;
        const fixtures = `/@fs${new URL("../../../src/mock.ts", import.meta.url).pathname}`;
        const result = await page.evaluate(
          async ({ connection, entry, fixtures }) => {
            const { createMockApplication } = (await import(
              entry
            )) as typeof import("../../../src/client.js");
            const { bytesFixture } = (await import(
              fixtures
            )) as typeof import("../../../src/mock.js");
            const writer = createMockApplication(
              connection,
              connection.credential,
            );
            try {
              const [target] = await writer.shares.targets();
              const object = await writer.upload({
                file: await bytesFixture({
                  bytes: Uint8Array.of(8, 9),
                  name: "note",
                }),
                metadata: new Uint8Array(),
              });
              await writer.pin(object);
              await writer.shares.add(target!.ref, object);
              const added = await writer.shares.inspect(target!.ref, object.id);
              await writer.shares.remove(target!.ref, object.id);
              const removed = await writer.shares.inspect(
                target!.ref,
                object.id,
              );
              await writer.shares.end(target!.ref);
              return {
                added,
                ended: await writer.shares.inspect(target!.ref, null),
                label: target!.label,
                object: await writer.inspect(object),
                removed,
              };
            } finally {
              await writer.close();
            }
          },
          { connection, entry, fixtures },
        );
        expect(result).toEqual({
          added: { contains: true, state: "active" },
          ended: { contains: null, state: "ended" },
          label: "reading",
          object: "pinned",
          removed: { contains: false, state: "active" },
        });
      },
    );
  } finally {
    await server.close();
    await mock.close();
  }
});
