import { describe, expect, it } from "vitest";
import {
  canonicalizeSelectedObjectKey,
  selectSharedSource,
  sharedSourceIdentity,
} from "./sourceSelection";

const SEED = "d778398e336858ddc1a7de0c78ca22bbe9c821e2786d7b5a941c729e1e5ceb1f";
const OBJECT =
  "a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff01";

describe("canonicalizeSelectedObjectKey", () => {
  it("canonicalizes a valid object key through the hex helper", () => {
    expect(canonicalizeSelectedObjectKey(OBJECT.toUpperCase())).toBe(OBJECT);
    expect(canonicalizeSelectedObjectKey(`0x${OBJECT}`)).toBe(OBJECT);
    expect(canonicalizeSelectedObjectKey(`  ${OBJECT}  `)).toBe(OBJECT);
  });

  it("treats malformed or absent object keys as unselected (null)", () => {
    for (const bad of [
      null,
      undefined,
      "",
      "   ",
      "abc",
      OBJECT.slice(1),
      `${OBJECT}a`,
      "g".repeat(64),
    ]) {
      expect(canonicalizeSelectedObjectKey(bad)).toBe(null);
    }
  });
});

describe("sharedSourceIdentity", () => {
  it("derives a stable hex identity that never contains the sharing seed", async () => {
    const id = await sharedSourceIdentity(SEED, OBJECT);
    expect(id).toMatch(/^[0-9a-f]{64}$/);
    expect(id).not.toContain(SEED);
    expect(id).not.toContain(SEED.toUpperCase());
    expect(await sharedSourceIdentity(SEED, OBJECT)).toBe(id);
  });

  it("changes when the seed or the object key changes", async () => {
    const base = await sharedSourceIdentity(SEED, OBJECT);
    const otherSeed = await sharedSourceIdentity(
      SEED.replace(/^d/, "e"),
      OBJECT,
    );
    const otherKey = await sharedSourceIdentity(
      SEED,
      OBJECT.replace(/^a/, "b"),
    );
    expect(otherSeed).not.toBe(base);
    expect(otherKey).not.toBe(base);
  });

  it("canonicalizes a 0x-prefixed seed before hashing", async () => {
    const id = await sharedSourceIdentity(SEED, OBJECT);
    const prefixed = await sharedSourceIdentity(
      `0X${SEED.toUpperCase()}`,
      OBJECT,
    );
    expect(prefixed).toBe(id);
  });

  it("throws on a malformed object key", async () => {
    await expect(sharedSourceIdentity(SEED, "nope")).rejects.toThrow("64 hex");
  });
});

describe("selectSharedSource", () => {
  it("selects only when both the sharing seed and object key are valid", async () => {
    const result = await selectSharedSource(SEED.toUpperCase(), OBJECT);
    expect(result.selected).toBe(true);
    expect(result.objectKey).toBe(OBJECT);
    expect(result.sourceId).toBe(await sharedSourceIdentity(SEED, OBJECT));
  });

  it("treats a malformed object key as unselected", async () => {
    for (const bad of [null, undefined, "", "short", "g".repeat(64)]) {
      const result = await selectSharedSource(SEED, bad);
      expect(result).toEqual({
        objectKey: null,
        selected: false,
        sourceId: null,
      });
    }
  });

  it("leaves the selection unselected when the sharing seed is invalid", async () => {
    const result = await selectSharedSource("not-a-hex-seed", OBJECT);
    expect(result).toEqual({
      objectKey: null,
      selected: false,
      sourceId: null,
    });
  });
});
