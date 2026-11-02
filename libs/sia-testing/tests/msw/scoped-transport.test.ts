/** MSW and HTTP must expose the same scoped fixture state and credential checks. */
import { expect, it } from "vitest";
import { setupServer } from "msw/node";
import { bytesFixture, createMockSia } from "../../src/testing/mock.js";
import { createMockReader } from "../../src/testing/client.js";
import { mockCredential } from "../../src/testing/http.js";
import { createMockHandlers } from "../../src/testing/msw.js";
import { createMockAuth } from "../../src/testing/auth-client.js";

it("MSW lists the same fixture bytes without an owner fallback", async () => {
  const adapter = { createMockHandlers };
  const mock = createMockSia();
  try {
    await mock.run(
      {
        app: {
          description: "MSW scope",
          id: "a".repeat(64),
          name: "MSW",
          serviceUrl: "https://example.invalid",
        },
      },
      async (run) => {
        const file = await bytesFixture({
          bytes: Uint8Array.of(7, 8),
          name: "video",
        });
        const object = await run.objects.upload({
          file,
          metadata: Uint8Array.of(4),
          name: file.name,
        });
        const share = await run.shares.create({ objects: [object] });
        const endpoint = adapter.createMockHandlers(mock, {
          baseUrl: "https://scoped.example.invalid/api/",
        });
        const server = setupServer(...endpoint.handlers);
        server.listen({ onUnhandledRequest: "error" });
        try {
          const ownerConnection = endpoint.connection({
            access: run.ownerAccess,
            as: mock.actor("owner"),
          });
          const credential = mockCredential(mock, run.ownerAccess);
          const auth = createMockAuth(ownerConnection, credential);
          try {
            expect(await auth.connected(credential.keyHex)).toEqual(credential);
          } finally {
            await auth.close();
          }
          const descriptor = endpoint.connection({
            access: share.access,
            as: mock.actor("recipient"),
          });
          const reader = createMockReader(
            descriptor,
            mockCredential(mock, share.access),
          );
          expect(
            (await reader.objects({ limit: 10, offset: 0 })).objects,
          ).toEqual([
            { id: object.id, metadata: Uint8Array.of(4), sizeBytes: 2 },
          ]);
          expect([
            ...new Uint8Array(
              await new Response(
                await reader.download(await reader.object(object.id)),
              ).arrayBuffer(),
            ),
          ]).toEqual([7, 8]);
          await run.shares.revoke(share);
          await expect(reader.object(object.id)).rejects.toMatchObject({
            code: "denied",
          });
          await reader.close();
        } finally {
          server.close();
        }
      },
    );
  } finally {
    await mock.close();
  }
});
