import { describe, expect, it } from "vitest";
import { createIndexdModel } from "../../src/model/index.js";

describe("sharing model lifecycle", () => {
  it("accounts unique slab references once and rejects quota without corrupting state", () => {
    const model = createIndexdModel({ quotaBytes: 4 });
    const account = model.createAccount({ publicKey: "owner" });
    model.pinSlab(account.id, { id: "slab", size: 4 });
    model.pinObject(account.id, { id: "one", slabs: ["slab"] });
    model.pinObject(account.id, { id: "two", slabs: ["slab"] });
    model.pinSlab(account.id, { id: "extra", size: 1 });
    expect(model.accountStats(account.id)).toEqual({ objectCount: 2, pinnedSize: 4 });
    expect(() => model.pinObject(account.id, { id: "three", slabs: ["slab", "extra"] })).toThrow("account quota exceeded");
    expect(model.accountStats(account.id).objectCount).toBe(2);
  });

  it("preserves the SDK-generated recipient seal in shared responses", () => {
    const model = createIndexdModel();
    const owner = model.createAccount({ publicKey: "owner" });
    const recipient = model.createAccount({ publicKey: "recipient" });
    model.pinSlab(owner.id, { id: "slab", size: 1 });
    model.pinObject(owner.id, { dataSignature: "owner-signature", encryptedDataKey: "owner-key", encryptedMetadata: "b3duZXItbWV0YWRhdGE=", encryptedMetadataKey: "owner-metadata-key", id: "object", metadataSignature: "owner-metadata-signature", slabs: ["slab"] });
    model.createSharingKey(owner.id, { nonce: "nonce", publicKey: recipient.publicKey });
    model.attachSharedObject(owner.id, recipient.publicKey, { dataSignature: "wrong-signature", encryptedDataKey: "wrong-key", objectID: "object" });

    expect(model.sharedObject(recipient.id, recipient.publicKey, "object")).toMatchObject({ dataSignature: "wrong-signature", encryptedDataKey: "wrong-key" });
  });

  it("isolates owner and recipient and rejects expired or revoked keys", () => {
    let current = new Date("2026-01-01T00:00:00.000Z");
    const model = createIndexdModel({ now: () => current });
    const owner = model.createAccount({ publicKey: "owner" });
    const recipient = model.createAccount({ publicKey: "recipient" });
    model.pinSlab(owner.id, { id: "s", size: 1 });
    model.pinObject(owner.id, { id: "o", slabs: ["s"] });
    model.createSharingKey(owner.id, { expiresAt: "2026-01-01T00:01:00.000Z", nonce: "n", publicKey: recipient.publicKey });
    model.attachSharedObject(owner.id, recipient.publicKey, { dataSignature: "opaque", encryptedDataKey: "opaque", objectID: "o" });
    expect(model.sharedObject(recipient.id, recipient.publicKey, "o").objectID).toBe("o");
    expect(() => model.sharedObject(owner.id, recipient.publicKey, "o")).toThrow("sharing key unavailable");
    current = new Date("2026-01-01T00:02:00.000Z");
    expect(() => model.listSharedObjects(owner.id, recipient.publicKey)).toThrow("sharing key unavailable");
  });

  it("rejects an unknown sharing key even while another key is active", () => {
    const model = createIndexdModel();
    const owner = model.createAccount({ publicKey: "owner" });
    model.createSharingKey(owner.id, { nonce: "n", publicKey: "recipient" });
    expect(() => model.sharedStats("unknown", "unknown")).toThrow("sharing key unavailable");
    expect(() => model.listRecipientObjects("unknown", "unknown")).toThrow("sharing key unavailable");
    expect(() => model.sharedObject("unknown", "unknown", "object")).toThrow("sharing key unavailable");
  });

  it("validates signed query fields and never accepts URL fragments", () => {
    const model = createIndexdModel({ now: () => new Date("2026-01-01T00:00:00.000Z") });
    const valid = "https://example.test/objects/object/shared?sc=recipient&ss=signature&sv=1767225660";
    expect(model.validateSignedShareUrl(valid).objectID).toBe("object");
    expect(() => model.validateSignedShareUrl(`${valid}#decryption-key`)).toThrow("fragments");
    expect(() => model.validateSignedShareUrl(valid.replace("ss=signature", "ss="))).toThrow("signed share URL");
  });
});
