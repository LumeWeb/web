/** The installed SDK must page tied publication rows without losing a republished lower key. */
import { expect, test } from "vitest";
import { withSdk } from "./control.js";

test("native SDK cursors reach coalesced rows published after a tied batch", async () => {
  let now = new Date("2026-01-01T00:00:00.450Z");
  await withSdk(
    async (sdk, queries, model, account) => {
      const keys = ["11".repeat(32), "22".repeat(32), "33".repeat(32)];
      const remove = (id: string) => {
        model.seedObject(account, { id });
        model.deleteObject(account, id);
      };
      for (const id of [keys[2]!, keys[0]!, keys[1]!, keys[0]!]) remove(id);
      expect(await sdk.objectEvents(null, 10)).toEqual([]);
      model.publishObjectEvents();
      expect(
        (await sdk.objectEvents(null, 10)).map((event) => event.id),
      ).toEqual(keys);
      const [first] = await sdk.objectEvents(null, 1);
      expect(first?.id).toBe(keys[0]);
      remove(keys[0]!);
      model.publishObjectEvents();
      const [second] = await sdk.objectEvents(
        { after: first!.updatedAt, id: first!.id },
        1,
      );
      expect(second?.id).toBe(keys[1]);
      const [third] = await sdk.objectEvents(
        { after: second!.updatedAt, id: second!.id },
        1,
      );
      expect(third?.id).toBe(keys[2]);
      const cursor = { after: third!.updatedAt, id: third!.id };
      expect(await sdk.objectEvents(cursor, 1)).toEqual([]);
      now = new Date("2026-01-01T00:00:01.100Z");
      model.publishObjectEvents();
      const [later] = await sdk.objectEvents(cursor, 1);
      expect(later?.id).toBe(keys[0]);
      expect(later?.updatedAt).toEqual(new Date("2026-01-01T00:00:01.000Z"));
      expect(queries).toContainEqual({
        after: "2026-01-01T00:00:00+00:00",
        key: keys[2],
        limit: "1",
      });
    },
    [],
    { eventPublication: "manual", now: () => now },
  );
});
