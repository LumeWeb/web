/** Media inspection uses the append thread's MIME verdict when the worker cannot probe MSE. */
import { expect, test } from "vitest";
import { detectBrowserCapabilities } from "../capabilities/browser-capabilities.ts";
import { inspectMediaLibrary } from "../media/library-load.ts";
import { MemoryByteSource } from "../transport/memory-byte-source.ts";
import { browserDecodableFixtureBytes } from "./fixtures/browser-decodable-fixture.ts";

const mime = 'video/mp4; codecs="avc1.640032,mp4a.40.2"';

test("an append-thread acceptance permits inspection without worker-local MSE", async () => {
  const probes: string[] = [];
  const result = await inspectMediaLibrary(
    new MemoryByteSource(browserDecodableFixtureBytes()),
    {
      capabilities: detectBrowserCapabilities({}),
      checkMime: (value) => {
        probes.push(value);
        return Promise.resolve(true);
      },
    },
  );
  expect(result.status).toBe("ready");
  expect(probes).toEqual([mime]);
  if (result.status === "ready") result.playback.dispose();
});

test("a failed append-thread probe rejects instead of reporting unsupported media", async () => {
  await expect(
    inspectMediaLibrary(new MemoryByteSource(browserDecodableFixtureBytes()), {
      capabilities: detectBrowserCapabilities({}),
      checkMime: () => Promise.reject(new Error("host unavailable")),
    }),
  ).rejects.toBeInstanceOf(Error);
});

test("an append-thread rejection overrides worker-local MIME support", async () => {
  const result = await inspectMediaLibrary(
    new MemoryByteSource(browserDecodableFixtureBytes()),
    {
      capabilities: {
        ...detectBrowserCapabilities({}),
        mseSupported: () => true,
      },
      checkMime: () => Promise.resolve(false),
    },
  );
  expect(result).toEqual({ reason: "mime-unsupported", status: "unsupported" });
  if (result.status === "ready") result.playback.dispose();
});
