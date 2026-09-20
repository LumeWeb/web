/**
 * TDD contract for the `LoadPipeline` seam: the composition-root orchestration
 * that turns one load's probe head + `ByteSource` into a `LoadResult` (index +
 * producer + mode + capability report) by composing the injected seams —
 * `ContainerClassifier`, the ordered `IndexBuilder[]` registry, and the
 * `ProducerFactoryRegistry`.
 *
 * The seam is generic: it imports no Sia SDK and no MSE internals. The tests
 * pin the contract: classify → best-effort index → codec check + producer
 * selection → domain capability report.
 */

import { describe, expect, it } from 'vitest';
import { capabilityVerdict, type CapabilityVerdict, type CodecId } from '../capabilities/codec-verdict.ts';
import { createContainerClassifier } from '../capabilities/container-classifier.ts';
import type { PlaybackCapabilities } from '../capabilities/browser-capabilities.ts';
import { createIndexBuilderRegistry } from '../container/index/index-builder.ts';
import { SidxIndex } from '../container/index/sidx-index.ts';
import type { Mp4RuntimeProbe, Mp4RuntimeProbeResult } from '../container/engine/mp4-runtime-probe.ts';
import type { AppendableProducer, ProducedSegment } from '../container/producer/appendable-producer.ts';
import {
  PassthroughProducerStrategy,
  type ProducerContext,
  ProducerFactoryRegistry,
  producerId,
  type ProducerRejection,
  type ProducerSelection,
  type ProducerStrategy,
  ProducerUnavailableError,
  producerVerdict,
  TsToFmp4ProducerStrategy,
} from '../container/producer/producer-factory.ts';
import { type CodecDescriptor, containerKind, indexGranularity, mediaKind, producerMode, type ProducerMode } from '../media/types.ts';
import { DEFAULT_FMP4_MIME } from '../protocol.ts';
import type { LoadPipeline, LoadRequest } from '../session/load-pipeline.ts';
import { createLoadPipeline } from '../session/load-pipeline.ts';
import { TS_REMUX_CODECS } from '../session/source-capabilities.ts';
import { MemoryByteSource } from '../transport/memory-byte-source.ts';

interface CapabilityOverrides {
  mayDecode?: (codec: CodecId) => CapabilityVerdict;
  mseSupported?: (mime: string) => boolean;
}

/** Deterministic capability stub: MSE accepts everything unless overridden. */
function capabilities(overrides: CapabilityOverrides = {}): PlaybackCapabilities {
  return {
    canConstructWorkerMse: () => false,
    mayDecode: overrides.mayDecode ?? (() => capabilityVerdict['unknown-codec']),
    mseSupported: overrides.mseSupported ?? (() => true),
    webCodecsAvailable: () => false,
    workerHandleAvailable: () => false,
  };
}

/** The default ladder: passthrough before TS remux. */
function defaultPipeline(overrides: CapabilityOverrides = {}): LoadPipeline {
  return createLoadPipeline({
    capabilities: capabilities(overrides),
    classifier: createContainerClassifier(),
    indexBuilders: createIndexBuilderRegistry(),
    producerFactory: new ProducerFactoryRegistry([
      new PassthroughProducerStrategy(),
      new TsToFmp4ProducerStrategy(),
    ]),
  });
}

function run(pipeline: LoadPipeline, head: Uint8Array): ReturnType<LoadPipeline['run']> {
  const request: LoadRequest = { head, source: new MemoryByteSource(head) };
  return pipeline.run(request);
}

describe('LoadPipeline', () => {
  it('classifies, indexes, and selects passthrough for indexed fMP4', async () => {
    const result = await run(defaultPipeline(), indexedFmp4Head());
    expect(result.capabilities.container).toBe(containerKind.fmp4);
    expect(result.capabilities.durationSeconds).toBe(10);
    expect(result.capabilities.indexGranularity).toBe(indexGranularity['exact-byte']);
    expect(result.capabilities.playbackMode).toBe(producerMode.passthrough);
    expect(result.mime).toBe('video/mp4');
    expect(result.producer.mode).toBe(producerMode.passthrough);
    expect(result.reason).toBe(`producer:${producerId.passthrough}`);
    expect(result.index?.granularity).toBe(indexGranularity['exact-byte']);
    expect(result.index).toBeInstanceOf(SidxIndex);
  });

  it('keeps a caller-declared codec-qualified MP4 MIME on passthrough fMP4', async () => {
    const pipeline = defaultPipeline();
    const request: LoadRequest = {
      head: indexedFmp4Head(),
      inputMime: 'video/mp4; codecs="avc1.64001f"',
      source: new MemoryByteSource(indexedFmp4Head()),
    };
    const result = await pipeline.run(request);
    expect(result.mime).toBe('video/mp4; codecs="avc1.64001f"');
    expect(result.producer.mode).toBe(producerMode.passthrough);
  });

  it('selects the TS remux and reports normalized/throughput honestly', async () => {
    const result = await run(defaultPipeline(), tsHead());
    expect(result.capabilities.container).toBe(containerKind.ts);
    expect(result.capabilities.playbackMode).toBe(producerMode.normalized);
    expect(result.capabilities.indexGranularity).toBe(indexGranularity.throughput);
    expect(result.mime).toBe(DEFAULT_FMP4_MIME);
    expect(result.producer.mode).toBe(producerMode.normalized);
    expect(result.reason).toBe(`producer:${producerId.tsToFmp4}`);
    expect(result.index).toBeNull();
    expect(result.capabilities.codecs).toEqual(TS_REMUX_CODECS);
  });

  it('rejects an unclassifiable container with a structured container rejection', async () => {
    await expect(run(defaultPipeline(), unknownHead())).rejects.toMatchObject({
      name: ProducerUnavailableError.name,
      verdict: producerVerdict.container,
    });
  });

  it('lets the codec check run before producer selection', async () => {
    const undecodable = capabilities({ mayDecode: (codec) => (codec === 'hvc1.1.6.L120.90' ? capabilityVerdict['not-decodable'] : capabilityVerdict['unknown-codec']) });
    const pipeline = createLoadPipeline({
      capabilities: undecodable,
      classifier: createContainerClassifier(),
      // The injected codec discovery reports HEVC for a (fake) fMP4 object.
      codecsFromHead: (_head, profile) => {
        const codecs: CodecDescriptor[] = profile.container === containerKind.fmp4
          ? [{ codec: 'hvc1.1.6.L120.90', kind: mediaKind.video, mimeCodec: 'hvc1.1.6.L120.90' }]
          : [];
        return codecs;
      },
      indexBuilders: createIndexBuilderRegistry(),
      producerFactory: new ProducerFactoryRegistry([new PassthroughProducerStrategy()]),
    });
    await expect(run(pipeline, indexedFmp4Head())).rejects.toMatchObject({ verdict: producerVerdict.codec });
  });
});

describe('progressive MP4 mediabunny probe wiring', () => {
  /**
   * Serves progressive MP4 so the probe-enriched `LoadResult` is observable.
   * A fixed-mode stand-in for the mediabunny producer (which loads asynchronously);
   * it completes the pipeline decision without engaging the real engine.
   */
  class Mp4StubProducer implements AppendableProducer {
    readonly mode: ProducerMode = producerMode.normalized;
    readonly outputMime = 'video/mp4';
    flush(_epoch: number): void {
      // The stub never buffers; nothing to drain.
    }
    onError(_listener: (error: unknown) => void): () => void {
      return () => undefined;
    }
    onSegment(_listener: (segment: ProducedSegment) => void): () => void {
      return () => undefined;
    }
    push(_bytes: Uint8Array, _absoluteOffset: number, _epoch: number): void {
      // The stub emits no segments; the pipeline only reads its identity.
    }
    reportError(_error: unknown): void {
      // The stub never reports a producer-side error.
    }
    reset(_epoch: number): void {
      // The stub keeps no cross-segment state.
    }
  }

  class Mp4StubStrategy implements ProducerStrategy {
    readonly id = 'mp4-stub';
    readonly mode: ProducerMode = producerMode.normalized;

    select(context: ProducerContext): ProducerRejection | ProducerSelection {
      if (context.container !== containerKind.mp4) {
        return { detail: `container:${context.container}`, verdict: producerVerdict.container };
      }
      return { producer: new Mp4StubProducer(), reason: 'producer:mp4-stub' };
    }
  }

  const probeResult = (overrides: Partial<Mp4RuntimeProbeResult> = {}): Mp4RuntimeProbeResult => ({
    container: containerKind.mp4,
    degradation: null,
    durationSeconds: null,
    tracks: [],
    ...overrides,
  });

  /** Records every invocation so tests assert when (and whether) the probe runs. */
  function recordingProbe(results: Mp4RuntimeProbeResult): Mp4RuntimeProbe & { runs: number } {
    const probe = (() => {
      probe.runs += 1;
      return Promise.resolve(results);
    }) as unknown as Mp4RuntimeProbe & { runs: number };
    probe.runs = 0;
    return probe;
  }

  function stubMp4Pipeline(probe: Mp4RuntimeProbe | undefined): LoadPipeline {
    return createLoadPipeline({
      capabilities: capabilities(),
      classifier: createContainerClassifier(),
      indexBuilders: createIndexBuilderRegistry(),
      mp4Probe: probe,
      producerFactory: new ProducerFactoryRegistry([new Mp4StubStrategy()]),
    });
  }

  it('runs the mediabunny probe once for progressive mp4 and enriches codecs + duration', async () => {
    const probe = recordingProbe(
      probeResult({
        durationSeconds: 120,
        tracks: [
          { codec: 'avc1.640032', kind: mediaKind.video, timescale: 1000, trackId: 1 },
          { codec: 'mp4a.40.2', kind: mediaKind.audio, timescale: 44100, trackId: 2 },
        ],
      }),
    );
    const result = await run(stubMp4Pipeline(probe), progressiveMp4Head());

    expect(probe.runs).toBe(1);
    expect(result.reason).toBe('producer:mp4-stub');
    expect(result.capabilities.codecs.map((c) => c.mimeCodec)).toEqual(['avc1.640032', 'mp4a.40.2']);
    expect(result.capabilities.durationSeconds).toBe(120);
    expect(result.mp4ProbeDegradation).toBeNull();
  });

  it('does not run the probe for non-MP4 containers', async () => {
    const probe = recordingProbe(probeResult());
    const pipeline = stubMp4Pipeline(probe);

    // The stub only serves 'mp4'; the rejections still prove the probe never ran.
    await expect(run(pipeline, indexedFmp4Head())).rejects.toMatchObject({ name: ProducerUnavailableError.name });
    await expect(run(pipeline, tsHead())).rejects.toMatchObject({ name: ProducerUnavailableError.name });

    expect(probe.runs).toBe(0);
  });

  it('carries a bounded-probe degradation on the load result without failing it', async () => {
    const probe = recordingProbe(
      probeResult({
        degradation: 'mediabunny: head not mp4-readable',
        tracks: [],
      }),
    );
    const result = await run(stubMp4Pipeline(probe), progressiveMp4Head());

    expect(result.mp4ProbeDegradation).toBe('mediabunny: head not mp4-readable');
    // A degraded probe leaves the structural codecs behind; the load still decides.
    expect(result.capabilities.codecs).toEqual([]);
  });

  it('degrades a failing probe into a structured reason, never a crash', async () => {
    const probe = (async () => Promise.reject(new Error('engine failed'))) as Mp4RuntimeProbe;
    const result = await run(stubMp4Pipeline(probe), progressiveMp4Head());

    expect(result.mp4ProbeDegradation).toBe('mp4-probe-unavailable');
    expect(result.capabilities.codecs).toEqual([]);
  });

  it('propagates a probe cancellation (AbortError) instead of degrading', async () => {
    const probe = (() => Promise.reject(new DOMException('cancelled', 'AbortError'))) as Mp4RuntimeProbe;
    await expect(run(stubMp4Pipeline(probe), progressiveMp4Head())).rejects.toMatchObject({
      name: 'AbortError',
    });
  });

  it('leaves progressive-mp4 behavior unchanged when no probe is configured', async () => {
    const result = await run(stubMp4Pipeline(undefined), progressiveMp4Head());
    expect(result.mp4ProbeDegradation).toBeNull();
    expect(result.capabilities.codecs).toEqual([]);
    expect(result.reason).toBe('producer:mp4-stub');
  });
});

// ---- fixtures ----------------------------------------------------------------

function box(type: string, body: number[]): number[] {
  const size = body.length + 8;
  return [(size >>> 24) & 255, (size >>> 16) & 255, (size >>> 8) & 255, size & 255, ...type.split('').map((c) => c.charCodeAt(0)), ...body];
}

/** ftyp+moov+sidx+moof: classifies fMP4 and parses as an exact-byte index. */
function indexedFmp4Head(): Uint8Array {
  const mvhd = box('mvhd', [0, 0, 0, 0, ...u32(0), ...u32(0), ...u32(1000), ...u32(10_000)]);
  const moov = box('moov', mvhd);
  const ftyp = box('ftyp', [105, 115, 111, 109]);
  const sidx = box('sidx', [
    0, 0, 0, 0, ...u32(1), ...u32(1000), ...u32(0), ...u32(0),
    0, 0, 0, 2,
    ...u32(100), ...u32(5000), 0x80, 0, 0, 0,
    ...u32(120), ...u32(5000), 0x80, 0, 0, 0,
  ]);
  const moof = box('moof', []);
  return new Uint8Array([...ftyp, ...moov, ...sidx, ...moof, ...Array<number>(64).fill(0)]);
}

/** ftyp + moov(mvhd) with no mdat: the classifier reads a progressive 'mp4'. */
function progressiveMp4Head(): Uint8Array {
  const mvhd = box('mvhd', [0, 0, 0, 0, ...u32(0), ...u32(0), ...u32(1000), ...u32(120_000)]);
  const ftyp = box('ftyp', [105, 115, 111, 109]);
  return new Uint8Array([...ftyp, ...box('moov', mvhd)]);
}

/** 3 MPEG-TS transport packets with 0x47 sync bytes. */
function tsHead(): Uint8Array {
  return new Uint8Array(3 * 188).map((_, i) => (i % 188 === 0 ? 0x47 : i % 251));
}

function u32(value: number): number[] {
  return [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
}

function unknownHead(): Uint8Array {
  return new Uint8Array(512).map((_, i) => i % 251);
}
