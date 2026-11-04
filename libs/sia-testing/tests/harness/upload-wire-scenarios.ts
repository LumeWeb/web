/** Consumed upload admissions cannot replay an effect or recover its missing handle. */
import { expect, it, vi } from "vitest";
import { bytesFixture, createMockSia } from "../../src/mock.js";
import type { MockSia } from "../../src/mock.js";
import { createMockApplication } from "../../src/client.js";
import type {
  MockConnection,
  MockEndpoint,
} from "../../src/testing/transport.js";
import { app } from "./application-scenarios.js";
import * as sdkModule from "../../src/sdk/index.js";
type Endpoint = MockEndpoint & { close(): Promise<void> };
export function uploadWireScenarios(
  start: (mock: MockSia) => Promise<Endpoint>,
) {
  it("lost upload body replies consume admission without minting a reference or refunding bytes", async () => {
    const mock = createMockSia();
    const makeNetwork = sdkModule.createMockNetwork;
    let effects = 0;
    const factory = vi
      .spyOn(sdkModule, "createMockNetwork")
      .mockImplementation((...args) => {
        const network = makeNetwork(...args);
        const pinSlab = network.model.pinSlab.bind(network.model);
        vi.spyOn(network.model, "pinSlab").mockImplementation(
          (...parameters) => {
            pinSlab(...parameters);
            effects++;
          },
        );
        return network;
      });
    const endpoint = await start(mock);
    try {
      await mock.run(
        { app, limits: { maxLogicalUploadBytes: 1, maxObjects: 2 } },
        async (run) => {
          await mock.run({ app }, async (siblingRun) => {
            const actor = mock.actor("writer");
            const connection = endpoint.connection({
              access: run.ownerAccess,
              as: actor,
            });
            const siblingConnection = endpoint.connection({
              access: siblingRun.ownerAccess,
              as: actor,
            });
            const sibling = createMockApplication(
              siblingConnection,
              siblingConnection.credential,
            );
            const writer = createMockApplication(
              connection,
              connection.credential,
            );
            const file = await bytesFixture({
              bytes: Uint8Array.of(6),
              name: "n",
            });
            const post = (
              binding: MockConnection & { credential: { keyHex: string } },
              operation: string,
              body?: BodyInit,
            ) =>
              fetch(new URL(`${binding.client}/${operation}`, binding.url), {
                body: body ?? null,
                headers: {
                  authorization: `Bearer ${binding.credential.keyHex}`,
                },
                method: "POST",
              });
            try {
              const admission = await post(
                connection,
                "app-upload-admit",
                JSON.stringify({
                  metadata: [9],
                  name: "n",
                  sha256: file.sha256,
                  sizeBytes: 1,
                }),
              );
              expect(admission.status).toBe(200);
              const { token } = (await admission.json()) as { token: string };
              mock.mutationFaults.loseReply(
                { actor, operation: "upload" },
                { times: 1 },
              );
              const outcome = await post(
                connection,
                `app-upload-body?token=${token}`,
                Uint8Array.of(6),
              )
                .then(async (response): Promise<unknown> => response.json())
                .catch((error: unknown) => error);
              expect(outcome).toBeInstanceOf(Error);
              expect(outcome).not.toHaveProperty("ref");
              expect(effects).toBe(1);
              const rows = mock
                .history()
                .filter((row) => row.operation === "upload");
              expect(rows).toMatchObject([
                {
                  committed: true,
                  objectId: expect.any(String) as unknown,
                  status: "failed",
                },
              ]);
              for (const binding of [connection, siblingConnection]) {
                expect(
                  (
                    await post(
                      binding,
                      `app-upload-body?token=${token}`,
                      Uint8Array.of(6),
                    )
                  ).status,
                ).toBe(403);
                expect(
                  (await post(binding, `app-upload-cancel?token=${token}`))
                    .status,
                ).toBe(403);
              }
              const inspect = await post(
                connection,
                "app-inspect",
                JSON.stringify({ ref: rows[0]!.objectId }),
              );
              expect(await inspect.json()).toMatchObject({
                code: "foreign-handle",
              });
              const open = vi.fn(file.open.bind(file));
              await expect(
                writer.upload({
                  file: { ...file, open },
                  metadata: new Uint8Array(),
                }),
              ).rejects.toMatchObject({ code: "limit" });
              expect(open).not.toHaveBeenCalled();
              expect(
                mock.history().filter((row) => row.operation === "upload"),
              ).toHaveLength(1);
              expect(effects).toBe(1);
              const control = await sibling.upload({
                file,
                metadata: new Uint8Array(),
              });
              await sibling.pin(control);
              expect(await sibling.inspect(control)).toBe("pinned");
              await writer.close();
              expect(await sibling.inspect(control)).toBe("pinned");
            } finally {
              await writer.close();
              await sibling.close();
            }
          });
        },
      );
    } finally {
      factory.mockRestore();
      await endpoint.close();
      await mock.close();
    }
  });

  it("a forwarded admission whose reply is withheld never opens the client file or stages bytes", async () => {
    const mock = createMockSia();
    const endpoint = await start(mock);
    const fetch = globalThis.fetch;
    const reason = new Error("admission delivery failed");
    let admitted = false;
    const forwarding = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (input, init) => {
        const response = await fetch(input, init);
        if (
          (input instanceof Request ? input.url : input.toString()).includes(
            "/app-upload-admit",
          )
        ) {
          expect(response.status).toBe(200);
          admitted = true;
          await response.arrayBuffer();
          throw reason;
        }
        return response;
      });
    try {
      await mock.run({ app }, async (run) => {
        const connection = endpoint.connection({
          access: run.ownerAccess,
          as: mock.actor("writer"),
        });
        const writer = createMockApplication(connection, connection.credential);
        try {
          const file = await bytesFixture({
            bytes: Uint8Array.of(1),
            name: "n",
          });
          const open = vi.fn(file.open.bind(file));
          await expect(
            writer.upload({
              file: { ...file, open },
              metadata: new Uint8Array(),
            }),
          ).rejects.toBe(reason);
          expect(admitted).toBe(true);
          expect(open).not.toHaveBeenCalled();
          expect(
            mock.history().filter((row) => row.operation === "upload"),
          ).toEqual([]);
        } finally {
          await writer.close();
        }
      });
      expect(
        mock.history().filter((row) => row.operation === "upload"),
      ).toEqual([]);
    } finally {
      forwarding.mockRestore();
      await endpoint.close();
      await mock.close();
    }
  });
}
