import { describe, expect, it } from 'vitest';
import type { PlaybackCapabilities } from '../capabilities/browser-capabilities.ts';
import { inspectMediaLibrary, type ReadyMediaLoad } from '../media/library-load.ts';
import type { AppendSink, AppendUnit } from '../sink/append-sink.ts';
import { MemoryByteSource } from '../transport/memory-byte-source.ts';
import { mediabunnyMp4FixtureBytes } from './fixtures/mediabunny-mp4-fixture.ts';
import { audioOnlyMp4FixtureBytes } from './fixtures/audio-only-mp4-fixture.ts';
import { videoOnlyMp4FixtureBytes } from './fixtures/video-only-mp4-fixture.ts';

const capabilities: PlaybackCapabilities = {
  canConstructWorkerMse: () => false,
  mayDecode: () => ({ decodable: true } as never),
  mseImpl: () => ({ canConstructInDedicatedWorker: false, impl: 'standard', managed: false }),
  mseSupported: () => true,
  webCodecsAvailable: () => false,
  workerHandleAvailable: () => false,
};

class Sink implements AppendSink {
  readonly units: AppendUnit[] = [];
  endOfStreamCalls = 0;
  abort(): void { this.units.length = 0; }
  append(unit: AppendUnit): void { this.units.push(unit); }
  evictBackBuffer(): Promise<boolean> { return Promise.resolve(false); }
  requestEndOfStream(): void { this.endOfStreamCalls += 1; }
  resetParser(): void { this.units.length = 0; }
}

async function waitFor(predicate: () => boolean): Promise<void> {
  for (let i = 0; i < 100 && !predicate(); i += 1) await new Promise((resolve) => setTimeout(resolve, 10));
  expect(predicate()).toBe(true);
}

describe('library playback track selection', () => {
  it('loads and plays a valid video-only MP4 without fabricating audio', async () => {
    const result = await inspectMediaLibrary(new MemoryByteSource(videoOnlyMp4FixtureBytes()), { capabilities });
    expect(result).toMatchObject({ status: 'ready' });
    const load = result as ReadyMediaLoad;
    expect(load.mime).toBe('video/mp4; codecs="avc1.640032"');
    expect(load.tracks).toEqual([{ codec: 'avc1.640032', kind: 'video' }]);
    const sink = new Sink();
    load.playback.start(sink, 1, { onComplete: () => undefined, onError: (error) => { throw error; } });
    await waitFor(() => sink.units.some((unit) => unit.kind === 'media'));
    load.playback.dispose();
  });

  it('preserves the audio+video conversion contract', async () => {
    const result = await inspectMediaLibrary(new MemoryByteSource(mediabunnyMp4FixtureBytes()), { capabilities });
    expect(result.status).toBe('ready');
    expect((result as ReadyMediaLoad).tracks.map((track) => track.kind)).toEqual(['video', 'audio']);
  });

  it('intentionally rejects audio-only input as no video track', async () => {
    const result = await inspectMediaLibrary(new MemoryByteSource(audioOnlyMp4FixtureBytes()), { capabilities });
    expect(result.status).toBe('unsupported');
    expect((result as { reason: string }).reason).toBe('video-track-missing');
  });
});
