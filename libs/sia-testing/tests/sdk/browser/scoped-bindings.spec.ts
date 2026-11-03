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
