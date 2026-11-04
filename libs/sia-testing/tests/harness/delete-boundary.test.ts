/** Observes public reads immediately after the real model removes a pinned object. */
import { expect, it, vi } from "vitest";
import { bytesFixture, createMockSia } from "../../src/mock.js";
import * as sdkModule from "../../src/sdk/index.js";
import { app } from "./application-scenarios.js";

it.each([false, true])(
  "deletion reads and receipt agree at the effect boundary (late cancellation: %s)",
  async (cancelLate) => {
    const createNetwork = sdkModule.createMockNetwork;
    let observe = () => undefined as void;
    const factory = vi
      .spyOn(sdkModule, "createMockNetwork")
      .mockImplementation((options) => {
        const network = createNetwork(options);
        const remove = network.model.deleteObject.bind(network.model);
        vi.spyOn(network.model, "deleteObject").mockImplementation(
          (...args) => {
            remove(...args);
            observe();
          },
        );
        return network;
      });
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
          const object = await writer.upload({
            file: await bytesFixture({ bytes: Uint8Array.of(1), name: "n" }),
            metadata: Uint8Array.of(20),
          });
          await writer.pin(object);
          expect((await reader.object(object.id)).metadata).toEqual(
            Uint8Array.of(20),
          );
          const abort = new AbortController();
          let observation: Promise<unknown> | undefined;
          observe = () => {
            observation = Promise.all([
              writer.inspect(object),
              Promise.resolve().then(
                () =>
                  mock.history().find((row) => row.operation === "delete")
                    ?.committed,
              ),
              reader.objects({ limit: 10, offset: 0 }),
              reader.object(object.id).catch((error: unknown) => error),
              reader.download(object).catch((error: unknown) => error),
            ]);
            if (cancelLate) abort.abort(new Error("late cancellation"));
          };
          await writer.delete(object, { signal: abort.signal });
          expect(observation).toBeDefined();
          const values = (await observation) as unknown[];
          expect(values[2]).toMatchObject({ objects: [] });
          expect(values[3]).toMatchObject({ code: "not-found" });
          expect(values[4]).toMatchObject({ code: "not-found" });
          expect(values.slice(0, 2)).toEqual(["missing", true]);
          await writer.delete(object);
          expect(await writer.inspect(object)).toBe("missing");
        } finally {
          await reader.close();
          await writer.close();
        }
      });
    } finally {
      factory.mockRestore();
      await mock.close();
    }
  },
);

it("SDK delete completion follows successful model deletion and skips rejected effects", async () => {
  const network = sdkModule.createMockNetwork();
  network.model.createAccount({ publicKey: "account" });
  const sdk = network.createSdk({ accountId: "account" });
  const object = await sdk.upload(Uint8Array.of(1), { id: "object" });
  await sdk.pinObject(object);
  const denied = new Error("ownership removed");
  await expect(
    sdk.deleteObject("object", {
      prepareCommit() {
        throw denied;
      },
    }),
  ).rejects.toBe(denied);
  expect(network.model.object("account", "object")).toBeDefined();
  let completions = 0;
  const remove = vi
    .spyOn(network.model, "deleteObject")
    .mockImplementationOnce(() => {
      throw denied;
    });
  try {
    await expect(
      sdk.deleteObject("object", {
        prepareCommit: () => () => {
          completions++;
        },
      }),
    ).rejects.toBe(denied);
    expect(completions).toBe(0);
    expect(network.model.object("account", "object")).toBeDefined();
  } finally {
    remove.mockRestore();
  }
  await sdk.deleteObject("object", {
    prepareCommit: () => () => {
      expect(network.model.object("account", "object")).toBeUndefined();
      completions++;
    },
  });
  expect(completions).toBe(1);
  await expect(sdk.object("object")).rejects.toThrow();
  await expect(sdk.download(object)).rejects.toThrow();
});
