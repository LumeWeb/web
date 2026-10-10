import { describe, expect, it } from "vitest";
import { fromHex } from "../../lib/hex";
import { publishSuppliers } from "./PublishSuppliers";

const APP_KEY_HEX = "ab".repeat(32);

describe("publishSuppliers", () => {
  it("yields the app-key supplier when an app-key session is present", () => {
    const suppliers = publishSuppliers({ appKeyHex: APP_KEY_HEX });
    expect(suppliers.appKey).not.toBeNull();
    // Publish mode never arms a sharing-key supplier.
    expect(suppliers.sharingKey).toBeNull();
  });

  it("yields the app-key seed bytes on demand, not a stored seed", () => {
    const suppliers = publishSuppliers({ appKeyHex: APP_KEY_HEX });
    expect(suppliers.appKey?.getAppKeySeed()).toEqual(fromHex(APP_KEY_HEX));
  });

  it("arms nothing without an app-key session", () => {
    const suppliers = publishSuppliers({ appKeyHex: null });
    expect(suppliers.appKey).toBeNull();
    expect(suppliers.sharingKey).toBeNull();
  });

  it("never leaks the plaintext seed as a property or in serialized state", () => {
    const suppliers = publishSuppliers({ appKeyHex: APP_KEY_HEX });
    expect(suppliers.appKey).not.toHaveProperty("seed");
    expect(JSON.stringify(suppliers)).not.toContain(APP_KEY_HEX);
  });

  it("exposes no armed flag (supplier presence is the whole routing fact)", () => {
    const suppliers = publishSuppliers({ appKeyHex: APP_KEY_HEX });
    expect("armed" in suppliers).toBe(false);
  });
});
