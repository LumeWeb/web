import { describe, expect, it } from "vitest";
import { createIndexdModel } from "../../src/model/index.js";

describe("Indexd model accounts", () => {
  it("keeps object namespaces isolated between accounts", () => {
    const model = createIndexdModel({ now: () => new Date("2026-01-01T00:00:00Z") });
    const a = model.createAccount({ publicKey: "account-a" });
    const b = model.createAccount({ publicKey: "account-b" });

    model.seedObject(a.id, { encryptedMetadata: "YQ==", id: "object" });

    expect(model.object(b.id, "object")).toBeUndefined();
    expect(model.object(a.id, "object")?.encryptedMetadata).toBe("YQ==");
  });

  it("resets its private state without changing another model", () => {
    const first = createIndexdModel();
    const second = createIndexdModel();
    const account = first.createAccount({ publicKey: "account-a" });
    second.createAccount({ publicKey: "account-b" });

    first.reset();

    expect(first.snapshot().accounts).toEqual([]);
    expect(second.snapshot().accounts.map(({ id }) => id)).toEqual(["account-b"]);
    expect(account.id).toBe("account-a");
  });
});
