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
