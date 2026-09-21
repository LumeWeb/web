/**
 * Behavior spec for the `LoadPipeline` seam: each load verdict comes from the
 * injected media-library `inspect` call, and `run()` forwards the source,
 * capabilities, load generation, and abort signal untouched. The injected
 * fake keeps the seam verifiable without real media bytes or mediabunny.
 */
import { describe, expect, it } from 'vitest';
import type { PlaybackCapabilities } from '../capabilities/browser-capabilities.ts';
import {
  type InspectMediaLibraryOptions,
  type MediaLoadResult,
  type MediaPlayback,
} from '../media/library-load.ts';
import { createLoadPipeline } from '../session/load-pipeline.ts';
import type { ByteSource } from '../transport/byte-source.ts';

/** `inspect`-shaped media-library entry point used to fake each verdict. */
type Inspect = (source: ByteSource, options: InspectMediaLibraryOptions) => Promise<MediaLoadResult>;

function permissiveCapabilities(): PlaybackCapabilities {
  return {
    canConstructWorkerMse: () => false,
    mayDecode: () => ({ decodable: true } as never),
    mseSupported: () => true,
    webCodecsAvailable: () => false,
    workerHandleAvailable: () => false,
  };
}

/** Ready verdict built without a conversion or any bytes. */
function readyVerdict(): MediaLoadResult {
  return {
    container: 'mp4',
    durationSeconds: null,
    mime: 'video/mp4; codecs="avc1.640032,mp4a.40.2"',
    playback: stubPlayback(),
    status: 'ready',
    tracks: [],
  };
}

/** Minimal playback that satisfies the interface without running one. */
function stubPlayback(): MediaPlayback {
  return { dispose: () => undefined, start: () => undefined };
}

/** ByteSource the seam never reads; it only forwards the object to `inspect`. */
function stubSource(): ByteSource {
  return {
    cancel: () => undefined,
    read: () => new ReadableStream(),
    size: 0,
  };
}

describe('load pipeline passes one verdict through', () => {
  it('forwards source, capabilities, load generation, and signal to the injected inspect call', async () => {
    const calls: { options: InspectMediaLibraryOptions; source: ByteSource }[] = [];
    const capabilities = permissiveCapabilities();
    const controller = new AbortController();
    const inspect: Inspect = (source, options) => {
      calls.push({ options, source });
      return Promise.resolve({ status: 'cancelled' });
    };
    const pipeline = createLoadPipeline({ capabilities, inspect });
    const source = stubSource();
    const verdict = await pipeline.run({ loadGeneration: 9, signal: controller.signal, source });

    expect(verdict).toEqual({ status: 'cancelled' });
    expect(calls).toHaveLength(1);
    expect(calls[0].source).toBe(source);
    expect(calls[0].options.capabilities).toBe(capabilities);
    expect(calls[0].options.loadGeneration).toBe(9);
    expect(calls[0].options.signal).toBe(controller.signal);
  });

  it('returns the ready verdict from the injected inspect call unchanged', async () => {
    const fixture = readyVerdict();
    const inspect: Inspect = () => Promise.resolve(fixture);
    const pipeline = createLoadPipeline({ capabilities: permissiveCapabilities(), inspect });
    const verdict = await pipeline.run({ loadGeneration: 1, signal: new AbortController().signal, source: stubSource() });

    expect(verdict).toBe(fixture);
  });

  it('returns the unsupported verdict from the injected inspect call unchanged', async () => {
    const fixture: MediaLoadResult = { reason: 'mime-unsupported', status: 'unsupported' };
    const inspect: Inspect = () => Promise.resolve(fixture);
    const pipeline = createLoadPipeline({ capabilities: permissiveCapabilities(), inspect });
    const verdict = await pipeline.run({ loadGeneration: 2, signal: new AbortController().signal, source: stubSource() });

    expect(verdict).toBe(fixture);
  });

  it('returns the cancelled verdict from the injected inspect call unchanged', async () => {
    const fixture: MediaLoadResult = { status: 'cancelled' };
    const inspect: Inspect = () => Promise.resolve(fixture);
    const pipeline = createLoadPipeline({ capabilities: permissiveCapabilities(), inspect });
    const verdict = await pipeline.run({ loadGeneration: 3, signal: new AbortController().signal, source: stubSource() });

    expect(verdict).toBe(fixture);
  });

  it('propagates a rejected inspect call unchanged', async () => {
    const failure = new Error('pipeline failed');
    const inspect: Inspect = () => Promise.reject(failure);
    const pipeline = createLoadPipeline({ capabilities: permissiveCapabilities(), inspect });

    await expect(pipeline.run({ loadGeneration: 4, signal: new AbortController().signal, source: stubSource() })).rejects.toBe(failure);
  });
});
