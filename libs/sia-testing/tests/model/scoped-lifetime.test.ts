/** Retained handles must not create work after teardown or duplicate a remote deletion. */
import { expect, it } from "vitest";
import { bytesFixture, createMockSia } from "../../src/testing/mock.js";
import type { BrowserAccess } from "../../src/testing/types.js";

const app = {
  description: "Scoped lifetime",
  id: "a".repeat(64),
  name: "Lifetime",
  serviceUrl: "https://example.invalid",
};

it("an unknown owner object returns a classified missing error", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("owner"),
      });
      await expect(reader.object("f".repeat(64))).rejects.toMatchObject({
        code: "not-found",
      });
    });
  } finally {
    await mock.close();
  }
});

it("parallel deletes share one owned deletion", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const file = await bytesFixture({
        bytes: Uint8Array.of(1),
        name: "video",
      });
      const object = await run.objects.upload({
        file,
        metadata: new Uint8Array(),
        name: file.name,
      });
      const results = await Promise.allSettled([
        run.objects.delete(object),
        run.objects.delete(object),
      ]);
      expect(results.map((result) => result.status)).toEqual([
        "fulfilled",
        "fulfilled",
      ]);
      expect(await run.objects.inspect(object)).toBe("missing");
    });
  } finally {
    await mock.close();
  }
});

it("an ended run cannot allocate a reader through its retained access", async () => {
  const mock = createMockSia();
  let access!: BrowserAccess;
  try {
    await mock.run({ app }, (run) => {
      access = run.ownerAccess;
      return Promise.resolve();
    });
    expect(() => mock.reader({ access, as: mock.actor("late") })).toThrowError(
      expect.objectContaining({ code: "closed" }),
    );
  } finally {
    await mock.close();
  }
});
