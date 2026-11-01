/** Genuine native SDK checks require a supplied disposable service. */
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { account, binding, config, upload, withAccounts } from "./session.js";
import { byteSource, readBytes } from "../support/byte-streams.js";

describe("real native payload", () => {
  it("loads the public Node binding", () => {
    expect(typeof binding.Sdk.prototype.uploadPath).toBe("function");
    const report = process.report.getReport();
    expect(
      "sharedObjects" in report &&
        Array.isArray(report.sharedObjects) &&
        report.sharedObjects.some(
          (path: unknown) =>
            typeof path === "string" && /sia-storage[^/\\]*\.node$/.test(path),
        ),
    ).toBe(true);
  });

  it("reconnects and downloads the uploaded bytes", async () => {
    await withAccounts(1, async (sessions) => {
      const a = account(sessions, 0);
      const object = await upload(a);
      const connected = await new binding.Builder(
        config.indexdURL.toString(),
        a.meta,
      ).connected(a.sdk.appKey());
      if (!connected) throw new Error("Native app key did not reconnect");
      const retrieved = await connected.object(object.id());
      expect(await readBytes(connected, retrieved)).toEqual([3, 1, 4, 1, 5, 9]);
      expect(Buffer.from(retrieved.metadata()).toString()).toBe("owner");
    });
  }, 480_000);

  it("detaches a shared object without deleting the owner object", async () => {
    await withAccounts(1, async (sessions) => {
      const a = account(sessions, 0);
      const object = await upload(a);
      const attached = await a.sdk.createSharingKey("attached native object");
      await a.sdk.shareObject(attached, object);
      const record = await a.sdk.sharingKey(attached);
      expect(record.description).toBe("attached native object");
      expect(record.stats.objectCount).toBe(1n);
      const recipient = await binding.SharedSdk.connect(
        config.indexdURL.toString(),
        attached.seed(),
      );
      expect((await recipient.objects(0, 1)).map((item) => item.id())).toEqual([
        object.id(),
      ]);
      expect(await recipient.objects(1, 1)).toEqual([]);
      await a.sdk.unshareObject(attached, object.id());
      expect((await a.sdk.sharingKey(attached)).stats.objectCount).toBe(0n);
      expect(record.stats.objectCount).toBe(1n);
      expect(await recipient.objects(0, 1)).toEqual([]);
      expect((await recipient.stats()).objectCount).toBe(0n);
      await expect(recipient.object(object.id())).rejects.toThrow(
        /404 Not Found/,
      );
      expect(await readBytes(a.sdk, await a.sdk.object(object.id()))).toEqual([
        3, 1, 4, 1, 5, 9,
      ]);
    });
  }, 480_000);

  it("persists metadata updates without changing payload bytes", async () => {
    await withAccounts(1, async (sessions) => {
      const a = account(sessions, 0);
      const object = await upload(a);
      const id = object.id();
      object.updateMetadata(Buffer.from("updated native metadata"));
      await a.sdk.updateObjectMetadata(object);
      const retrieved = await a.sdk.object(id);
      expect(Buffer.from(retrieved.metadata()).toString()).toBe(
        "updated native metadata",
      );
      expect(await readBytes(a.sdk, retrieved)).toEqual([3, 1, 4, 1, 5, 9]);
    });
  }, 480_000);

  it("downloads only the requested byte range", async () => {
    await withAccounts(1, async (sessions) => {
      const a = account(sessions, 0);
      const object = await upload(a);
      const retrieved = await a.sdk.object(object.id());
      expect(
        await readBytes(a.sdk, retrieved, { length: 3n, offset: 2n }),
      ).toEqual([4, 1, 5]);
      expect(
        await readBytes(a.sdk, retrieved, { length: 1n, offset: 5n }),
      ).toEqual([9]);
      expect(await readBytes(a.sdk, retrieved)).toEqual([3, 1, 4, 1, 5, 9]);
    });
  }, 480_000);

  for (const mutation of [
    { name: "append", want: [3, 1, 4, 1, 5, 9, 2, 6] },
    { name: "overwrite", want: [3, 1, 90, 91, 5, 9] },
    { name: "truncate", want: [3, 1, 4] },
  ]) {
    it(`${mutation.name} preserves bytes outside the changed region`, async () => {
      await withAccounts(1, async (sessions) => {
        const a = account(sessions, 0);
        const original = await upload(a);
        const retrieved = await a.sdk.object(original.id());
        const changed =
          mutation.name === "truncate"
            ? retrieved.truncate(3n)
            : await a.sdk.upload(
                retrieved,
                byteSource(mutation.name === "append" ? [2, 6] : [90, 91]),
                mutation.name === "overwrite" ? { startOffset: 2n } : undefined,
              );
        await a.sdk.pinObject(changed);
        expect(changed.id()).not.toBe(original.id());
        const connected = await new binding.Builder(
          config.indexdURL.toString(),
          a.meta,
        ).connected(a.sdk.appKey());
        if (!connected)
          throw new Error("Native mutation account did not reconnect");
        expect(
          await readBytes(connected, await connected.object(changed.id())),
        ).toEqual(mutation.want);
        expect(
          await readBytes(connected, await connected.object(original.id())),
        ).toEqual([3, 1, 4, 1, 5, 9]);
      });
    }, 480_000);
  }

  it("rejects an ordinary upload when its source fails", async () => {
    await withAccounts(1, async (sessions) => {
      const a = account(sessions, 0);
      const source = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.error(new Error("intentional native source failure"));
        },
      });
      await expect(
        a.sdk.upload(new binding.PinnedObject(), source),
      ).rejects.toThrow(/intentional native source failure/);
      // A spurious pin in the current second would still be hidden by the event feed.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(await a.sdk.objectEvents(undefined, 10)).toEqual([]);
    });
  }, 480_000);

  it("uploads file-path bytes through the native SDK", async () => {
    const directory = await mkdtemp(join(tmpdir(), "sia-native-path-"));
    try {
      const path = join(directory, "ordinary.bin");
      await writeFile(path, new Uint8Array([2, 7, 1, 8, 2, 8]));
      await withAccounts(1, async (sessions) => {
        const a = account(sessions, 0);
        const uploaded = await a.sdk.uploadPath(
          new binding.PinnedObject(),
          path,
        );
        await a.sdk.pinObject(uploaded);
        expect(
          await readBytes(a.sdk, await a.sdk.object(uploaded.id())),
        ).toEqual([2, 7, 1, 8, 2, 8]);
      });
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  }, 480_000);

  it("packs file-path inputs without changing their bytes", async () => {
    const directory = await mkdtemp(join(tmpdir(), "sia-native-packed-"));
    try {
      const first = join(directory, "first.bin"),
        second = join(directory, "second.bin");
      await writeFile(first, new Uint8Array([10, 11]));
      await writeFile(second, new Uint8Array([12, 13, 14]));
      await withAccounts(1, async (sessions) => {
        const a = account(sessions, 0);
        const packed = a.sdk.uploadPacked();
        await packed.addPath(first);
        await packed.addPath(second);
        const bytes: number[][] = [];
        for (const object of await packed.finalize()) {
          await a.sdk.pinObject(object);
          bytes.push(await readBytes(a.sdk, await a.sdk.object(object.id())));
        }
        expect(bytes).toEqual([
          [10, 11],
          [12, 13, 14],
        ]);
      });
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  }, 480_000);

  // SDK 0.1.4 reads share URLs over HTTPS even when Builder used HTTP.
  it.skipIf(config.indexdURL.protocol !== "https:")(
    "downloads bytes from a data-only share URL handle",
    async () => {
      await withAccounts(1, async (sessions) => {
        const a = account(sessions, 0);
        const object = await upload(a);
        const url = a.sdk.objectShareUrl(object, new Date(Date.now() + 60_000));
        const shared = await a.sdk.objectFromShareUrl(url);
        expect(await readBytes(a.sdk, shared)).toEqual([3, 1, 4, 1, 5, 9]);
        expect(shared.metadata().byteLength).toBe(0);
      });
    },
    480_000,
  );

  it.skipIf(config.indexdURL.protocol !== "https:")(
    "rejects expired signed share URLs",
    async () => {
      await withAccounts(1, async (sessions) => {
        const a = account(sessions, 0);
        const object = await upload(a);
        const url = a.sdk.objectShareUrl(object, new Date(Date.now() - 60_000));
        await expect(a.sdk.objectFromShareUrl(url)).rejects.toThrow(/expired/i);
      });
    },
    480_000,
  );
});
