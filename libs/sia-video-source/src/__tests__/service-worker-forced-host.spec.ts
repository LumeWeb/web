import { SIA_PLAYBACK_BACKENDS } from "../playback-backend.ts";
import { MediaError } from "@videojs/media";
import { describe, expect, it, vi } from "vitest";
import {
  type SiaNativeStream,
  type SiaNativeStreamProvider,
} from "../native-stream-provider.ts";
import {
  FORCED_SERVICE_WORKER_NO_PROVIDER,
  SiaVideoSource,
} from "../sia-video-source.ts";
import { nullLogger } from "../log/logger.ts";

interface FakeProvider {
  opened: string[];
  provider: SiaNativeStreamProvider;
  released: number;
  streams: number;
}

class FakeVideoTarget extends EventTarget {
  src = "";
  getAttribute(_name: string): null {
    return null;
  }
  removeAttribute(_name: string): void {
    this.src = "";
  }
}

function fakeProvider(): FakeProvider {
  const opened: string[] = [];
  let released = 0;
  let streams = 0;
  const provider: SiaNativeStreamProvider = {
    available: () => Promise.resolve(true),
    open: (src) => {
      opened.push(src);
      streams += 1;
      let releasedThis = false;
      const stream: SiaNativeStream = {
        release: () => {
          if (releasedThis) return;
          releasedThis = true;
          released += 1;
        },
        url: `https://stream.example/${src}`,
      };
      return Promise.resolve(stream);
    },
  };
  return {
    opened,
    provider,
    get released() {
      return released;
    },
    get streams() {
      return streams;
    },
  };
}
const flush = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));

function forcedHost(options: {
  nativeStreamProvider?: SiaNativeStreamProvider;
}): {
  createWorker: ReturnType<typeof vi.fn>;
  host: SiaVideoSource;
  target: FakeVideoTarget;
} {
  const createWorker = refusingCreateWorker();
  const host = new SiaVideoSource({
    backend: SIA_PLAYBACK_BACKENDS.SERVICE_WORKER,
    createWorker: createWorker as unknown as () => Worker,
    logger: nullLogger,
    nativeStreamProvider: options.nativeStreamProvider,
  });
  const target = new FakeVideoTarget();
  host.attach(target as unknown as HTMLVideoElement);
  return { createWorker, host, target };
}

function refusingCreateWorker(): ReturnType<typeof vi.fn> {
  return vi.fn(() => {
    throw new Error(
      "a dedicated worker must not be constructed in forced service-worker mode",
    );
  });
}

describe("forced service-worker playback", () => {
  it("reloadConfiguration disposes an existing worker without starting a handshake", () => {
    const sent: unknown[] = [];
    let terminated = 0;
    const worker = {
      addEventListener: () => undefined,
      postMessage: (message: unknown) => sent.push(message),
      removeEventListener: () => undefined,
      terminate: () => {
        terminated += 1;
      },
    };
    const host = new SiaVideoSource({
      backend: SIA_PLAYBACK_BACKENDS.AUTO,
      createWorker: () => worker as unknown as Worker,
      logger: nullLogger,
    });
    const target = new FakeVideoTarget();
    host.attach(target as unknown as HTMLVideoElement);
    expect(sent).toHaveLength(1);

    host.backend = SIA_PLAYBACK_BACKENDS.SERVICE_WORKER;
    host.reloadConfiguration();

    expect(terminated).toBe(1);
    expect(sent).toHaveLength(1);
    host.destroy();
  });

  it("routes a src through the native provider without constructing or posting to a worker", async () => {
    const { opened, provider } = fakeProvider();
    const { createWorker, host, target } = forcedHost({
      nativeStreamProvider: provider,
    });

    host.src = "abc123";
    await flush();

    expect(createWorker).not.toHaveBeenCalled();
    expect(opened).toEqual(["abc123"]);
    expect(target.src).toBe("https://stream.example/abc123");
    host.destroy();
  });

  it("reports a deterministic error when forced service-worker has no provider, and spawns no worker", () => {
    const { createWorker, host } = forcedHost({});

    host.src = "abc123";

    expect(createWorker).not.toHaveBeenCalled();
    const error = host.error;
    expect(error).toBeInstanceOf(MediaError);
    expect((error as MediaError).code).toBe(
      MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED,
    );
    expect((error as MediaError).message).toBe(
      FORCED_SERVICE_WORKER_NO_PROVIDER,
    );
    expect((error as MediaError).context).toBe(
      FORCED_SERVICE_WORKER_NO_PROVIDER,
    );
    host.destroy();
  });

  it("releases the previous native stream exactly once when a distinct src replaces it", async () => {
    const fake = fakeProvider();
    const { host, target } = forcedHost({
      nativeStreamProvider: fake.provider,
    });

    host.src = "a";
    await flush();
    expect(target.src).toBe("https://stream.example/a");

    host.src = "b";
    await flush();

    expect(fake.opened).toEqual(["a", "b"]);
    expect(target.src).toBe("https://stream.example/b");
    expect(fake.released).toBe(1);
    host.destroy();
    expect(fake.released).toBe(2);
  });

  it("destroys the backend on destroy and starts no new load from a later src", async () => {
    const fake = fakeProvider();
    const { host, target } = forcedHost({
      nativeStreamProvider: fake.provider,
    });

    host.src = "a";
    await flush();
    expect(target.src).toBe("https://stream.example/a");

    host.destroy();
    expect(fake.released).toBe(1);

    host.src = "b";
    await flush();
    expect(fake.opened).toEqual(["a"]);
    expect(fake.released).toBe(1);
  });
});
