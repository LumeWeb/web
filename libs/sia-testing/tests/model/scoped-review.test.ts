/** Caller-owned Buffer views and changing getters must not change accepted fixture authority or bytes. */
import { createHash } from "node:crypto";
import { setImmediate } from "node:timers/promises";
import { expect, it } from "vitest";
import { bytesFixture, createMockSia } from "../../src/testing/mock.js";
import { digest } from "../../src/testing/files.js";
const app = {
  description: "Ownership regressions",
  id: "a".repeat(64),
  name: "Ownership",
  serviceUrl: "https://example.invalid",
};
it("Buffer fixtures hash only the accepted view and detach its bytes", async () => {
  const pool = Buffer.from([9, 1, 2, 9]);
  const view = pool.subarray(1, 3);
  const expected = createHash("sha256")
    .update(Uint8Array.of(1, 2))
    .digest("hex");
  expect(await digest(view)).toBe(expected);
  const file = await bytesFixture({ bytes: view, name: "video" });
  expect(file.sha256).toBe(expected);
  view.fill(7);
  expect([
    ...new Uint8Array(await new Response(file.open()).arrayBuffer()),
  ]).toEqual([1, 2]);
});
it("Buffer metadata is detached from inputs and returned values", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const file = await bytesFixture({
        bytes: Uint8Array.of(1),
        name: "video",
      });
      const metadata = Buffer.from([7]);
      const object = await run.objects.upload({
        file,
        metadata,
        name: file.name,
      });
      const reader = mock.reader({
        access: run.ownerAccess,
        as: mock.actor("owner"),
      });
      metadata.fill(8);
      const info = await reader.object(object.id);
      expect([...info.metadata]).toEqual([7]);
      info.metadata.fill(9);
      expect([...(await reader.object(object.id)).metadata]).toEqual([7]);
    });
  } finally {
    await mock.close();
  }
});
it("a changing object id cannot switch an authorized download to private bytes", async () => {
  const mock = createMockSia();
  try {
    await mock.run({ app }, async (run) => {
      const sharedFile = await bytesFixture({
        bytes: Uint8Array.of(1),
        name: "shared",
      });
      const privateFile = await bytesFixture({
        bytes: Uint8Array.of(2),
        name: "private",
      });
      const shared = await run.objects.upload({
        file: sharedFile,
        metadata: new Uint8Array(),
        name: sharedFile.name,
      });
      const privateObject = await run.objects.upload({
        file: privateFile,
        metadata: new Uint8Array(),
        name: privateFile.name,
      });
      const share = await run.shares.create({ objects: [shared] });
      const reader = mock.reader({
        access: share.access,
        as: mock.actor("recipient"),
      });
      const info = await reader.object(shared.id);
      let reads = 0;
      const changing = {
        ...info,
        get id() {
          return reads++ < 2 ? shared.id : privateObject.id;
        },
      };
      const bytes = new Uint8Array(
        await new Response(await reader.download(changing)).arrayBuffer(),
      );
      expect([...bytes]).toEqual([1]);
      expect(reads).toBe(1);
    });
  } finally {
    await mock.close();
  }
});
it("run cleanup waits for a source's asynchronous cancellation", async () => {
  const mock = createMockSia();
  let opened!: () => void;
  let cancelling!: () => void;
  let release!: () => void;
  const ready = new Promise<void>((resolve) => {
    opened = resolve;
  });
  const cancellation = new Promise<void>((resolve) => {
    cancelling = resolve;
  });
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  try {
    await expect(
      mock.run({ app }, async (run) => {
        const upload = run.objects.upload({
          file: {
            name: "pending",
            open: () =>
              new ReadableStream<Uint8Array>({
                cancel() {
                  cancelling();
                  return pending;
                },
                start() {
                  opened();
                },
              }),
            sha256: "a".repeat(64),
            sizeBytes: 1,
          },
          metadata: new Uint8Array(),
          name: "pending",
        });
        const rejected = expect(upload).rejects.toMatchObject({
          name: "AbortError",
        });
        await ready;
        let closed = false;
        const close = mock.close().then(() => {
          closed = true;
        });
        try {
          await cancellation;
          await setImmediate();
          expect(closed).toBe(false);
        } finally {
          release();
        }
        await rejected;
        await close;
      }),
    ).rejects.toMatchObject({ name: "AbortError" });
  } finally {
    release();
    await mock.close();
  }
});
