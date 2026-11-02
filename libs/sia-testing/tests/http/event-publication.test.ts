/** Controlled publication must hide pending mutations from cursor-based object listings. */
import { expect, test } from "vitest";
import { createIndexdDispatcher } from "../../src/dispatcher.js";
import {
  createIndexdModel,
  type ModelObjectEvent,
} from "../../src/model/index.js";
import { owner, signedUrl } from "../fixtures/auth.js";

test("cursor paging reaches a republished lower key after tied rows", async () => {
  let now = new Date("2026-01-01T00:00:00.400Z");
  const model = createIndexdModel({
    eventPublication: "manual",
    now: () => now,
  });
  model.createAccount({ publicKey: owner });
  const dispatch = createIndexdDispatcher(model);
  for (const id of ["c", "a", "b"]) model.pinObject(owner, { id, slabs: [] });
  const page = async (
    cursor?: ModelObjectEvent,
  ): Promise<ModelObjectEvent[]> => {
    const url = signedUrl("/objects?limit=1", owner);
    if (cursor) {
      url.searchParams.set("after", cursor.updatedAt);
      url.searchParams.set("key", cursor.key);
    }
    return (await dispatch(new Request(url))).json() as Promise<
      ModelObjectEvent[]
    >;
  };
  expect(await page()).toEqual([]);
  model.publishObjectEvents();
  const [first] = await page();
  expect(first?.key).toBe("a");
  model.pinObject(owner, { encryptedMetadata: "bmV3", id: "a", slabs: [] });
  model.publishObjectEvents();
  const [second] = await page(first);
  expect(second?.key).toBe("b");
  const [third] = await page(second);
  expect(third?.key).toBe("c");
  expect(await page(third)).toEqual([]);
  now = new Date("2026-01-01T00:00:01.100Z");
  model.publishObjectEvents();
  const [later] = await page(third);
  expect(later).toMatchObject({
    key: "a",
    object: { encryptedMetadata: "bmV3" },
    updatedAt: "2026-01-01T00:00:01.000Z",
  });
  expect(await page(later)).toEqual([]);
});

test("manual publication hides mutations until a whole-second batch is published", async () => {
  const model = createIndexdModel({
    eventPublication: "manual",
    now: () => new Date("2026-01-01T00:00:00.450Z"),
  });
  model.createAccount({ publicKey: owner });
  const dispatch = createIndexdDispatcher(model);
  model.pinObject(owner, { id: "a", slabs: [] });
  const events = () =>
    dispatch(new Request(signedUrl("/objects", owner))).then((response) =>
      response.json(),
    );
  expect(await events()).toEqual([]);
  model.publishObjectEvents();
  expect(await events()).toEqual([
    {
      deleted: false,
      key: "a",
      object: {
        createdAt: "2026-01-01T00:00:00.000Z",
        id: "a",
        slabs: [],
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ]);
});
