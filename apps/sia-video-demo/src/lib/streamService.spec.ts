import {
  createSiaNativeStreamProvider,
  SiaNativeStreamUnavailableError,
} from "@lumeweb/sia-video-source";
import { describe, expect, it } from "vitest";
import {
  createDemoNativeStreamService,
  demoStreamUrl,
  resolveDemoStreamSource,
} from "./streamService";

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

const BASE_URL = "https://stream.example/base";
const SIGNAL = new AbortController().signal;

describe("resolveDemoStreamSource", () => {
  it("resolves a Sia share URL to a shared source with its object key", () => {
    expect(resolveDemoStreamSource(shareUrl())).toEqual({
      objectKey: OBJECT_KEY,
      shared: true,
    });
  });

  it("resolves a bare 64-hex object key to a non-shared source", () => {
    expect(resolveDemoStreamSource(OBJECT_KEY)).toEqual({
      objectKey: OBJECT_KEY,
      shared: false,
    });
  });

  it("rejects input that is neither a share URL nor an object key", () => {
    expect(() => resolveDemoStreamSource("not-a-source")).toThrow();
  });
});

describe("demoStreamUrl", () => {
  it("builds the stream endpoint URL for a shared source", () => {
    expect(
      demoStreamUrl({ objectKey: OBJECT_KEY, shared: true }, BASE_URL),
    ).toBe(`${BASE_URL}/stream?object=${OBJECT_KEY}&via=shared`);
  });

  it("builds the stream endpoint URL for a non-shared source", () => {
    expect(
      demoStreamUrl({ objectKey: OBJECT_KEY, shared: false }, BASE_URL),
    ).toBe(`${BASE_URL}/stream?object=${OBJECT_KEY}`);
  });

  it("strips a trailing slash from the base URL", () => {
    expect(
      demoStreamUrl({ objectKey: OBJECT_KEY, shared: false }, `${BASE_URL}/`),
    ).toBe(`${BASE_URL}/stream?object=${OBJECT_KEY}`);
  });
});

describe("createDemoNativeStreamService", () => {
  it("is unavailable while no stream base URL is configured", async () => {
    const service = createDemoNativeStreamService({
      streamBaseUrl: () => "",
    });
    await expect(service.isAvailable(SIGNAL)).resolves.toBe(false);
  });

  it("is unavailable for a blank (whitespace-only) base URL", async () => {
    const service = createDemoNativeStreamService({
      streamBaseUrl: () => "   ",
    });
    await expect(service.isAvailable(SIGNAL)).resolves.toBe(false);
  });

  it("is available once a stream base URL is configured", async () => {
    const service = createDemoNativeStreamService({
      streamBaseUrl: () => BASE_URL,
    });
    await expect(service.isAvailable(SIGNAL)).resolves.toBe(true);
  });

  it("opens a stream at the derived endpoint URL and stays releasable", async () => {
    const service = createDemoNativeStreamService({
      streamBaseUrl: () => BASE_URL,
    });
    const provider = createSiaNativeStreamProvider(service);
    const stream = await provider.open(shareUrl(), {
      name: "video",
      signal: SIGNAL,
    });
    expect(stream.url).toBe(
      `${BASE_URL}/stream?object=${OBJECT_KEY}&via=shared`,
    );
    stream.release();
    stream.release(); // release stays idempotent
  });

  it("rejects with the unavailable error when the base URL is empty", async () => {
    const service = createDemoNativeStreamService({
      streamBaseUrl: () => "",
    });
    const provider = createSiaNativeStreamProvider(service);
    await expect(
      provider.open(shareUrl(), { signal: SIGNAL }),
    ).rejects.toBeInstanceOf(SiaNativeStreamUnavailableError);
  });
});
