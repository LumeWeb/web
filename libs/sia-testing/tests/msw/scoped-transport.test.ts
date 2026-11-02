/** MSW and HTTP must expose the same scoped fixture state and credential checks. */
import { expect, it } from "vitest";
import { setupServer } from "msw/node";
import { bytesFixture, createMockSia } from "../../src/testing/mock.js";
import { createMockAuth } from "../../src/testing/auth-client.js";
import { createMockReader } from "../../src/testing/client.js";
import { createMockHandlers } from "../../src/testing/msw.js";

it("MSW registration uses the driver's approval state", async () => {
  const mock = createMockSia();
  const app = {
    description: "MSW auth",
    id: "a".repeat(64),
    name: "Auth",
    serviceUrl: "https://example.invalid",
  };
  try {
    await mock.run({ app }, async (run) => {
      const endpoint = createMockHandlers(mock, {
        baseUrl: "https://scoped.example.invalid/",
      });
      const server = setupServer(...endpoint.handlers);
      server.listen({ onUnhandledRequest: "error" });
      try {
        const auth = createMockAuth(
          endpoint.connection({
            access: run.auth.registrationAccess,
            as: mock.actor("login"),
          }),
        );
        const request = await auth.requestConnection(app);
        await run.auth.approve(request.responseUrl);
        await auth.waitForApproval(request);
        expect(
          (await auth.register(request, run.auth.fixturePhrase)).kind,
        ).toBe("app-key");
        await auth.close();
      } finally {
        server.close();
      }
    });
  } finally {
    await mock.close();
  }
});

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
          const credential = ownerConnection.credential;
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
          const reader = createMockReader(descriptor, descriptor.credential);
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
