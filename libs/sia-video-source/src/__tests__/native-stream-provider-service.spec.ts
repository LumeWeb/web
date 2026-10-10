/**
 * Tests the `createSiaNativeStreamProvider` service overload: passing an app
 * stream service (`isAvailable`, `resolve`, `session`) directly, without the
 * dependency-callback adapter. The tests prove a typed service is accepted
 * and that the provider keeps the factory's signal, release, Blob, and
 * error behavior.
 */
import { describe, expect, it } from "vitest";
import {
  createSiaNativeStreamProvider,
  type SiaNativeStreamProvider,
  type SiaNativeStreamProviderDependencies,
  type SiaNativeStreamService,
  type SiaNativeStreamSession,
  SiaNativeStreamUnavailableError,
} from "../native-stream-provider.ts";

const STREAM_URL = "https://streams.example/objects/abc123";

interface PinnedObject {
  key: string;
}

interface UrlCall {
  name: string;
  source: PinnedObject;
  type?: string;
}

/** A service with a concrete resolved-source type, as an app would write it. */
class NativeStreamService {
  available = true;
  released = 0;
  readonly resolved: PinnedObject[] = [];
  readonly urlCalls: UrlCall[] = [];

  isAvailable(_signal?: AbortSignal): Promise<boolean> {
    return Promise.resolve(this.available);
  }

  resolve(src: string, _signal?: AbortSignal): Promise<PinnedObject> {
    const object: PinnedObject = { key: src };
    this.resolved.push(object);
    return Promise.resolve(object);
  }

  session(_source: PinnedObject): SiaNativeStreamSession {
    return {
      url: (object, options) => {
        this.urlCalls.push({
          name: options.name,
          source: object as PinnedObject,
          type: options.type,
        });
        return Promise.resolve({
          release: () => {
            this.released += 1;
          },
          url: STREAM_URL,
        });
      },
    };
  }
}

describe("createSiaNativeStreamProvider (service overload)", () => {
  it("does not prepare at construction and prepares before the first capability check", async () => {
    const calls: string[] = [];
    const service: SiaNativeStreamService<PinnedObject> = {
      isAvailable: () => {
        calls.push("available");
        return Promise.resolve(false);
      },
      prepare: () => {
        calls.push("prepare");
        return Promise.resolve();
      },
      resolve: (src) => Promise.resolve({ key: src }),
      session: () => ({
        url: () =>
          Promise.resolve({ release: () => undefined, url: STREAM_URL }),
      }),
    };
    const provider = createSiaNativeStreamProvider(service);
    expect(calls).toEqual([]);
    await expect(provider.available()).resolves.toBe(false);
    expect(calls).toEqual(["prepare", "available"]);
  });

  it("builds a working provider from a typed service without adapter boilerplate", async () => {
    const service = new NativeStreamService();
    const provider: SiaNativeStreamProvider =
      createSiaNativeStreamProvider(service);

    const stream = await provider.open("abc123", {
      mimeType: "video/mp4",
      name: "clip.mp4",
      signal: new AbortController().signal,
    });

    expect(stream.url).toBe(STREAM_URL);
    expect(service.resolved).toEqual([{ key: "abc123" }]);
    expect(service.urlCalls).toEqual([
      { name: "clip.mp4", source: { key: "abc123" }, type: "video/mp4" },
    ]);
  });

  it("keeps dependency callbacks when the object also has service-shaped methods", async () => {
    const calls: string[] = [];
    const dependencies: Pick<
      SiaNativeStreamService,
      "isAvailable" | "resolve" | "session"
    > &
      SiaNativeStreamProviderDependencies = {
      capability: () => {
        calls.push("capability");
        return Promise.resolve(true);
      },
      createStreamSession: () => {
        calls.push("createStreamSession");
        return {
          url: () =>
            Promise.resolve({
              release: () => undefined,
              url: STREAM_URL,
            }),
        };
      },
      isAvailable: () => Promise.reject(new Error("wrong overload")),
      resolve: () => Promise.reject(new Error("wrong overload")),
      resolveSource: () => {
        calls.push("resolveSource");
        return Promise.resolve({});
      },
      session: () => Promise.reject(new Error("wrong overload")),
    };
    const provider = createSiaNativeStreamProvider(dependencies);

    await provider.open("abc123", { signal: new AbortController().signal });

    expect(calls).toEqual([
      "capability",
      "resolveSource",
      "createStreamSession",
    ]);
  });

  it("rejects without requesting a stream URL when the service reports unavailable", async () => {
    const service = new NativeStreamService();
    service.available = false;
    const provider = createSiaNativeStreamProvider(service);

    await expect(
      provider.open("abc123", { signal: new AbortController().signal }),
    ).rejects.toBeInstanceOf(SiaNativeStreamUnavailableError);
    expect(service.urlCalls).toHaveLength(0);
  });

  it("passes the caller signal to isAvailable, resolve, and session", async () => {
    const seen: AbortSignal[] = [];
    const service: SiaNativeStreamService<PinnedObject> = {
      isAvailable: (signal) => {
        if (signal) seen.push(signal);
        return Promise.resolve(true);
      },
      resolve: (_src, signal) => {
        if (signal) seen.push(signal);
        return Promise.resolve({ key: "abc123" });
      },
      session: (_source, signal) => {
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
    };
    const controller = new AbortController();

    await createSiaNativeStreamProvider(service).open("abc123", {
      signal: controller.signal,
    });

    expect(seen).toEqual([
      controller.signal,
      controller.signal,
      controller.signal,
      controller.signal,
    ]);
  });

  it("releases the upstream stream once after repeated release calls", async () => {
    const service = new NativeStreamService();
    const provider = createSiaNativeStreamProvider(service);

    const stream = await provider.open("abc123", {
      signal: new AbortController().signal,
    });
    stream.release();
    stream.release();

    expect(service.released).toBe(1);
  });

  it("releases and rejects a URL result that carries a Blob", async () => {
    const service: SiaNativeStreamService<PinnedObject> = {
      isAvailable: () => Promise.resolve(true),
      resolve: (src) => Promise.resolve({ key: src }),
      session: () => ({
        url: () =>
          Promise.resolve({
            blob: new Blob(["video-bytes"]),
            release: () => undefined,
            url: STREAM_URL,
          }),
      }),
    };

    await expect(
      createSiaNativeStreamProvider(service).open("abc123", {
        signal: new AbortController().signal,
      }),
    ).rejects.toThrow(/blob/);
  });
});
