import { describe, expect, it } from "vitest";
import { createIndexdModel } from "../../src/model/index.js";

describe("Indexd model events", () => {
  it("returns a tombstone after deleting an object", () => {
    const model = createIndexdModel({ now: () => new Date("2026-01-01T00:00:00Z") });
    const account = model.createAccount({ publicKey: "account" });
    model.pinSlab(account.id, { id: "slab", size: 1 });
    model.pinObject(account.id, { id: "object", slabs: ["slab"] });
    model.deleteObject(account.id, "object");

    const events = model.objectEvents(account.id);
    expect(events[events.length - 1]).toEqual({ deleted: true, key: "object", updatedAt: "2026-01-01T00:00:00.000Z" });
  });
});
