/** Accepted requests must retain their inputs and finish receipts after failure or cancellation. */
import { expect, it, vi } from "vitest";
import { bytesFixture, createMockSia } from "../../src/testing/mock.js";
import type { MockRun, MockSia } from "../../src/testing/types.js";
const app = {
  description: "Review",
  id: "a".repeat(64),
  name: "Review",
  serviceUrl: "https://example.invalid",
};
async function fixture(use: (run: MockRun, mock: MockSia) => Promise<void>) {
  const mock = createMockSia();
  try {
    await mock.run({ app }, (run) => use(run, mock));
  } finally {
    vi.useRealTimers();
    await mock.close();
  }
}
async function upload(run: MockRun) {
  const file = await bytesFixture({
    bytes: Uint8Array.of(10, 20, 30),
    name: "video",
  });
  return run.objects.upload({
    file,
    metadata: new Uint8Array(),
    name: file.name,
  });
}
it("a held download reads the accepted range after the caller mutates its input", () =>
  fixture(async (run, mock) => {
    const object = await upload(run);
    const actor = mock.actor("reader");
    const reader = mock.reader({ access: run.ownerAccess, as: actor });
    const range = { length: 1, offset: 0 };
    const hold = mock.faults.hold({ actor, object, operation: "download" });
    const pending = reader.download(await reader.object(object.id), range);
    await hold.started();
    range.offset = 2;
    hold.release();
    expect([
      ...new Uint8Array(await new Response(await pending).arrayBuffer()),
    ]).toEqual([10]);
  }));
it("an invalid admitted listing finishes its receipt as failed", () =>
  fixture(async (run, mock) => {
    const reader = mock.reader({
      access: run.ownerAccess,
      as: mock.actor("reader"),
    });
    await expect(reader.objects({ limit: 0, offset: 0 })).rejects.toMatchObject(
      { code: "invalid-input" },
    );
    expect(mock.history().at(-1)?.status).toBe("failed");
  }));
it.each(["object", "download", "objects"] as const)(
  "revoking a share while %s is held finishes its receipt",
  (operation) =>
    fixture(async (run, mock) => {
      const object = await upload(run);
      const share = await run.shares.create({ objects: [object] });
      const actor = mock.actor("recipient");
      const reader = mock.reader({ access: share.access, as: actor });
      const descriptor = await reader.object(object.id);
      const hold = mock.faults.hold({
        actor,
        ...(operation === "objects" ? {} : { object }),
        operation,
      });
      const pending =
        operation === "object"
          ? reader.object(object.id)
          : operation === "objects"
            ? reader.objects({ limit: 1, offset: 0 })
            : reader.download(descriptor);
      const rejected = expect(pending).rejects.toMatchObject({
        code: "denied",
      });
      await hold.started();
      await run.shares.revoke(share);
      hold.release();
      await rejected;
      expect(mock.history().at(-1)?.status).toBe("failed");
    }),
);
it("cancelling a paced stream releases the actor's queue for its next download", () =>
  fixture(async (run, mock) => {
    const object = await upload(run);
    const actor = mock.actor("paced");
    const reader = mock.reader({ access: run.ownerAccess, as: actor });
    const descriptor = await reader.object(object.id);
    mock.faults.setLink(actor, { downloadBytesPerSecond: 3 });
    vi.useFakeTimers();
    const first = (await reader.download(descriptor)).getReader();
    const firstRead = first.read();
    await vi.advanceTimersByTimeAsync(1);
    await first.cancel();
    await firstRead;
    const second = (await reader.download(descriptor)).getReader();
    let finished = false;
    const read = second.read().then((value) => {
      finished = true;
      return value;
    });
    try {
      await vi.advanceTimersByTimeAsync(1000);
      expect(finished).toBe(true);
      expect((await read).value).toEqual(Uint8Array.of(10, 20, 30));
    } finally {
      await second.cancel();
    }
  }));
