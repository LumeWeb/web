import { describe, expect, it } from "vitest";
import { publishEntryState } from "./PublishEntryState";

const OBJECT_KEY =
  "a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff01";

/** Encodes to the padded base64url form real Sia share-URL generators emit. */
function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_");
}

function encryptionFragment(bytes = new Uint8Array(32).fill(7)): string {
  return `#encryption_key=${base64UrlEncode(bytes)}`;
}

function shareUrl(objectKey = OBJECT_KEY): string {
  return `https://indexer.example/objects/${objectKey}/shared?req=abc${encryptionFragment()}`;
}

describe("publishEntryState", () => {
  it("stays idle (never armed, no error) for empty input", () => {
    for (const input of ["", "   ", "\t"]) {
      const entry = publishEntryState(input);
      expect(entry.status).toBe("idle");
      if (entry.status !== "idle") continue;
      expect(entry.input).toBe(input);
    }
  });

  it("rejects non-share input with an inline reason", () => {
    const entry = publishEntryState("https://example.com/watch?v=1");
    expect(entry.status).toBe("invalid");
    if (entry.status !== "invalid") return;
    expect(entry.reason).toContain("Sia share URL");
  });

  it("arms a valid share URL into the source model for a later SiaVideo step", () => {
    const url = shareUrl();
    const entry = publishEntryState(url);
    expect(entry.status).toBe("armed");
    if (entry.status !== "armed") return;
    expect(entry.source.objectKey).toBe(OBJECT_KEY);
    expect(entry.source.indexerUrl).toBe("https://indexer.example");
    expect(entry.source.fetchForm).toBe(url.replace("https://", "sia://"));
  });

  it("keeps raw encryption-key material out of the armed source model", () => {
    const entry = publishEntryState(shareUrl());
    expect(entry.status).toBe("armed");
    if (entry.status !== "armed") return;
    expect(entry.source).not.toHaveProperty("encryptionKey");
  });
});
