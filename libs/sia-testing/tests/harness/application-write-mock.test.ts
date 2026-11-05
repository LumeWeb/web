/** Public mock calls consume actual bytes; none of these cases executes the native SDK. */
import { expect, it } from "vitest";
import {
  type ApplicationObject,
  bytesFixture,
  createMockSia,
} from "../../src/mock.js";
import { singleWriteCase } from "./application-write-contract.js";
import { packedWriteFixture } from "./application-write-packed-fixture.js";
const app = {
  description: "Application write assertions",
  id: "a".repeat(64),
  name: "Writes",
  serviceUrl: "https://example.invalid",
};

it("the application port pins consumed literal bytes and metadata with original authority", async () => {
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
      const descriptor = await bytesFixture({
        bytes: Uint8Array.of(0x53, 0x69, 0x61, 0, 0xff),
        name: "literal",
      });
      let original: ApplicationObject | undefined;
      const failures = await singleWriteCase({
        expected: Uint8Array.of(0x53, 0x69, 0x61, 0, 0xff),
        fixture: {
          async close() {
            const errors: unknown[] = [];
            if (original) {
              try {
                await writer.delete(original);
                expect(await writer.inspect(original)).toBe("missing");
              } catch (error) {
                errors.push(error);
              }
            }
            for (const close of [() => reader.close(), () => writer.close()]) {
              try {
                await close();
              } catch (error) {
                errors.push(error);
              }
            }
            return errors;
          },
          async readAcknowledged() {
            const row = await reader.object(original!.id);
            // Readable data and copied IDs do not carry application mutation authority.
            for (const foreign of [row, { ...original }, original!.id]) {
              await expect(
                writer.delete(foreign as ApplicationObject),
              ).rejects.toMatchObject({ code: "foreign-handle" });
            }
            return [
              { metadata: row.metadata, stream: await reader.download(row) },
            ];
          },
          settleOwnedWork: () => Promise.resolve(),
          async write(source, metadata) {
            original = await writer.upload({
              file: { ...descriptor, open: () => source },
              metadata,
            });
            expect(await writer.inspect(original)).toBe("uploaded");
            await expect(reader.object(original.id)).rejects.toMatchObject({
              code: "not-found",
            });
            await writer.pin(original);
          },
        },
        metadata: Uint8Array.of(7, 8),
      });
      expect(failures).toEqual([]);
    });
  } finally {
    await mock.close();
  }
});
it("the packed mock preserves byte readback and rejects original refs in another SDK session", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const sdk = mock.packedSdk({
        access: run.ownerAccess,
        as: mock.actor("writer"),
        maxBytes: 5,
        maxObjects: 1,
        platform: "node",
      });
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("reader"),
      });
      const fixture = packedWriteFixture(sdk, reader);
      const failures = await singleWriteCase({
        expected: Uint8Array.of(0x53, 0x69, 0x61, 0, 0xff),
        fixture,
        metadata: Uint8Array.of(7, 8),
      });
      expect(failures).toEqual([]);
      expect(fixture.creationUncertain()).toBe(false);
      const original = fixture.acknowledged()[0]!;
      const next = mock.packedSdk({
        access: run.ownerAccess,
        as: mock.actor("next"),
        maxBytes: 5,
        maxObjects: 1,
        platform: "node",
      });
      try {
        for (const foreign of [original, { id: () => original.id() }]) {
          await expect(
            next.pinObject(foreign as typeof original),
          ).rejects.toMatchObject({ code: "foreign-handle" });
        }
      } finally {
        await next.close();
      }
    });
  } finally {
    await mock.close();
  }
});
