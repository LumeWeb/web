import { describe, expect, it } from "vitest";
import { createPinObjectRequest, createSealedObject, createSharingKey } from "../../src/fixtures/index.js";

describe("fixtures", () => {
  it("returns independent nested object data for each factory call", () => {
    const first = createSealedObject();
    const second = createSealedObject();

    first.slabs[0]!.sectors[0]!.hostKey = "changed-host";

    expect(second.slabs[0]!.sectors[0]!.hostKey).toBe("ed25519:fixture-host");
  });

  it("keeps a nested override without mutating the next default", () => {
    const overridden = createPinObjectRequest({ slabs: [{ id: "f".repeat(64), length: 5, offset: 3 }] });
    const next = createPinObjectRequest();

    expect(overridden.slabs[0]).toEqual({ id: "f".repeat(64), length: 5, offset: 3 });
    expect(next.slabs[0]).toEqual({ id: "a".repeat(64), length: 1, offset: 0 });
  });

  it("makes deterministic wire-valid sharing-key fixtures", () => {
    const key = createSharingKey();

    expect(key).toMatchObject({ objectCount: 0, publicKey: "ed25519:fixture-sharing-key" });
    expect(key.expiresAt).toBeUndefined();
  });
});
