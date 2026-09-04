import { describe, expect, it } from "vitest";

import { sanitizeWalletIcon, walletLogos } from "./logos";

describe("walletLogos", () => {
  it("covers the Solana probe ids (always unbranded via announced icons)", () => {
    for (const id of ["phantom", "solflare", "backpack"]) {
      expect(walletLogos[id]).toBeDefined();
    }
  });

  it("covers common EVM EIP-6963 rdns ids", () => {
    for (const id of [
      "io.metamask",
      "com.coinbase.wallet",
      "com.trustwallet.app",
      "app.phantom",
    ]) {
      expect(walletLogos[id]).toBeDefined();
    }
  });

  it("omits unverified brand colours so they fall back to the neutral disc", () => {
    expect(walletLogos["io.rabby"]).toBeUndefined();
  });

  it("every entry has a fallback colour and only optional SVG icons", () => {
    for (const [id, entry] of Object.entries(walletLogos)) {
      expect(`${id}.color`).toBeTruthy();
      expect(entry.color).toBeTruthy();
      expect(entry.Icon === undefined || typeof entry.Icon === "function").toBe(
        true,
      );
    }
  });
});

describe("sanitizeWalletIcon", () => {
  const PNGB64 =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  it("accepts a small base64 png data URI", () => {
    expect(sanitizeWalletIcon(PNGB64)).toBe(PNGB64);
  });

  it("accepts jpeg/webp/gif/avif data URIs", () => {
    for (const mime of ["jpeg", "webp", "gif", "avif"]) {
      expect(sanitizeWalletIcon(`data:image/${mime};base64,AAAA`)).toBeTruthy();
    }
  });

  it("rejects svg data URIs (scripting / XSS)", () => {
    const svg =
      "data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+PC9zdmc+";
    expect(sanitizeWalletIcon(svg)).toBeNull();
    // Non-base64 encoded svg also rejected.
    expect(
      sanitizeWalletIcon("data:image/svg+xml,<svg onload=alert(1)>"),
    ).toBeNull();
  });

  it("rejects remote http(s) URLs (privacy / unvetted fetch)", () => {
    expect(
      sanitizeWalletIcon("https://wallet.example/icon.png"),
    ).toBeNull();
    expect(sanitizeWalletIcon("http://localhost/icon.png")).toBeNull();
  });

  it("rejects non-image and malformed data URIs", () => {
    expect(sanitizeWalletIcon("data:text/html;base64,PGI+")).toBeNull();
    expect(sanitizeWalletIcon("data:image/png;base64,not!base64!")).toBeNull();
    expect(sanitizeWalletIcon(undefined)).toBeNull();
    expect(sanitizeWalletIcon("")).toBeNull();
  });

  it("rejects oversized blobs over the 32 KiB cap", () => {
    const big = `data:image/png;base64,${"A".repeat(60_000)}`;
    expect(big.length).toBeGreaterThan(32 * 1024);
    expect(sanitizeWalletIcon(big)).toBeNull();
  });
});
