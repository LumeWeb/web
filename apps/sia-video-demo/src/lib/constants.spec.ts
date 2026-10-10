import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import {
  APP_ID,
  APP_ID_SOURCE,
  DEFAULT_INDEXER_URL,
  resolveIndexerUrl,
} from "./constants";

/**
 * Node unit tests for the single advanced indexer setting shared by the share
 * and account entry flows: one resolver maps a stored (possibly empty)
 * indexer value onto the value both flows actually use.
 */
describe("APP_ID", () => {
  it("is the SHA-256 hash of the stable package identifier", () => {
    expect(APP_ID_SOURCE).toBe("@lumeweb/sia-video-demo");
    expect(APP_ID).toBe(
      createHash("sha256").update(APP_ID_SOURCE).digest("hex"),
    );
  });
});

describe("resolveIndexerUrl", () => {
  it("falls back to the default indexer when nothing is stored", () => {
    expect(resolveIndexerUrl("")).toBe(DEFAULT_INDEXER_URL);
    expect(resolveIndexerUrl("   ")).toBe(DEFAULT_INDEXER_URL);
  });

  it("keeps a stored indexer value (trimmed)", () => {
    expect(resolveIndexerUrl(" https://other.example ")).toBe(
      "https://other.example",
    );
  });
});
