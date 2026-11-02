/** Fixture limits must use the descriptor accepted before a caller can change its fields. */
import { expect, it } from "vitest";
import { createMockSia } from "../../src/testing/mock.js";

const app = {
  description: "Scoped inputs",
  id: "a".repeat(64),
  name: "Inputs",
  serviceUrl: "https://example.invalid",
};

it("changing a pending file descriptor cannot increase its upload allowance", async () => {
  const mock = createMockSia();
  let source!: ReadableStreamDefaultController<Uint8Array>;
  let started!: () => void;
  const ready = new Promise<void>((resolve) => {
    started = resolve;
  });
  const file = {
    name: "abc",
    open: () =>
      new ReadableStream<Uint8Array>({
        start(controller) {
          source = controller;
          started();
        },
      }),
    sha256: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    sizeBytes: 3,
  };
  try {
    await mock.run(
      { app, limits: { maxLogicalUploadBytes: 3 } },
      async (run) => {
        const upload = run.objects.upload({
          file,
          metadata: new Uint8Array(),
          name: file.name,
        });
        await ready;
        file.sizeBytes = 4;
        file.sha256 =
          "88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589";
        source.enqueue(Uint8Array.of(97, 98, 99, 100));
        source.close();
        await expect(upload).rejects.toMatchObject({ code: "invalid-input" });
      },
    );
  } finally {
    await mock.close();
  }
});
