/** Fault rules must stay on their selected actor/object and release cancelled pacing work. */
import { expect, it } from "vitest";
import { bytesFixture, createMockSia } from "../../src/testing/mock.js";
const app = {
  description: "Control test",
  id: "a".repeat(64),
  name: "Controls",
  serviceUrl: "https://example.invalid",
};
it("a finite fault affects only the selected object and actor", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const file = await bytesFixture({
        bytes: Uint8Array.of(1, 2),
        name: "video",
      });
      const first = await run.objects.upload({
        file,
        metadata: new Uint8Array(),
        name: "first",
      });
      const second = await run.objects.upload({
        file,
        metadata: new Uint8Array(),
        name: "second",
      });
      const actor = mock.actor("faulted");
      const reader = mock.reader({ access: run.ownerAccess, as: actor });
      const other = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("other"),
      });
      mock.faults.fail(
        { actor, object: first, operation: "object" },
        { code: "unavailable", times: 1 },
      );
      expect((await reader.object(second.id)).id).toBe(second.id);
      expect((await other.object(first.id)).id).toBe(first.id);
      await expect(reader.object(first.id)).rejects.toMatchObject({
        code: "unavailable",
      });
      expect((await reader.object(first.id)).id).toBe(first.id);
      expect(
        mock.history().filter((record) => record.status === "failed"),
      ).toHaveLength(1);
    });
  } finally {
    await mock.close();
  }
});
it("offline state applies to one actor and can recover", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const actor = mock.actor("offline");
      const reader = mock.reader({ access: run.ownerAccess, as: actor });
      mock.faults.setLink(actor, { online: false });
      await expect(
        reader.objects({ limit: 1, offset: 0 }),
      ).rejects.toMatchObject({ code: "unavailable" });
      mock.faults.setLink(actor, { online: true });
      expect((await reader.objects({ limit: 1, offset: 0 })).objects).toEqual(
        [],
      );
    });
  } finally {
    await mock.close();
  }
});
it("closing a paced reader aborts its pending read", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const file = await bytesFixture({
        bytes: Uint8Array.of(1, 2),
        name: "video",
      });
      const object = await run.objects.upload({
        file,
        metadata: new Uint8Array(),
        name: file.name,
      });
      const actor = mock.actor("paced");
      mock.faults.setLink(actor, { downloadBytesPerSecond: 1 });
      const reader = mock.reader({ access: run.ownerAccess, as: actor });
      const stream = (
        await reader.download(await reader.object(object.id))
      ).getReader();
      const read = stream.read();
      const rejected = expect(read).rejects.toMatchObject({
        name: "AbortError",
      });
      await reader.close();
      await rejected;
      stream.releaseLock();
      expect(
        mock.history().find((record) => record.operation === "download")
          ?.status,
      ).toBe("cancelled");
    });
  } finally {
    await mock.close();
  }
});
