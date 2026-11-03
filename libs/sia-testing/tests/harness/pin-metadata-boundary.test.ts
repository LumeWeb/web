/** Polls read projections while the mock SDK pin crosses its synchronous model effect. */
import { expect, it } from "vitest";
import { bytesFixture, createMockSia } from "../../src/mock.js";
import { app } from "./application-scenarios.js";
it("first readable metadata and its receipt cross the pin boundary together", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const writer = mock.application({
        access: run.ownerAccess,
        as: mock.actor("writer"),
      });
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("reader"),
      });
      try {
        const file = await bytesFixture({ bytes: Uint8Array.of(1), name: "n" });
        const object = await writer.upload({
          file,
          metadata: Uint8Array.of(10),
        });
        const reads: Promise<void>[] = [];
        const pinning = writer.pin(object, { metadata: Uint8Array.of(20) });
        for (let tick = 0; tick < 24; tick++) {
          reads.push(
            reader.objects({ limit: 10, offset: 0 }).then((page) => {
              for (const value of page.objects) {
                expect(value.metadata).toEqual(Uint8Array.of(20));
                expect(
                  mock.history().find((row) => row.operation === "pin")
                    ?.committed,
                ).toBe(true);
              }
            }),
          );
          await Promise.resolve();
        }
        await pinning;
        await Promise.all(reads);
        const repinning = writer.pin(object, { metadata: Uint8Array.of(30) });
        const repinReads: Promise<void>[] = [];
        for (let tick = 0; tick < 24; tick++) {
          if (
            mock.history().filter((row) => row.operation === "pin")[1]
              ?.committed
          ) {
            repinReads.push(
              reader.objects({ limit: 10, offset: 0 }).then((page) => {
                expect(page.objects[0]!.metadata).toEqual(Uint8Array.of(30));
              }),
            );
          }
          await Promise.resolve();
        }
        await repinning;
        expect(repinReads.length).toBeGreaterThan(0);
        await Promise.all(repinReads);
      } finally {
        await reader.close();
        await writer.close();
      }
    });
  } finally {
    await mock.close();
  }
});
it("SDK pin completion runs only after the model accepts the synchronous effect", async () => {
  const { createMockNetwork } = await import("../../src/sdk/index.js");
  const network = createMockNetwork();
  network.model.createAccount({ publicKey: "account" });
  const sdk = network.createSdk({ accountId: "account" });
  const object = await sdk.upload(Uint8Array.of(1), { id: "object" });
  const denied = new Error("ownership was removed");
  await expect(
    sdk.pinObject(object, {
      prepareCommit() {
        throw denied;
      },
    }),
  ).rejects.toBe(denied);
  expect(network.model.object("account", "object")).toBeUndefined();
  let completions = 0;
  for (let attempt = 0; attempt < 2; attempt++) {
    await sdk.pinObject(object, {
      prepareCommit() {
        return () => {
          expect(network.model.object("account", "object")).toBeDefined();
          completions++;
        };
      },
    });
  }
  expect(completions).toBe(2);
  await expect(
    sdk.pinObject(
      { id: () => "missing" },
      {
        prepareCommit: () => () => {
          completions++;
        },
      },
    ),
  ).rejects.toThrow();
  expect(completions).toBe(2);
  const release = network.control.hold({ operation: "pinObject" });
  const pinning = sdk.pinObject(object, {
    prepareCommit() {
      throw denied;
    },
  });
  const rejected = expect(pinning).rejects.toBe(denied);
  await sdk.deleteObject("object");
  release();
  await rejected;
  expect(network.model.object("account", "object")).toBeUndefined();
});
