/** Genuine native SDK checks require a supplied disposable service. */
import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { PinnedObject, Sdk, SharedSdk } from "@siafoundation/sia-storage";
import { account, binding, config, upload, withAccounts } from "./session.js";
import { byteSource, readBytes } from "../support/byte-streams.js";
import { observeHostPayload } from "../support/host-observer.js";

describe("real native sharing", () => {
  it("reads a retained scoped handle immediately after key revocation", async () => {
    await withAccounts(1, async (sessions) => {
      const a = account(sessions, 0);
      const object = await upload(a);
      const key = await a.sdk.createSharingKey("native retained token");
      await a.sdk.shareObject(key, object);
      const recipient = await binding.SharedSdk.connect(
        config.indexdURL.toString(),
        key.seed(),
      );
      const retained = await recipient.object(object.id());
      expect(await readBytes(recipient, retained)).toEqual([3, 1, 4, 1, 5, 9]);
      await a.sdk.revokeSharingKey(key);
      await expect(recipient.stats()).rejects.toThrow(/401 Unauthorized/);
      await expect(recipient.object(object.id())).rejects.toThrow(
        /401 Unauthorized/,
      );
      const after = await observeHostPayload(
        process.env.SIA_TEST_CLUSTER_LOG,
        () => readBytes(recipient, retained),
      );
      expect(after.result).toEqual([3, 1, 4, 1, 5, 9]);
      expect(after.payloadRPCs.some((rpc) => rpc.includes("ReadSector"))).toBe(
        true,
      );
      expect(after.payloadRPCs.some((rpc) => rpc.includes("WriteSector"))).toBe(
        false,
      );
      expect(await readBytes(a.sdk, await a.sdk.object(object.id()))).toEqual([
        3, 1, 4, 1, 5, 9,
      ]);
    });
  }, 480_000);

  it("reads retained native scoped payloads after sharing-key expiry while fresh lookups fail", async () => {
    await withAccounts(1, async (sessions) => {
      const a = account(sessions, 0);
      const object = await upload(a);
      const pinned = await a.sdk.account();
      const readObserved = async (
        sdk: Sdk | SharedSdk,
        target: PinnedObject,
      ) => {
        const observed = await observeHostPayload(
          process.env.SIA_TEST_CLUSTER_LOG,
          () => readBytes(sdk, target),
        );
        expect(observed.result).toEqual([3, 1, 4, 1, 5, 9]);
        expect(
          observed.payloadRPCs.some((rpc) => rpc.includes("ReadSector")),
        ).toBe(true);
        expect(
          observed.payloadRPCs.some((rpc) => rpc.includes("WriteSector")),
        ).toBe(false);
      };
      const preserveOwner = async () => {
        const owner = await a.sdk.object(object.id());
        expect(owner.id()).toBe(object.id());
        expect(Buffer.from(owner.metadata()).toString()).toBe("owner");
        expect(owner.size()).toBe(6n);
        await readObserved(a.sdk, owner);
        expect(await a.sdk.account()).toMatchObject({
          pinnedData: pinned.pinnedData,
          pinnedSize: pinned.pinnedSize,
        });
      };
      await preserveOwner();
      const expiresAt = new Date(Date.now() + 10_000);
      const key = await a.sdk.createSharingKey(
        "native payload expiry",
        expiresAt,
      );
      try {
        await a.sdk.shareObject(key, object);
        const recipient = await binding.SharedSdk.connect(
          config.indexdURL.toString(),
          key.seed(),
        );
        const shared = await recipient.object(object.id());
        expect((await recipient.stats()).objectCount).toBe(1n);
        await readObserved(recipient, shared);
        expect(Date.now()).toBeLessThan(expiresAt.getTime());
        await preserveOwner();
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            Math.max(0, expiresAt.getTime() - Date.now() + 100),
          ),
        );
        expect(Date.now()).toBeGreaterThan(expiresAt.getTime());
        await expect(recipient.stats()).rejects.toThrow(/401 Unauthorized/);
        await expect(recipient.object(object.id())).rejects.toThrow(
          /401 Unauthorized/,
        );
        await expect(
          (async () => {
            const fresh = await binding.SharedSdk.connect(
              config.indexdURL.toString(),
              key.seed(),
            );
            return fresh.object(object.id());
          })(),
        ).rejects.toThrow(/401 Unauthorized/);
        // Each call opens a new download; retained metadata can outlive key authorization.
        const after = await observeHostPayload(
          process.env.SIA_TEST_CLUSTER_LOG,
          async () => {
            expect(Date.now()).toBeGreaterThan(expiresAt.getTime());
            return readBytes(recipient, shared);
          },
        );
        expect(after.result).toEqual([3, 1, 4, 1, 5, 9]);
        expect(
          after.payloadRPCs.some((rpc) => rpc.includes("ReadSector")),
        ).toBe(true);
        expect(
          after.payloadRPCs.some((rpc) => rpc.includes("WriteSector")),
        ).toBe(false);
        await preserveOwner();
      } finally {
        await a.sdk.revokeSharingKey(key);
      }
    });
  }, 480_000);

  it("pages object events without repeating or omitting objects", async () => {
    await withAccounts(1, async (sessions) => {
      const a = account(sessions, 0);
      const first = await upload(a);
      const input = new binding.PinnedObject();
      input.updateMetadata(Buffer.from("second"));
      const second = await a.sdk.upload(input, byteSource([8, 7]));
      await a.sdk.pinObject(second);
      // The server publishes only closed event seconds to keep cursors stable.
      await expect
        .poll(async () => (await a.sdk.objectEvents(undefined, 10)).length, {
          timeout: 5000,
        })
        .toBe(2);
      const firstPage = await a.sdk.objectEvents(undefined, 1);
      expect(firstPage).toHaveLength(1);
      const head = firstPage[0];
      if (!head) throw new Error("First object event was not returned");
      expect(
        (
          await a.sdk.objectEvents(
            { after: head.updatedAt, id: "0".repeat(64) },
            1,
          )
        ).map((event) => event.id),
      ).toEqual([head.id]);
      const secondPage = await a.sdk.objectEvents(
        { after: head.updatedAt, id: head.id },
        1,
      );
      expect(secondPage).toHaveLength(1);
      const tail = secondPage[0];
      if (!tail) throw new Error("Second object event was not returned");
      expect([head.id, tail.id].sort()).toEqual(
        [first.id(), second.id()].sort(),
      );
      expect(head.id).not.toBe(tail.id);
      for (const event of [head, tail]) {
        expect(event.deleted).toBe(false);
        const object = event.object;
        if (!object) throw new Error("Live object event omitted its object");
        expect(object.id()).toBe(event.id);
        expect(Buffer.from(object.metadata()).toString()).toBe(
          event.id === first.id() ? "owner" : "second",
        );
        expect(await readBytes(a.sdk, object)).toEqual(
          event.id === first.id() ? [3, 1, 4, 1, 5, 9] : [8, 7],
        );
      }
      expect(
        await a.sdk.objectEvents({ after: tail.updatedAt, id: tail.id }, 1),
      ).toEqual([]);
    });
  }, 480_000);

  it("returns a deletion event after the live-object cursor", async () => {
    await withAccounts(1, async (sessions) => {
      const a = account(sessions, 0);
      const object = await upload(a);
      await expect
        .poll(async () => (await a.sdk.objectEvents(undefined, 10)).length, {
          timeout: 5000,
        })
        .toBe(1);
      const events = await a.sdk.objectEvents(undefined, 10);
      expect(events).toHaveLength(1);
      const initial = events[0];
      if (!initial) throw new Error("Initial object event was not returned");
      await a.sdk.deleteObject(object.id());
      await expect
        .poll(
          async () =>
            (
              await a.sdk.objectEvents(
                { after: initial.updatedAt, id: initial.id },
                10,
              )
            ).length,
          { timeout: 5000 },
        )
        .toBe(1);
      const deleted = await a.sdk.objectEvents(
        { after: initial.updatedAt, id: initial.id },
        10,
      );
      expect(deleted).toHaveLength(1);
      const tombstone = deleted[0];
      if (!tombstone) throw new Error("Deletion event was not returned");
      expect(tombstone.id).toBe(object.id());
      expect(tombstone.deleted).toBe(true);
      expect(tombstone.object).toBeNull();
      expect(tombstone.updatedAt.getTime()).toBeGreaterThan(
        initial.updatedAt.getTime(),
      );
      expect(
        await a.sdk.objectEvents(
          { after: tombstone.updatedAt, id: tombstone.id },
          10,
        ),
      ).toEqual([]);
      await expect(a.sdk.object(object.id())).rejects.toThrow(/Api\(404,/);
    });
  }, 480_000);

  it("pages sharing keys from newest to oldest", async () => {
    await withAccounts(1, async (sessions) => {
      const a = account(sessions, 0);
      const older = await a.sdk.createSharingKey("older native key");
      const newer = await a.sdk.createSharingKey("newer native key");
      expect(
        (await a.sdk.sharingKeys(0, 1)).map((record) => record.key.publicKey),
      ).toEqual([newer.publicKey]);
      expect(
        (await a.sdk.sharingKeys(1, 1)).map((record) => record.key.publicKey),
      ).toEqual([older.publicKey]);
      expect(await a.sdk.sharingKeys(2, 1)).toEqual([]);
      const record = await a.sdk.sharingKey(newer);
      expect(record.key.publicKey).toBe(newer.publicKey);
      expect(record.description).toBe("newer native key");
      expect(record.stats.objectCount).toBe(0n);
    });
  }, 480_000);

  it("retrieves owner shared-object lists", async () => {
    await withAccounts(1, async (sessions) => {
      const a = account(sessions, 0);
      const object = await upload(a);
      const key = await a.sdk.createSharingKey("owner list compatibility");
      await a.sdk.shareObject(key, object);
      const objects = await a.sdk.sharedObjects(key, 0, 1);
      expect(objects.map((item) => item.id())).toEqual([object.id()]);
      const listed = objects[0];
      if (!listed) throw new Error("Owner shared-object list was empty");
      expect(Buffer.from(listed.metadata()).toString()).toBe("owner");
      expect(await readBytes(a.sdk, listed)).toEqual([3, 1, 4, 1, 5, 9]);
      expect(await a.sdk.sharedObjects(key, 1, 1)).toEqual([]);
      await a.sdk.unshareObject(key, object.id());
      expect(await a.sdk.sharedObjects(key, 0, 1)).toEqual([]);
      expect(await readBytes(a.sdk, await a.sdk.object(object.id()))).toEqual([
        3, 1, 4, 1, 5, 9,
      ]);
    });
  }, 480_000);

  it("isolates sharing keys between accounts using the same app", async () => {
    const meta = {
      description: "Same-app account isolation",
      id: randomBytes(32),
      name: "Disposable same-app accounts",
      serviceUrl: "https://example.invalid",
    };
    const run = () =>
      withAccounts(
        2,
        async (sessions) => {
          const a = account(sessions, 0);
          const b = account(sessions, 1);
          expect((await a.sdk.account()).app.id).toBe(meta.id.toString("hex"));
          expect((await b.sdk.account()).app.id).toBe(meta.id.toString("hex"));
          expect(a.sdk.appKey().publicKey()).not.toBe(
            b.sdk.appKey().publicKey(),
          );
          const first = await a.sdk.createSharingKey("first account");
          const second = await b.sdk.createSharingKey("second account");
          expect(
            (await a.sdk.sharingKeys(0, 10)).map(
              (record) => record.key.publicKey,
            ),
          ).toEqual([first.publicKey]);
          expect(
            (await b.sdk.sharingKeys(0, 10)).map(
              (record) => record.key.publicKey,
            ),
          ).toEqual([second.publicKey]);
          await expect(b.sdk.sharingKey(first)).rejects.toThrow(
            /404 Not Found/,
          );
          await expect(b.sdk.sharedObjects(first, 0, 1)).rejects.toThrow(
            /404 Not Found/,
          );
          await expect(b.sdk.revokeSharingKey(first)).rejects.toThrow(
            /404 Not Found/,
          );
          expect((await a.sdk.sharingKey(first)).description).toBe(
            "first account",
          );
          const recipient = await binding.SharedSdk.connect(
            config.indexdURL.toString(),
            first.seed(),
          );
          expect((await recipient.stats()).objectCount).toBe(0n);
          await a.sdk.revokeSharingKey(first);
          await expect(recipient.stats()).rejects.toThrow(/401/);
          expect((await b.sdk.sharingKey(second)).description).toBe(
            "second account",
          );
          for (const session of sessions) {
            expect((await session.sdk.account()).pinnedData).toBe(0n);
            expect((await session.sdk.account()).pinnedSize).toBe(0n);
          }
        },
        "metadata",
        meta,
      );
    const log = process.env.SIA_TEST_CLUSTER_LOG;
    if (log) {
      const observed = await observeHostPayload(log, run);
      expect(observed.payloadRPCs).toEqual([]);
    } else await run();
  }, 30_000);

  for (const sameApp of [false, true]) {
    it(
      sameApp
        ? "rejects another account on same-app owner sharing routes"
        : "rejects another account on owner sharing routes",
      async () => {
        await withAccounts(1, async (owners) => {
          const a = account(owners, 0);
          const object = await upload(a);
          const key = await a.sdk.createSharingKey("native owner isolation");
          await a.sdk.shareObject(key, object);
          await withAccounts(
            1,
            async (others) => {
              const foreign = account(others, 0);
              expect(foreign.sdk.appKey().publicKey()).not.toBe(
                a.sdk.appKey().publicKey(),
              );
              const ownerApp = (await a.sdk.account()).app.id;
              const foreignApp = (await foreign.sdk.account()).app.id;
              if (sameApp) expect(foreignApp).toBe(ownerApp);
              else expect(foreignApp).not.toBe(ownerApp);
              await expect(foreign.sdk.sharingKey(key)).rejects.toThrow(
                /404 Not Found/,
              );
              await expect(
                foreign.sdk.sharedObjects(key, 0, 1),
              ).rejects.toThrow(/404 Not Found/);
              // SDK maps a detach HTTP 404 to its ObjectNotAttached error.
              await expect(
                foreign.sdk.unshareObject(key, object.id()),
              ).rejects.toThrow("object is not attached to the sharing key");
              expect(await foreign.sdk.sharingKeys(0, 10)).toEqual([]);
              expect((await foreign.sdk.account()).pinnedData).toBe(0n);
              expect((await foreign.sdk.account()).pinnedSize).toBe(0n);
              expect(
                (await a.sdk.sharedObjects(key, 0, 1)).map((item) => item.id()),
              ).toEqual([object.id()]);
              expect((await a.sdk.sharingKey(key)).stats.objectCount).toBe(1n);
              const recipient = await binding.SharedSdk.connect(
                config.indexdURL.toString(),
                key.seed(),
              );
              const read = async () => [
                await readBytes(recipient, await recipient.object(object.id())),
                await readBytes(a.sdk, await a.sdk.object(object.id())),
              ];
              const log = process.env.SIA_TEST_CLUSTER_LOG;
              if (log) {
                const observed = await observeHostPayload(log, read);
                expect(observed.result).toEqual([
                  [3, 1, 4, 1, 5, 9],
                  [3, 1, 4, 1, 5, 9],
                ]);
                expect(
                  observed.payloadRPCs.some((rpc) =>
                    rpc.includes("ReadSector"),
                  ),
                ).toBe(true);
                expect(
                  observed.payloadRPCs.some((rpc) =>
                    rpc.includes("WriteSector"),
                  ),
                ).toBe(false);
              } else
                expect(await read()).toEqual([
                  [3, 1, 4, 1, 5, 9],
                  [3, 1, 4, 1, 5, 9],
                ]);
            },
            "metadata",
            sameApp ? a.meta : undefined,
          );
        });
      },
      480_000,
    );
  }

  it("retrieves recipient object summaries without host payload transfers", async () => {
    await withAccounts(1, async (sessions) => {
      const a = account(sessions, 0);
      const packed = a.sdk.uploadPacked({ dataShards: 10, parityShards: 20 });
      await packed.add(byteSource([3, 1, 4, 1, 5, 9]));
      await packed.add(byteSource([8, 7]));
      const objects = await packed.finalize();
      const [first, second] = objects;
      if (!first || !second || objects.length !== 2)
        throw new Error("Summary fixture did not finalize both objects");
      first.updateMetadata(Buffer.from([1, 0, 255]));
      second.updateMetadata(Buffer.from([2, 0, 255]));
      const key = await a.sdk.createSharingKey("native summary pages");
      for (const object of objects) {
        await a.sdk.pinObject(object);
        await a.sdk.shareObject(key, object);
      }
      const recipient = await binding.SharedSdk.connect(
        config.indexdURL.toString(),
        key.seed(),
      );
      const check = async () => {
        const head = await recipient.objectSummaries(0, 1);
        const tail = await recipient.objectSummaries(1, 1);
        expect(
          head.map((row) => ({
            id: row.id,
            metadata: [...row.metadata],
            size: row.size,
          })),
        ).toEqual([{ id: second.id(), metadata: [2, 0, 255], size: 2n }]);
        expect(
          tail.map((row) => ({
            id: row.id,
            metadata: [...row.metadata],
            size: row.size,
          })),
        ).toEqual([{ id: first.id(), metadata: [1, 0, 255], size: 6n }]);
        expect(await recipient.objectSummaries(2, 1)).toEqual([]);
        for (const row of [...head, ...tail]) {
          const full = await recipient.object(row.id);
          expect(row.createdAt).toEqual(full.createdAt());
          expect(row.updatedAt).toEqual(full.updatedAt());
          expect(Number.isFinite(row.createdAt.getTime())).toBe(true);
          expect(Object.prototype.hasOwnProperty.call(row, "slabs")).toBe(
            false,
          );
        }
      };
      const log = process.env.SIA_TEST_CLUSTER_LOG;
      if (log)
        expect((await observeHostPayload(log, check)).payloadRPCs).toEqual([]);
      else await check();
      const read = async () => [
        await readBytes(recipient, await recipient.object(first.id())),
        await readBytes(recipient, await recipient.object(second.id())),
      ];
      if (log) {
        const downloaded = await observeHostPayload(log, read);
        expect(downloaded.result).toEqual([
          [3, 1, 4, 1, 5, 9],
          [8, 7],
        ]);
        expect(
          downloaded.payloadRPCs.some((rpc) => rpc.includes("ReadSector")),
        ).toBe(true);
        expect(
          downloaded.payloadRPCs.some((rpc) => rpc.includes("WriteSector")),
        ).toBe(false);
      } else
        expect(await read()).toEqual([
          [3, 1, 4, 1, 5, 9],
          [8, 7],
        ]);
      await a.sdk.revokeSharingKey(key);
      await expect(recipient.objectSummaries(0, 1)).rejects.toThrow(/401/);
    });
  }, 480_000);
});
