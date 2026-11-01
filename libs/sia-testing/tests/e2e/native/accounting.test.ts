/** Genuine native SDK checks require a supplied disposable service. */
import { describe, expect, it } from "vitest";
import { account, config, upload, withAccounts } from "./session.js";
import { byteSource, readBytes } from "../support/byte-streams.js";

describe("real native accounting", () => {
  it("charges a re-pinned slab only once", async () => {
    await withAccounts(1, async (sessions) => {
      const a = account(sessions, 0);
      const before = await a.sdk.account();
      const object = await upload(a);
      const charged = await a.sdk.account();
      expect(charged.pinnedData - before.pinnedData).toBe(41_943_040n);
      expect(charged.pinnedSize - before.pinnedSize).toBe(125_829_120n);
      await a.sdk.pinObject(object);
      expect(await a.sdk.account()).toMatchObject({
        pinnedData: charged.pinnedData,
        pinnedSize: charged.pinnedSize,
      });
      expect(await readBytes(a.sdk, await a.sdk.object(object.id()))).toEqual([
        3, 1, 4, 1, 5, 9,
      ]);
    });
  }, 480_000);

  it("prunes a packed slab only after its last object is deleted", async () => {
    await withAccounts(1, async (sessions) => {
      const a = account(sessions, 0);
      const before = await a.sdk.account();
      const packed = a.sdk.uploadPacked({ dataShards: 10, parityShards: 20 });
      await packed.add(byteSource([10, 11, 12]));
      await packed.add(byteSource([20, 21]));
      const objects = await packed.finalize();
      const [first, second] = objects;
      if (!first || !second || objects.length !== 2)
        throw new Error("Packed upload did not return two objects");
      for (const object of objects) await a.sdk.pinObject(object);
      expect(await a.sdk.account()).toMatchObject({
        pinnedData: before.pinnedData + 41_943_040n,
        pinnedSize: before.pinnedSize + 125_829_120n,
      });
      await a.sdk.deleteObject(first.id());
      await a.sdk.pruneSlabs(new Date(Date.now() + 60_000));
      expect(await a.sdk.account()).toMatchObject({
        pinnedData: before.pinnedData + 41_943_040n,
        pinnedSize: before.pinnedSize + 125_829_120n,
      });
      expect(await readBytes(a.sdk, await a.sdk.object(second.id()))).toEqual([
        20, 21,
      ]);
      await a.sdk.deleteObject(second.id());
      await a.sdk.pruneSlabs(new Date(Date.now() + 60_000));
      expect(await a.sdk.account()).toMatchObject({
        pinnedData: before.pinnedData,
        pinnedSize: before.pinnedSize,
      });
    });
  }, 480_000);

  for (const scope of ["app", "connect-key"] as const) {
    it(`rolls back a failed ${scope} quota import before accepting the exact boundary`, async () => {
      await withAccounts(2, async (sessions) => {
        const a = account(sessions, 0),
          b = account(sessions, 1);
        const object = await upload(a);
        const setLimit = async (maxPinnedData: number) => {
          const path =
            scope === "app"
              ? `/api/account/${encodeURIComponent(b.sdk.appKey().publicKey())}`
              : `/api/quotas/${b.quotaKey}`;
          const body =
            scope === "app"
              ? { maxPinnedData }
              : {
                  description: "disposable native accounting quota",
                  fundTargetBytes: 67_108_864,
                  maxPinnedData,
                  totalUses: 1,
                };
          const response = await fetch(new URL(path, config.adminURL), {
            body: JSON.stringify(body),
            headers: {
              "authorization": `Basic ${Buffer.from(`:${config.password}`).toString("base64")}`,
              "content-type": "application/json",
            },
            method: scope === "app" ? "PATCH" : "PUT",
          });
          expect(response.ok).toBe(true);
        };
        await setLimit(41_943_039);
        await expect(b.sdk.pinObject(object)).rejects.toThrow(
          /storage limit exceeded/,
        );
        expect(await b.sdk.account()).toMatchObject({
          pinnedData: 0n,
          pinnedSize: 0n,
        });
        await expect(b.sdk.object(object.id())).rejects.toThrow(/Api\(404,/);
        await setLimit(41_943_040);
        await b.sdk.pinObject(object);
        await b.sdk.pinObject(object);
        expect(await b.sdk.account()).toMatchObject({
          pinnedData: 41_943_040n,
          pinnedSize: 125_829_120n,
        });
        expect(await a.sdk.account()).toMatchObject({
          pinnedData: 41_943_040n,
          pinnedSize: 125_829_120n,
        });
        expect(await readBytes(b.sdk, await b.sdk.object(object.id()))).toEqual(
          [3, 1, 4, 1, 5, 9],
        );
      });
    }, 900_000);
  }
});
