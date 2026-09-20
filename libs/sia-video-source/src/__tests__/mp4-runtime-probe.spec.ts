/**
 * TDD contract for the bounded runtime MP4 probe (`probeProgressiveMp4`) and
 * its Mediabunny engine (`analyzeMp4Head`): from a `ByteSource`, the probe
 * reads at most `headBytes` in one clamped request, sniffs the container, and
 * for MP4-family heads runs the engine to map track/duration facts onto the
 * neutral vocabulary.
 *
 * Node-unit concerns only: bounded ByteSource reads (a tracking source asserts
 * the probe never asks for more than `headBytes` and never pages around the
 * object), real-moov track/duration extraction (the embedded deterministic
 * fixture), and safe degradation (a truncated or unclassifiable head, or a
 * failed deep parse, settles with empty facts — never a raw crash; only a
 * cancellation propagates).
 *
 * MSE/browser decode behavior is deliberately out of scope: this probe reports
 * metadata, it does not append to MSE.
 */
import { describe, expect, it } from 'vitest';
import type { ByteRange, ByteSource, ReadOptions } from '../transport/byte-source.ts';
import { MemoryByteSource } from '../transport/memory-byte-source.ts';
import {
  codecDescriptorsFromTracks,
  type Mp4RuntimeProbeResult,
  probeProgressiveMp4,
} from '../container/engine/mp4-runtime-probe.ts';
import { analyzeMp4Head, mediaTrackId } from '../container/engine/mediabunny-engine.ts';
import {
  MEDIABUNNY_MP4_SHA256,
  mediabunnyMp4FixtureBytes,
} from './fixtures/mediabunny-mp4-fixture.ts';

const IN_NODE = typeof document === 'undefined';

/** Lazy node builtins: only resolved from node-only test bodies. */
const loadNode = () =>
  Promise.all([import('node:crypto'), import('node:path'), import('node:url')]).then(
    ([crypto, path, url]) => ({ crypto, path, url }),
  );

/** Wraps a byte buffer and records every ranged-read request the probe makes. */
class TrackingByteSource implements ByteSource {
  readonly reads: { length: number; offset: number }[] = [];

  get size(): number {
    return this.#source.size;
  }

  readonly #source: MemoryByteSource;

  constructor(bytes: Uint8Array) {
    this.#source = new MemoryByteSource(bytes);
  }

  cancel(reason?: unknown): void {
    this.#source.cancel(reason);
  }

  read(range: ByteRange, options: ReadOptions): ReadableStream<Uint8Array> {
    this.reads.push({ length: range.length, offset: range.offset });
    return this.#source.read(range, options);
  }
}

/** 3 MPEG-TS transport packets with 0x47 sync bytes (probe-safe non-MP4 head). */
function tsHead(): Uint8Array {
  return new Uint8Array(3 * 188).map((_, i) => (i % 188 === 0 ? 0x47 : i % 251));
}

describe.runIf(IN_NODE)('Mediabunny MP4 engine (node)', () => {
  it('embedded fixture decodes to the pinned sha256 (determinism lock)', async () => {
    const { crypto } = await loadNode();
    const digest = crypto.createHash('sha256').update(mediabunnyMp4FixtureBytes()).digest('hex');
    expect(digest).toBe(MEDIABUNNY_MP4_SHA256);
  });

  it('deep-parses the real-moov fixture with codec-level tracks and a metadata duration', async () => {
    const parsed = await analyzeMp4Head(mediabunnyMp4FixtureBytes());
    expect(parsed).not.toBeNull();
    expect(parsed?.durationSeconds).toBe(120);
    expect(parsed?.tracks.map((t) => [t.kind, t.codec])).toEqual([
      ['video', 'avc1.640032'],
      ['audio', 'mp4a.40.2'],
    ]);
    // Mediabunny reports the fixture's real timescales; degenerate 0 track ids
    // normalize to stable 1-based ordinals.
    const video = parsed?.tracks.find((t) => t.kind === 'video');
    expect(video?.trackId).toBe(1);
    expect(video?.timescale).toBe(1000);
    expect(parsed?.tracks.find((t) => t.kind === 'audio')?.trackId).toBe(2);
  });

  it('degrades to null for a head the engine cannot read, never throws', async () => {
    expect(await analyzeMp4Head(new Uint8Array(512))).toBeNull();
    expect(await analyzeMp4Head(new Uint8Array(0))).toBeNull();
  });

  it('normalizes non-positive reported track ids to stable positive ordinals', () => {
    expect(mediaTrackId(0, 1)).toBe(1);
    expect(mediaTrackId(-1, 2)).toBe(2);
    expect(mediaTrackId(7, 3)).toBe(7);
  });
});

describe.runIf(IN_NODE)('bounded runtime MP4 probe (node)', () => {
  it('probes the real-moov fixture with tracks + duration', async () => {
    const bytes = mediabunnyMp4FixtureBytes();
    const result: Mp4RuntimeProbeResult = await probeProgressiveMp4(new MemoryByteSource(bytes));

    expect(result.container).toBe('mp4');
    expect(result.degradation).toBeNull();
    expect(result.durationSeconds).toBe(120);
    expect(result.tracks.map((t) => [t.kind, t.codec])).toEqual([
      ['video', 'avc1.640032'],
      ['audio', 'mp4a.40.2'],
    ]);
  });

  it('reads only a bounded head: one clamped request at offset 0, never more than headBytes', async () => {
    const bytes = mediabunnyMp4FixtureBytes();
    const source = new TrackingByteSource(bytes);
    const headBytes = 64 * 1024;

    await probeProgressiveMp4(source, { headBytes });

    expect(source.reads.length).toBe(1);
    expect(source.reads[0]).toEqual({ length: headBytes, offset: 0 });
    expect(source.reads[0].length).toBeLessThanOrEqual(headBytes);
  });

  it('clamps to a smaller head window and settles structually, never throws', async () => {
    const bytes = mediabunnyMp4FixtureBytes();
    const source = new TrackingByteSource(bytes);
    // A head smaller than the fixture's moov (which starts at byte 32 and runs
    // 1068 bytes) cuts the walk mid-moov. A truncated moov still keeps the
    // progressive-MP4 verdict (large files routinely carry multi-KiB moov
    // boxes), so the probe reports `mp4` with empty facts and no throw.
    const result = await probeProgressiveMp4(source, { headBytes: 1024 });

    expect(source.reads[0]?.length).toBe(1024);
    expect(result.container).toBe('mp4');
    expect(result.tracks).toEqual([]);
    expect(result.degradation).toBeNull();
  });

  it('settles a non-MP4 head structually without running the engine', async () => {
    const result = await probeProgressiveMp4(new MemoryByteSource(tsHead()));
    expect(result.container).toBe('ts');
    expect(result.tracks).toEqual([]);
    expect(result.degradation).toBeNull();
    expect(result.durationSeconds).toBeNull();
  });

  it('reports a degraded deep parse on a load result without failing it', async () => {
    const bytes = mediabunnyMp4FixtureBytes();
    // A configured engine that cannot deep-parse settles as a structural
    // result with an explicit degradation reason — the probe never throws for it.
    const result = await probeProgressiveMp4(
      new MemoryByteSource(bytes),
      {},
      () => Promise.resolve(null),
    );

    expect(result.container).toBe('mp4');
    expect(result.tracks).toEqual([]);
    expect(result.degradation).not.toBeNull();
    expect(result.durationSeconds).toBeNull();
  });

  it('maps engine tracks onto the codec descriptors the pipeline consumes', () => {
    expect(
      codecDescriptorsFromTracks([
        { codec: 'avc1.640032', kind: 'video', timescale: 1000, trackId: 1 },
        { codec: 'mp4a.40.2', kind: 'audio', timescale: 44100, trackId: 2 },
      ]),
    ).toEqual([
      { codec: 'avc1.640032', kind: 'video', mimeCodec: 'avc1.640032' },
      { codec: 'mp4a.40.2', kind: 'audio', mimeCodec: 'mp4a.40.2' },
    ]);
  });

  it('propagates a pre-cancelled signal as AbortError (deterministic, never a hang)', async () => {
    const controller = new AbortController();
    controller.abort(new DOMException('cancelled', 'AbortError'));
    await expect(
      probeProgressiveMp4(new MemoryByteSource(mediabunnyMp4FixtureBytes()), {
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});
