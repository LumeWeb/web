/** Direct references keep run authority while recreated readers query current state. */
import { expect, it } from "vitest";
import { bytesFixture, createMockSia } from "../../src/mock.js";
import { app } from "./application-scenarios.js";
import { recreatedSessionScenarios } from "./recreated-session-scenarios.js";

recreatedSessionScenarios(
  (mock, run) =>
    Promise.resolve({
      application: (as) => mock.application({ access: run.ownerAccess, as }),
      close: () => Promise.resolve(),
      reader: (as) => mock.reader({ access: run.ownerAccess, as }),
    }),
  false,
);

it("authorized reads see later metadata, deletion and recipient revocation", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const original = mock.application({
        access: run.ownerAccess,
        as: mock.actor("original"),
      });
      const editor = mock.application({
        access: run.ownerAccess,
        as: mock.actor("editor"),
      });
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("reader"),
      });
      const fixture = await run.objects.upload({
        file: await bytesFixture({ bytes: Uint8Array.of(5), name: "shared" }),
        metadata: Uint8Array.of(6),
      });
      const share = await run.shares.create({ objects: [fixture] });
      const recipient = mock.reader({
        access: share.access,
        as: mock.actor("recipient"),
      });
      try {
        const object = await original.upload({
          file: await bytesFixture({
            bytes: Uint8Array.of(1),
            name: "current",
          }),
          metadata: Uint8Array.of(2),
        });
        await original.pin(object);
        await original.close();
        expect((await reader.object(object.id)).metadata).toEqual(
          Uint8Array.of(2),
        );
        await editor.pin(object, { metadata: Uint8Array.of(3) });
        expect((await reader.object(object.id)).metadata).toEqual(
          Uint8Array.of(3),
        );
        await editor.delete(object);
        await expect(reader.object(object.id)).rejects.toMatchObject({
          code: "not-found",
        });
        await expect(reader.download({ id: object.id })).rejects.toMatchObject({
          code: "not-found",
        });
        expect(
          (await reader.objects({ limit: 10, offset: 0 })).objects.map(
            (row) => row.id,
          ),
        ).not.toContain(object.id);
        expect((await recipient.object(fixture.id)).metadata).toEqual(
          Uint8Array.of(6),
        );
        await run.shares.revoke(share);
        await expect(recipient.object(fixture.id)).rejects.toMatchObject({
          code: "denied",
        });
        await expect(
          recipient.download({ id: fixture.id }),
        ).rejects.toMatchObject({ code: "denied" });
        expect((await reader.object(fixture.id)).metadata).toEqual(
          Uint8Array.of(6),
        );
      } finally {
        await recipient.close();
        await reader.close();
        await editor.close();
        await original.close();
      }
    });
  } finally {
    await mock.close();
  }
});

it("foreign runs and copied access cannot read or mutate a known destination", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (first) => {
      const writer = mock.application({
        access: first.ownerAccess,
        as: mock.actor("first"),
      });
      try {
        const object = await writer.upload({
          file: await bytesFixture({ bytes: Uint8Array.of(1), name: "known" }),
          metadata: new Uint8Array(),
        });
        await writer.pin(object);
        await writer.close();
        await mock.run({ app }, async (second) => {
          const foreign = mock.application({
            access: second.ownerAccess,
            as: mock.actor("second"),
          });
          const reader = mock.reader({
            access: second.ownerAccess,
            as: mock.actor("foreign reader"),
          });
          const copied = mock.reader({
            access: { ...first.ownerAccess },
            as: mock.actor("copied access"),
          });
          try {
            await expect(reader.object(object.id)).rejects.toMatchObject({
              code: "not-found",
            });
            await expect(copied.object(object.id)).rejects.toMatchObject({
              code: "denied",
            });
            for (const call of [
              () => foreign.pin(object),
              () => foreign.delete(object),
              () => foreign.inspect(object),
            ])
              await expect(call()).rejects.toMatchObject({
                code: "foreign-handle",
              });
          } finally {
            await copied.close();
            await reader.close();
            await foreign.close();
          }
        });
      } finally {
        await writer.close();
      }
    });
  } finally {
    await mock.close();
  }
});
