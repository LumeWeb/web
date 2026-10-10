/**
 * Tests the adapter with injected capability, source resolution, and stream-session functions.
 * The tests cover unavailable pages, source locators, URL options, release ownership, and Blob rejection.
 */
import { describe, expect, it } from "vitest";
import {
  createSiaNativeStreamProvider,
  SiaNativeStreamResolutionError,
  type SiaNativeStreamSession,
  SiaNativeStreamUnavailableError,
} from "../native-stream-provider.ts";

const SIGNAL = new AbortController().signal;
const STREAM_URL = "https://streams.example/objects/abc123";

interface UrlCall {
  name: string;
  source: unknown;
  type?: string;
}

/** A stream-session fake that records `url` calls and returns one file. */
function makeSession(
  urlCalls: UrlCall[],
  upstream: { blob?: Blob; release: () => void },
): SiaNativeStreamSession {
  return {
    url: (source, options) => {
      urlCalls.push({ name: options.name, source, type: options.type });
      return Promise.resolve({
        blob: upstream.blob,
        release: upstream.release,
        url: STREAM_URL,
      });
    },
  };
}

describe("createSiaNativeStreamProvider", () => {
  it("prepares lazily before checking capability and only once across availability and open", async () => {
    const calls: string[] = [];
    let prepared = 0;
    const provider = createSiaNativeStreamProvider({
      capability: () => {
        calls.push("capability");
        return Promise.resolve(true);
      },
      createStreamSession: () => ({
        url: () =>
          Promise.resolve({ release: () => undefined, url: STREAM_URL }),
      }),
      prepare: () => {
        calls.push("prepare");
        prepared += 1;
        return Promise.resolve();
      },
      resolveSource: () => {
        calls.push("resolve");
        return Promise.resolve("pinned-object");
      },
    });

    expect(prepared).toBe(0);
    await provider.available();
    await provider.open("abc123", { signal: SIGNAL });

    expect(calls).toEqual(["prepare", "capability", "capability", "resolve"]);
  });

  it("shares one pending preparation across concurrent calls", async () => {
    let resolvePreparation!: () => void;
    let preparations = 0;
    const provider = createSiaNativeStreamProvider({
      capability: () => Promise.resolve(false),
      createStreamSession: () => makeSession([], { release: () => undefined }),
      prepare: () => {
        preparations += 1;
        return new Promise<void>((resolve) => {
          resolvePreparation = resolve;
        });
      },
      resolveSource: () => Promise.resolve("pinned-object"),
    });
    const first = provider.available();
    const second = provider.available();
    expect(preparations).toBe(1);
    resolvePreparation();

    await expect(first).resolves.toBe(false);
    await expect(second).resolves.toBe(false);
  });

  it("retries preparation after an aborted attempt with the later call's signal", async () => {
    const signals: AbortSignal[] = [];
    let attempts = 0;
    const provider = createSiaNativeStreamProvider({
      capability: () => Promise.resolve(true),
      createStreamSession: () => makeSession([], { release: () => undefined }),
      prepare: (signal) => {
        signals.push(signal!);
        attempts += 1;
        return attempts === 1
          ? Promise.reject(new DOMException("aborted", "AbortError"))
          : Promise.resolve();
      },
      resolveSource: () => Promise.resolve("pinned-object"),
    });
    const first = new AbortController();
    const second = new AbortController();

    await expect(provider.available(first.signal)).rejects.toThrow("aborted");
    await expect(provider.available(second.signal)).resolves.toBe(true);

    expect(signals).toEqual([first.signal, second.signal]);
  });

  it("rejects without requesting a stream URL when capability is unavailable", async () => {
    const urlCalls: UrlCall[] = [];
    const provider = createSiaNativeStreamProvider({
      capability: () => Promise.resolve(false),
      createStreamSession: () =>
        makeSession(urlCalls, { release: () => undefined }),
      resolveSource: () => Promise.resolve("pinned-object"),
    });

    await expect(
      provider.open("abc123", { signal: SIGNAL }),
    ).rejects.toBeInstanceOf(SiaNativeStreamUnavailableError);
    expect(urlCalls).toHaveLength(0);
  });

  it("passes the locator, MIME type, and file name through the injected dependencies", async () => {
    const urlCalls: UrlCall[] = [];
    const resolvedSources: unknown[] = [];
    const provider = createSiaNativeStreamProvider({
      capability: () => Promise.resolve(true),
      createStreamSession: (source) => {
        resolvedSources.push(source);
        return makeSession(urlCalls, { release: () => undefined });
      },
      resolveSource: (src) => {
        resolvedSources.push(src);
        return Promise.resolve("pinned-object");
      },
    });

    const stream = await provider.open("abc123", {
      mimeType: "video/mp4",
      name: "clip.mp4",
      signal: SIGNAL,
    });

    expect(resolvedSources).toEqual(["abc123", "pinned-object"]);
    expect(urlCalls).toEqual([
      { name: "clip.mp4", source: "pinned-object", type: "video/mp4" },
    ]);
    expect(stream.url).toBe(STREAM_URL);
  });

  it("uses video as the URL name when the caller omits a name", async () => {
    const urlCalls: UrlCall[] = [];
    const provider = createSiaNativeStreamProvider({
      capability: () => Promise.resolve(true),
      createStreamSession: () =>
        makeSession(urlCalls, { release: () => undefined }),
      resolveSource: () => Promise.resolve("pinned-object"),
    });

    await provider.open("abc123", { signal: SIGNAL });

    expect(urlCalls[0].name).toBe("video");
  });

  it("releases the acquired stream once after repeated release calls", async () => {
    let upstreamReleases = 0;
    const provider = createSiaNativeStreamProvider({
      capability: () => Promise.resolve(true),
      createStreamSession: () =>
        makeSession([], {
          release: () => {
            upstreamReleases += 1;
          },
        }),
      resolveSource: () => Promise.resolve("pinned-object"),
    });

    const stream = await provider.open("abc123", { signal: SIGNAL });
    stream.release();
    stream.release();

    expect(upstreamReleases).toBe(1);
  });

  it("sanitizes a resolver error that echoes a share URL while retaining its context", async () => {
    const shareUrl =
      "https://idx.example.com/objects/0123456789abcdef0123456789abcdef0123456789abcdef0123456789" +
      "/shared?sig=signed#encryption_key=a29lcnktZXgtbXctbGtleQ";
    const received: string[] = [];
    const provider = createSiaNativeStreamProvider({
      capability: () => Promise.resolve(true),
      createStreamSession: () => makeSession([], { release: () => undefined }),
      resolveSource: (src) => {
        received.push(src);
        throw new Error(`indexer does not know this object: ${src}`);
      },
    });

    const error = await provider.open(shareUrl, { signal: SIGNAL }).then(
      () => null,
      (e: unknown) => e,
    );

    expect(received).toEqual([shareUrl]);
    expect(error).toBeInstanceOf(SiaNativeStreamResolutionError);
    expect((error as Error).message).toContain(
      "indexer does not know this object",
    );
    expect((error as Error).message).not.toContain(shareUrl);
    expect((error as Error).message).not.toContain("encryption_key");
    expect((error as Error).message).not.toContain("a29lcnktZXgtbXctbGtleQ");
  });

  it("keeps object-locator resolver errors unchanged", async () => {
    const resolverError = new Error("object lookup failed");
    const provider = createSiaNativeStreamProvider({
      capability: () => Promise.resolve(true),
      createStreamSession: () => makeSession([], { release: () => undefined }),
      resolveSource: () => Promise.reject(resolverError),
    });

    await expect(provider.open("object-key", { signal: SIGNAL })).rejects.toBe(
      resolverError,
    );
  });

  it("keeps errors from stream URL acquisition unchanged", async () => {
    const sessionError = new Error("stream URL failed");
    const provider = createSiaNativeStreamProvider({
      capability: () => Promise.resolve(true),
      createStreamSession: () => ({
        url: () => Promise.reject(sessionError),
      }),
      resolveSource: () => Promise.resolve("pinned-object"),
    });

    await expect(provider.open("object-key", { signal: SIGNAL })).rejects.toBe(
      sessionError,
    );
  });

  it("passes the caller signal to capability, resolution, session creation, and URL acquisition", async () => {
    const controller = new AbortController();
    const seen: AbortSignal[] = [];
    const provider = createSiaNativeStreamProvider({
      capability: (signal) => {
        if (signal) seen.push(signal);
        return Promise.resolve(true);
      },
      createStreamSession: (_source, signal) => {
        if (signal) seen.push(signal);
        return {
          url: (_object, options) => {
            if (options.signal) seen.push(options.signal);
            return Promise.resolve({
              release: () => undefined,
              url: STREAM_URL,
            });
          },
        };
      },
      resolveSource: (_src, signal) => {
        if (signal) seen.push(signal);
        return Promise.resolve("pinned-object");
      },
    });

    await provider.open("abc123", { signal: controller.signal });

    expect(seen).toEqual([
      controller.signal,
      controller.signal,
      controller.signal,
      controller.signal,
    ]);
  });

  it("releases and rejects a URL result that carries a Blob", async () => {
    let upstreamReleases = 0;
    const provider = createSiaNativeStreamProvider({
      capability: () => Promise.resolve(true),
      createStreamSession: () =>
        makeSession([], {
          blob: new Blob(["video-bytes"]),
          release: () => {
            upstreamReleases += 1;
          },
        }),
      resolveSource: () => Promise.resolve("pinned-object"),
    });

    await expect(provider.open("abc123", { signal: SIGNAL })).rejects.toThrow(
      /blob/,
    );
    expect(upstreamReleases).toBe(1);
  });
});
