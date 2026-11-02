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
