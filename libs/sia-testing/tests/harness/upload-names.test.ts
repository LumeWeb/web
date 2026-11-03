/** Managed fixture labels do not populate opaque application metadata. */
import { expect, it } from "vitest";
import { bytesFixture, createMockSia } from "../../src/mock.js";
import { app } from "./application-scenarios.js";
it("managed uploads default labels from one descriptor snapshot and preserve metadata", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("reader"),
      });
      try {
        const source = await bytesFixture({
          bytes: Uint8Array.of(1),
          name: "fixture",
        });
        const encoded = Uint8Array.of(123, 37, 50, 70, 125);
        for (const [name, metadata, descriptorName = "fixture"] of [
          [undefined, new Uint8Array()],
          [undefined, encoded],
          ["override", encoded],
          ["override", encoded, ""],
          ["override", encoded, "é".repeat(513)],
          ["   ", new Uint8Array()],
          ["é".repeat(1025), encoded],
        ] as const) {
          let reads = 0;
          const file = {
            ...source,
            get name() {
              reads++;
              return reads === 1 ? descriptorName : "";
            },
          };
          const object = await run.objects.upload({ file, metadata, name });
          expect(reads).toBe(1);
          expect(await run.objects.inspect(object)).toBe("present");
          expect((await reader.object(object.id)).metadata).toEqual(metadata);
          expect(
            new Uint8Array(
              await new Response(await reader.download(object)).arrayBuffer(),
            ),
          ).toEqual(Uint8Array.of(1));
        }
      } finally {
        await reader.close();
      }
    });
  } finally {
    await mock.close();
  }
});
it("managed uploads reject invalid explicit and fallback labels before opening", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const source = await bytesFixture({
        bytes: Uint8Array.of(1),
        name: "fixture",
      });
      let opens = 0;
      const file = {
        ...source,
        open() {
          opens++;
          return source.open();
        },
      };
      for (const name of ["", null, 1, false]) {
        await expect(
          run.objects.upload({
            file,
            metadata: new Uint8Array(),
            name: name as string,
          }),
        ).rejects.toMatchObject({ code: "invalid-input" });
        await expect(
          run.objects.upload({
            file: { ...file, name: name as string },
            metadata: new Uint8Array(),
          }),
        ).rejects.toMatchObject({ code: "invalid-input" });
      }
      expect(opens).toBe(0);
    });
  } finally {
    await mock.close();
  }
});
