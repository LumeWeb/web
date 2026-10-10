import { describe, expect, it } from "vitest";
import { fromHex } from "../../lib/hex";
import { sharedSuppliers } from "./SharedSuppliers";

const SHARING_KEY_HEX = "cd".repeat(32);

describe("sharedSuppliers", () => {
  it("yields the sharing-key supplier when a sharing-key session is present", () => {
    const suppliers = sharedSuppliers({ sharingKeyHex: SHARING_KEY_HEX });
    expect(suppliers.sharingKey).not.toBeNull();
    expect(suppliers.sharingKey?.getSharingKeySeed()).toEqual(
      fromHex(SHARING_KEY_HEX),
    );
    // Shared mode never arms an app-key supplier.
    expect(suppliers.appKey).toBeNull();
  });

  it("arms nothing without a sharing-key session", () => {
    const suppliers = sharedSuppliers({ sharingKeyHex: null });
    expect(suppliers.appKey).toBeNull();
    expect(suppliers.sharingKey).toBeNull();
  });

  it("is unarmed for a malformed sharing key seed", () => {
    const suppliers = sharedSuppliers({ sharingKeyHex: "not-hex" });
    expect(suppliers.sharingKey).toBeNull();
    expect(suppliers.appKey).toBeNull();
  });

  it("never leaks the plaintext seed as a property or in serialized state", () => {
    const suppliers = sharedSuppliers({ sharingKeyHex: SHARING_KEY_HEX });
    expect(suppliers.sharingKey).not.toHaveProperty("seed");
    expect(JSON.stringify(suppliers)).not.toContain(SHARING_KEY_HEX);
  });

  it("exposes no armed flag (supplier presence is the whole routing fact)", () => {
    const suppliers = sharedSuppliers({ sharingKeyHex: SHARING_KEY_HEX });
    expect("armed" in suppliers).toBe(false);
  });
});
