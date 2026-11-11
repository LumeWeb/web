import { describe, expect, it } from "vitest";
import { fromHex } from "../../lib/hex";
import { publishSuppliers } from "./PublishSuppliers";

const APP_KEY_HEX = "ab".repeat(32);
const readKey = () => fromHex(APP_KEY_HEX);

describe("publishSuppliers", () => {
  it("yields the app-key supplier when an account session is present", () => {
    const suppliers = publishSuppliers({ getAppKeySeed: readKey });
    expect(suppliers.appKey).not.toBeNull();
    expect(suppliers.sharingKey).toBeNull();
  });

  it("yields app-key bytes on demand, not a stored seed", () => {
    const suppliers = publishSuppliers({ getAppKeySeed: readKey });
    expect(suppliers.appKey?.getAppKeySeed()).toEqual(fromHex(APP_KEY_HEX));
  });

  it("reads the active key only when the video host asks for it", () => {
    let active = 1;
    const suppliers = publishSuppliers({
      getAppKeySeed: () => new Uint8Array(32).fill(active),
    });
    active = 2;
    const first = suppliers.appKey?.getAppKeySeed();
    expect(first?.[0]).toBe(2);
    first?.fill(0);
    expect(suppliers.appKey?.getAppKeySeed()[0]).toBe(2);
  });

  it("arms nothing without an account session", () => {
    const suppliers = publishSuppliers({ getAppKeySeed: null });
    expect(suppliers.appKey).toBeNull();
    expect(suppliers.sharingKey).toBeNull();
  });

  it("never carries the plaintext seed in serialized state", () => {
    const suppliers = publishSuppliers({ getAppKeySeed: readKey });
    expect(suppliers.appKey).not.toHaveProperty("seed");
    expect(JSON.stringify(suppliers)).not.toContain(APP_KEY_HEX);
  });

  it("exposes no armed flag; supplier presence identifies the route", () => {
    const suppliers = publishSuppliers({ getAppKeySeed: readKey });
    expect("armed" in suppliers).toBe(false);
  });
});
