import { describe, expect, it } from "vitest";
import {
  fromHex,
  normalizeObjectKeyHex,
  normalizeSharingSeedHex,
  toHex,
} from "./hex";

const KEY = "d778398e336858ddc1a7de0c78ca22bbe9c821e2786d7b5a941c729e1e5ceb1f";

describe("normalizeSharingSeedHex", () => {
  it("lowercases a valid 64-hex sharing-key seed", () => {
    expect(normalizeSharingSeedHex(KEY.toUpperCase())).toBe(KEY);
  });

  it("strips an optional 0x prefix", () => {
    expect(normalizeSharingSeedHex(`0x${KEY}`)).toBe(KEY);
    expect(normalizeSharingSeedHex(`0X${KEY}`)).toBe(KEY);
  });

  it("accepts any non-empty even-length hex (the seed shape is a seed, not a 64-char key)", () => {
    expect(normalizeSharingSeedHex("a1b2")).toBe("a1b2");
  });

  it("rejects an empty value with a plain user-facing line", () => {
    expect(() => normalizeSharingSeedHex("")).toThrow("Enter a sharing key.");
    expect(() => normalizeSharingSeedHex("   ")).toThrow(
      "Enter a sharing key.",
    );
  });

  it("rejects non-hex characters with a plain user-facing line", () => {
    expect(() => normalizeSharingSeedHex("zzzz")).toThrow(
      "Enter a valid sharing key.",
    );
  });

  it("rejects odd-length hex with a plain user-facing line", () => {
    expect(() => normalizeSharingSeedHex("abc")).toThrow(
      "Enter a valid sharing key.",
    );
  });
});

describe("normalizeObjectKeyHex", () => {
  it("lowercases exactly 64 hex characters", () => {
    expect(normalizeObjectKeyHex(KEY.toUpperCase())).toBe(KEY);
  });

  it("strips an optional 0x prefix", () => {
    expect(normalizeObjectKeyHex(`0x${KEY}`)).toBe(KEY);
  });

  it("rejects anything other than exactly 64 hex characters", () => {
    for (const bad of ["", "abc", KEY.slice(1), `${KEY}a`, "g".repeat(64)]) {
      expect(() => normalizeObjectKeyHex(bad)).toThrow(
        "exactly 64 hex characters",
      );
    }
  });
});

describe("toHex / fromHex", () => {
  it("round-trips bytes through hex", () => {
    const bytes = new Uint8Array([0, 15, 16, 255, 170]);
    expect(fromHex(toHex(bytes))).toEqual(bytes);
  });

  it("hex-encodes with zero padding", () => {
    expect(toHex(new Uint8Array([0, 15, 16]))).toBe("000f10");
  });

  it("decodes hex back to bytes", () => {
    expect(fromHex("000f10")).toEqual(new Uint8Array([0, 15, 16]));
  });
});
