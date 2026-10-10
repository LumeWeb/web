import { describe, expect, it } from "vitest";
import { publishSource } from "./publishSource";

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

describe("publishSource", () => {
  it("accepts a valid Sia share URL and returns a normalized parsed result", () => {
    const result = publishSource(shareUrl());
    expect(result.status).toBe("valid");
    if (result.status !== "valid") return;
    expect(result.source.objectKey).toBe(OBJECT_KEY);
    expect(result.source.indexerUrl).toBe("https://indexer.example");
    expect(result.source.fetchForm).toBe(
      shareUrl().replace("https://", "sia://"),
    );
  });

  it("accepts the sia:// alias form and carries its bytes into the fetch form", () => {
    const url = shareUrl().replace("https://", "sia://");
    const result = publishSource(url);
    expect(result.status).toBe("valid");
    if (result.status !== "valid") return;
    expect(result.source.fetchForm).toBe(url);
  });

  it("lowercases an uppercase object key and trims surrounding whitespace", () => {
    const input = `  ${shareUrl(OBJECT_KEY.toUpperCase())}  `;
    const result = publishSource(input);
    expect(result.status).toBe("valid");
    if (result.status !== "valid") return;
    expect(result.source.objectKey).toBe(OBJECT_KEY);
    expect(result.input).toBe(input.trim());
  });

  it("keeps raw encryption-key bytes out of the UI-facing result", () => {
    const result = publishSource(shareUrl());
    if (result.status !== "valid") throw new Error("expected a valid result");
    expect(result.source).not.toHaveProperty("encryptionKey");
    expect("encryptionKey" in result.source).toBe(false);
  });

  it("rejects text that is not a Sia share URL with an inline reason", () => {
    for (const input of ["", "hello", "https://example.com/watch?v=1"]) {
      const result = publishSource(input);
      expect(result.status).toBe("invalid");
      if (result.status !== "invalid") continue;
      expect(result.reason).toContain("Sia share URL");
    }
  });

  it("rejects a share-shaped URL with no encryption_key fragment", () => {
    const missing = `https://indexer.example/objects/${OBJECT_KEY}/shared?req=abc`;
    const result = publishSource(missing);
    expect(result.status).toBe("invalid");
  });

  it("rejects a share-shaped URL whose encryption key is not 32 bytes", () => {
    const short = `https://indexer.example/objects/${OBJECT_KEY}/shared?req=abc#encryption_key=AAAA`;
    const result = publishSource(short);
    expect(result.status).toBe("invalid");
    if (result.status !== "invalid") return;
    expect(result.reason).toMatch(/32 bytes/);
  });

  it("rejects a share-shaped URL with a malformed 64-hex object key", () => {
    const malformed = `https://indexer.example/objects/${"gg".repeat(32)}/shared?req=abc${encryptionFragment()}`;
    const result = publishSource(malformed);
    expect(result.status).toBe("invalid");
    if (result.status !== "invalid") return;
    expect(result.reason).toMatch(/64 hex/);
  });
});
