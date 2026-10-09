import { MediaError } from '@videojs/media';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_ERROR_MESSAGES } from '../errors.ts';
import { nullLogger } from '../log/logger.ts';
import { type SiaNativeStream, type SiaNativeStreamProvider } from '../native-stream-provider.ts';
import { SiaVideoSource } from '../sia-video-source.ts';

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

class FakeVideoTarget extends EventTarget {
  src = '';
  getAttribute(_name: string): null {
    return null;
  }
  removeAttribute(_name: string): void {
    this.src = '';
  }
}



function controllableProvider(): {
  opened: string[];
  provider: SiaNativeStreamProvider;
  released: number;
  resolve: (src: string) => void;
  urls: string[];
} {
  const opened: string[] = [];
  const urls: string[] = [];
  let released = 0;
  let streams = 0;
  const pending = new Map<string, () => void>();
  const provider: SiaNativeStreamProvider = {
    available: () => Promise.resolve(true),
    open: (src, { signal }) => {
      opened.push(src);
      streams += 1;
      const url = `https://stream.example/${streams}`;
      urls.push(url);
      return new Promise<SiaNativeStream>((resolve, reject) => {
        const onAbort = (): void => {
          const error = new Error('aborted');
          error.name = 'AbortError';
          reject(error);
        };
        if (signal.aborted) {
          onAbort();
          return;
        }
        signal.addEventListener('abort', onAbort, { once: true });
        pending.set(src, () => {
          signal.removeEventListener('abort', onAbort);
          let releasedThis = false;
          resolve({
            release: () => {
              if (releasedThis) return;
              releasedThis = true;
              released += 1;
            },
            url,
          });
        });
      });
    },
  };
  return {
    opened,
    provider,
    get released() {
      return released;
    },
    resolve: (src: string): void => {
      pending.get(src)?.();
    },
    urls,
  };
}
function forcedHost(provider: SiaNativeStreamProvider): {
  createWorker: ReturnType<typeof vi.fn>;
  host: SiaVideoSource;
  target: FakeVideoTarget;
} {
  const createWorker = refusingCreateWorker();
  const host = new SiaVideoSource({
    backend: 'service-worker',
    createWorker: createWorker as unknown as () => Worker,
    logger: nullLogger,
    nativeStreamProvider: provider,
  });
  const target = new FakeVideoTarget();
  host.attach(target as unknown as HTMLVideoElement);
  return { createWorker, host, target };
}
function refusingCreateWorker(): ReturnType<typeof vi.fn> {
  return vi.fn(() => {
    throw new Error('a dedicated worker must not be constructed in forced service-worker mode');
  });
}
function trackingProvider(): {
  opened: string[];
  provider: SiaNativeStreamProvider;
  released: number;
  urls: string[];
} {
  const opened: string[] = [];
  const urls: string[] = [];
  let released = 0;
  let streams = 0;
  const provider: SiaNativeStreamProvider = {
    available: () => Promise.resolve(true),
    open: (src) => {
      opened.push(src);
      streams += 1;
      const url = `https://stream.example/${streams}`;
      urls.push(url);
      let releasedThis = false;
      const stream: SiaNativeStream = {
        release: () => {
          if (releasedThis) return;
          releasedThis = true;
          released += 1;
        },
        url,
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
    urls,
  };
}


describe('SiaVideoSource forced service-worker backend (load + provider failure safety)', () => {
  it('load() re-runs the current src through the backend, releasing the previous stream once', async () => {
    const fake = trackingProvider();
    const { createWorker, host, target } = forcedHost(fake.provider);

    host.src = 'abc123';
    await flush();
    expect(target.src).toBe(fake.urls[0]);

    host.load();
    await flush();

    expect(createWorker).not.toHaveBeenCalled();
    expect(fake.opened).toEqual(['abc123', 'abc123']);
    expect(fake.released).toBe(1);
    expect(target.src).toBe(fake.urls[1]);

    host.destroy();
    expect(fake.released).toBe(2);
  });

  it('stores a locator-free MediaError and fires error when the provider reports unavailable', async () => {
    const locator = '000000000000000000000000000000000000000000000000000000000000dead';
    const open = vi.fn(() => Promise.resolve(null as unknown as SiaNativeStream));
    const { createWorker, host } = forcedHost({
      available: () => Promise.resolve(false),
      open,
    });
    const errors: Event[] = [];
    host.addEventListener('error', (event: Event) => errors.push(event));

    host.src = locator;
    await flush();

    expect(createWorker).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
    expect(errors).toHaveLength(1);
    expect(errors[0]?.type).toBe('error');
    const mediaError = host.error as MediaError;
    expect(mediaError).toBeInstanceOf(MediaError);
    expect(mediaError.code).toBe(MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED);
    expect(mediaError.message).toBe(DEFAULT_ERROR_MESSAGES.unsupported);
    expect(mediaError.message).not.toContain(locator);
    host.destroy();
  });

  it('stores a locator-free network MediaError and fires error when provider open fails', async () => {
    const locator = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    const { createWorker, host } = forcedHost({
      available: () => Promise.resolve(true),
      open: (src) => Promise.reject(new Error(`upstream fetch failed for ${src}`)),
    });
    const errors: Event[] = [];
    host.addEventListener('error', (event: Event) => errors.push(event));

    host.src = locator;
    await flush();

    expect(createWorker).not.toHaveBeenCalled();
    expect(errors).toHaveLength(1);
    expect(errors[0]?.type).toBe('error');
    const mediaError = host.error as MediaError;
    expect(mediaError).toBeInstanceOf(MediaError);
    expect(mediaError.code).toBe(MediaError.MEDIA_ERR_NETWORK);
    expect(mediaError.message).toBe(DEFAULT_ERROR_MESSAGES.network);
    expect(mediaError.message).not.toContain(locator);
    host.destroy();
  });

  it('keeps a cancelled/stale open non-user-visible when a distinct src replaces it', async () => {
    const controllable = controllableProvider();
    const { host, target } = forcedHost(controllable.provider);
    const errors: Event[] = [];
    host.addEventListener('error', (event: Event) => errors.push(event));

    host.src = 'a'; // open('a') stays pending ...
    host.src = 'b'; // ... the replacement aborts it
    await flush(); // let both acquire chains reach `open`
    controllable.resolve('b');
    await flush(); // let 'b' attach and 'a's abort settle

    expect(controllable.opened).toEqual(['a', 'b']);
    expect(target.src).toBe(controllable.urls[1]);
    expect(errors).toHaveLength(0);
    expect(host.error).toBeNull();

    host.destroy();
    expect(controllable.released).toBe(1);
  });
});
