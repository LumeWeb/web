import { describe, expect, it } from 'vitest';
import {
  type SiaNativeStream,
  type SiaNativeStreamProvider,
  SiaNativeStreamUnavailableError,
} from '../native-stream-provider.ts';
import {
  ServiceWorkerBackend,
  ServiceWorkerLoadAbortedError,
  ServiceWorkerLoadError,
  type ServiceWorkerStreamTarget,
} from '../service-worker-backend.ts';

interface OpenCall {
  mimeType?: string;
  name?: string;
  signal: AbortSignal;
  src: string;
}

const STREAM_URL = 'https://streams.example/objects/abc123';

function makeProvider(impl: {
  available?: () => Promise<boolean>;
  open?: (src: string, options: { mimeType?: string; name?: string; signal: AbortSignal }) => Promise<SiaNativeStream>;
}): {
  availableCalls: number[];
  openCalls: OpenCall[];
  provider: SiaNativeStreamProvider;
} {
  const availableCalls: number[] = [];
  const openCalls: OpenCall[] = [];
  const provider: SiaNativeStreamProvider = {
    available: (signal) => {
      availableCalls.push(signal ? 1 : 0);
      return (impl.available ?? (() => Promise.resolve(true)))();
    },
    open: (src, options) => {
      openCalls.push({ mimeType: options.mimeType, name: options.name, signal: options.signal, src });
      return (
        impl.open ?? (() => Promise.resolve(makeStream(STREAM_URL, [])))
      )(src, options);
    },
  };
  return { availableCalls, openCalls, provider };
}

function makeStream(url: string, releases: number[]): SiaNativeStream {
  return {
    release: () => {
      releases.push(1);
    },
    url,
  };
}

function makeTarget(): ServiceWorkerStreamTarget {
  return { src: '' };
}

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('ServiceWorkerBackend', () => {
  it('rejects the load without calling open when the provider is unavailable', async () => {
    const { availableCalls, openCalls, provider } = makeProvider({ available: () => Promise.resolve(false) });
    const target = makeTarget();
    const backend = new ServiceWorkerBackend(provider);
    backend.attach(target);

    await expect(
      backend.load('abc123', { mimeType: 'video/mp4', name: 'clip.mp4' }),
    ).rejects.toBeInstanceOf(SiaNativeStreamUnavailableError);

    expect(availableCalls).toEqual([1]);
    expect(openCalls).toHaveLength(0);
    expect(target.src).toBe('');
  });

  it('opens with the load signal and requested MIME and name, and attaches the provider URL', async () => {
    const { openCalls, provider } = makeProvider({
      open: (_src, _options) => {
        const releases: number[] = [];
        return Promise.resolve(makeStream(STREAM_URL, releases));
      },
    });
    const attached: string[] = [];
    const target = makeTarget();
    const backend = new ServiceWorkerBackend(provider, {
      onSourceAttached: (url) => {
        attached.push(url);
      },
    });
    backend.attach(target);

    await backend.load('abc123', { mimeType: 'video/mp4', name: 'clip.mp4' });

    const [call] = openCalls;
    expect(openCalls).toHaveLength(1);
    expect(call).toMatchObject({ mimeType: 'video/mp4', name: 'clip.mp4', src: 'abc123' });
    expect(call.signal).toBeInstanceOf(AbortSignal);
    expect(target.src).toBe(STREAM_URL);
    expect(attached).toEqual([STREAM_URL]);
  });

  it('releases the acquired stream exactly once on detach', async () => {
    const releases: number[] = [];
    const { provider } = makeProvider({
      open: () => Promise.resolve(makeStream(STREAM_URL, releases)),
    });
    const target = makeTarget();
    const backend = new ServiceWorkerBackend(provider);
    backend.attach(target);

    await backend.load('abc123');
    backend.detach();
    backend.detach();

    expect(releases).toHaveLength(1);
    expect(target.src).toBe('');
  });

  it('releases the acquired stream exactly once on destroy', async () => {
    const releases: number[] = [];
    const { provider } = makeProvider({
      open: () => Promise.resolve(makeStream(STREAM_URL, releases)),
    });
    const target = makeTarget();
    const backend = new ServiceWorkerBackend(provider);
    backend.attach(target);

    await backend.load('abc123');
    backend.destroy();
    backend.destroy();

    expect(releases).toHaveLength(1);
    expect(target.src).toBe('');
  });

  it('releases the replaced stream exactly once and keeps the new load current', async () => {
    const releases: number[] = [];
    let opens = 0;
    const { provider } = makeProvider({
      open: () => {
        opens += 1;
        return Promise.resolve(makeStream(`https://streams.example/objects/${opens}`, releases));
      },
    });
    const target = makeTarget();
    const backend = new ServiceWorkerBackend(provider);
    backend.attach(target);

    await backend.load('a');
    expect(target.src).toBe('https://streams.example/objects/1');
    await backend.load('b');

    expect(releases).toHaveLength(1);
    expect(target.src).toBe('https://streams.example/objects/2');
    backend.destroy();
    expect(releases).toHaveLength(2);
  });

  it('aborts the pending open on destroy and releases a late result without attaching', async () => {
    const openSignalRef: { signal: AbortSignal | null } = { signal: null };
    let resolveOpen: (stream: SiaNativeStream) => void = () => undefined;
    const openPending = new Promise<SiaNativeStream>((resolve) => {
      resolveOpen = resolve;
    });
    const { provider } = makeProvider({
      open: (_src, options) => {
        openSignalRef.signal = options.signal;
        return openPending;
      },
    });
    const releases: number[] = [];
    const target = makeTarget();
    const backend = new ServiceWorkerBackend(provider);
    backend.attach(target);

    const failing = backend.load('abc123').then(
      () => null,
      (err: unknown) => err,
    );
    await tick();
    backend.destroy();

    expect(openSignalRef.signal?.aborted).toBe(true);
    resolveOpen(makeStream(STREAM_URL, releases));
    const err = await failing;

    expect(err).toBeInstanceOf(ServiceWorkerLoadAbortedError);
    expect(target.src).toBe('');
    expect(releases).toHaveLength(1);
  });

  it('releases a stale open result without attaching when the load is replaced', async () => {
    let firstResolve: (stream: SiaNativeStream) => void = () => undefined;
    let secondResolve: (stream: SiaNativeStream) => void = () => undefined;
    const firstOpen = new Promise<SiaNativeStream>((resolve) => {
      firstResolve = resolve;
    });
    const secondOpen = new Promise<SiaNativeStream>((resolve) => {
      secondResolve = resolve;
    });
    let opens = 0;
    const { provider } = makeProvider({
      open: () => {
        opens += 1;
        return opens === 1 ? firstOpen : secondOpen;
      },
    });
    const firstReleases: number[] = [];
    const secondReleases: number[] = [];
    const target = makeTarget();
    const backend = new ServiceWorkerBackend(provider);
    backend.attach(target);

    const firstLoad = backend.load('a');
    await tick();
    const secondLoad = backend.load('b');
    await tick();

    firstResolve(makeStream('https://streams.example/objects/1', firstReleases));
    secondResolve(makeStream('https://streams.example/objects/2', secondReleases));

    const firstErr = await firstLoad.then(
      () => null,
      (err: unknown) => err,
    );

    expect(firstErr).toBeInstanceOf(ServiceWorkerLoadAbortedError);
    expect(firstReleases).toHaveLength(1);
    expect(secondReleases).toHaveLength(0);
    await expect(secondLoad).resolves.toBeUndefined();
    expect(target.src).toBe('https://streams.example/objects/2');
  });

  it('wraps provider failures so no backend-generated message carries the locator', async () => {
    const locator =
      'https://idx.example.com/objects/deadbeef00000000000000000000000000000000000000000000000000000000' +
      '/shared?sig=signed#encryption_key=topsecret';
    const { provider } = makeProvider({
      open: (src) => Promise.reject(new Error(`cannot stream ${src}`)),
    });
    const target = makeTarget();
    const backend = new ServiceWorkerBackend(provider);
    backend.attach(target);

    const err = (await backend.load(locator).then(
      () => null,
      (failure: unknown) => failure,
    )) as Error;

    expect(err).toBeInstanceOf(ServiceWorkerLoadError);
    expect(err).not.toBeInstanceOf(SiaNativeStreamUnavailableError);
    expect(err.message).not.toContain(locator);
    expect(err.message).not.toContain('encryption_key');
    expect(err.message).not.toContain('topsecret');
    expect(err.cause).toBeInstanceOf(Error);
    expect(target.src).toBe('');
  });

  it('rejects a load with no attached element without calling the provider', async () => {
    const { availableCalls, openCalls, provider } = makeProvider({});
    const backend = new ServiceWorkerBackend(provider);

    await expect(backend.load('abc123')).rejects.toThrow('no media element is attached');

    expect(availableCalls).toHaveLength(0);
    expect(openCalls).toHaveLength(0);
  });

  it('refuses new loads after destroy without calling the provider', async () => {
    const { availableCalls, openCalls, provider } = makeProvider({});
    const target = makeTarget();
    const backend = new ServiceWorkerBackend(provider);
    backend.attach(target);
    backend.destroy();

    await expect(backend.load('abc123')).rejects.toBeInstanceOf(ServiceWorkerLoadAbortedError);

    expect(availableCalls).toHaveLength(0);
    expect(openCalls).toHaveLength(0);
  });
});
