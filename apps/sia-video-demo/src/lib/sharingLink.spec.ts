import { describe, expect, it } from "vitest";
import {
  buildSharingFragment,
  extractSharingSeed,
  parseSharingFragment,
} from "./sharingLink";

const SEED = "d778398e336858ddc1a7de0c78ca22bbe9c821e2786d7b5a941c729e1e5ceb1f";
const OBJECT =
  "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90";

describe("parseSharingFragment", () => {
  it("parses a full #sharing_key + &object fragment and lowercases it", () => {
    const hash = `#sharing_key=${SEED.toUpperCase()}&object=${OBJECT.toUpperCase()}`;
    expect(parseSharingFragment(hash)).toEqual({
      objectKey: OBJECT,
      seed: SEED,
    });
  });

  it("parses a seed-only fragment", () => {
    expect(parseSharingFragment(`#sharing_key=${SEED}`)).toEqual({
      objectKey: null,
      seed: SEED,
    });
  });

  it("returns nulls for an empty or unrelated fragment", () => {
    expect(parseSharingFragment("")).toEqual({ objectKey: null, seed: null });
    expect(parseSharingFragment("#")).toEqual({ objectKey: null, seed: null });
    expect(parseSharingFragment("#foo=bar")).toEqual({
      objectKey: null,
      seed: null,
    });
  });

  it("ignores a malformed sharing_key instead of arming the player", () => {
    const hash = "#sharing_key=nothex&object=" + OBJECT;
    expect(parseSharingFragment(hash)).toEqual({
      objectKey: OBJECT,
      seed: null,
    });
  });

  it("ignores a malformed object key", () => {
    const hash = `#sharing_key=${SEED}&object=short`;
    expect(parseSharingFragment(hash)).toEqual({
      objectKey: null,
      seed: SEED,
    });
  });
});

describe("buildSharingFragment", () => {
  it("builds the canonical seed-only fragment", () => {
    expect(buildSharingFragment(SEED)).toBe(`#sharing_key=${SEED}`);
  });

  it("builds the canonical seed + object fragment", () => {
    expect(buildSharingFragment(SEED, OBJECT)).toBe(
      `#sharing_key=${SEED}&object=${OBJECT}`,
    );
  });

  it("omits a null/empty object param", () => {
    expect(buildSharingFragment(SEED, null)).toBe(`#sharing_key=${SEED}`);
    expect(buildSharingFragment(SEED, "")).toBe(`#sharing_key=${SEED}`);
  });
});

describe("parse → build canonicalization", () => {
  it("canonicalizes an uppercase fragment into lowercase seed/key form", () => {
    const raw = parseSharingFragment(
      `#sharing_key=${SEED.toUpperCase()}&object=${OBJECT.toUpperCase()}`,
    );
    const canonical = buildSharingFragment(
      raw.seed!,
      raw.objectKey ?? undefined,
    );
    expect(canonical).toBe(`#sharing_key=${SEED}&object=${OBJECT}`);
  });
});

describe("extractSharingSeed", () => {
  it("returns a raw 64-hex key verbatim", () => {
    expect(extractSharingSeed(SEED)).toBe(SEED);
  });

  it("extracts the seed from a full sharing URL fragment", () => {
    const link = `https://sia.storage/#sharing_key=${SEED}`;
    expect(extractSharingSeed(link)).toBe(SEED);
  });

  it("extracts the seed from a full link with surrounding text", () => {
    const link = `  https://example.test/watch?v=1#sharing_key=${SEED}&object=${OBJECT}  `;
    expect(extractSharingSeed(link)).toBe(SEED);
  });

  it("extracts the seed from a query-style sharing_key", () => {
    expect(
      extractSharingSeed(`https://example.test/?sharing_key=${SEED}`),
    ).toBe(SEED);
  });

  it("returns the trimmed text when no sharing_key param is present", () => {
    const text = "  pasted-key-that-is-not-a-url  ";
    expect(extractSharingSeed(text)).toBe("pasted-key-that-is-not-a-url");
  });
});
