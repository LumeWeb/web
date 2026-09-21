/**
 * `LoadPipeline` seam: the composition-root orchestration that turns one
 * load's probe head plus its `ByteSource` into a `LoadResult` — best-effort
 * index, selected producer, output MIME, and the domain capability report —
 * by composing the injected seams:
 *
 *   1. `ContainerClassifier` — sniffs the probe head into a `ContainerProfile`;
 *   2. ordered `IndexBuilder[]` registry — best-effort random-access index
 *      (only the sidx builder today; unsupported profiles are skipped);
 *   3. `ProducerFactoryRegistry` — codec check first, then first-match producer,
 *      rejecting unclassifiable/unregisterable containers structurally;
 *   4. `sourceCapabilitiesFor` — domain capability report for `SOURCE_OK`.
 *
 * The seam is generic: it imports no Sia SDK and no MSE internals, and it is
 * pure with respect to its dependencies. Epoch/request scoping and
 * cancellation are the coordinator's concern when it drives `run`; the
 * contract below stays a pure decision.
 */

import type { ContainerClassifier } from '../capabilities/container-classifier.ts';
import type { PlaybackCapabilities } from '../capabilities/browser-capabilities.ts';
import {
  codecDescriptorsFromTracks,
  type Mp4RuntimeProbe,
} from '../container/engine/mp4-runtime-probe.ts';
import type { ContainerProfile, IndexBuilder } from '../container/index/random-access-index.ts';
import { buildFirstIndex } from '../container/index/index-builder.ts';
import type { AppendableProducer } from '../container/producer/appendable-producer.ts';
import { webmCodecsFromHead } from '../container/webm/webm-codecs.ts';
import {
  type ProducerContext,
  ProducerFactoryRegistry,
  type ProducerSelection,
} from '../container/producer/producer-factory.ts';
import { type CodecDescriptor, containerKind, type RandomAccessIndex, type SourceCapabilities } from '../media/legacy-types.ts';
import { mp4CodecsFromInit } from '../mp4-codecs.ts';
import type { ByteSource } from '../transport/byte-source.ts';
import {
  codecDescriptorsFromRfc6381,
  sourceCapabilitiesFor,
  TS_REMUX_CODECS,
} from './source-capabilities.ts';

/** The seam the coordinator / stream controller depend on. */
export interface LoadPipeline {
  run(request: LoadRequest): Promise<LoadResult>;
}

/** Constructor bag for {@link createLoadPipeline}. */
export interface LoadPipelineDeps {
  /** Browser capability snapshot for the MSE/codec checks. */
  readonly capabilities: PlaybackCapabilities;
  /** Container classifier (default sniff core or an injected stub). */
  readonly classifier: ContainerClassifier;
  /**
   * Derives codecs from the probe head; defaults to the MP4-init sniffer and
   * the vouched TS remux set.
   */
  readonly codecsFromHead?: (head: Uint8Array, profile: ContainerProfile) => readonly CodecDescriptor[];
  /** Ordered best-effort index builders. */
  readonly indexBuilders: readonly IndexBuilder[];
  /**
   * Bounded Mediabunny runtime probe for progressive-MP4 loads. When present,
   * the pipeline runs it once for `'mp4'` loads to enrich codecs/duration from
   * the engine's track metadata; absence keeps behavior unchanged, and a probe
   * that cannot resolve (or that degrades) leaves a structured reason instead
   * of failing the load.
   */
  readonly mp4Probe?: Mp4RuntimeProbe;
  /**
   * Producer registry whose `select` reports the winning strategy reason so
   * `LoadResult.reason` stays accurate (`producer:passthrough`,
   * `producer:ts-to-fmp4`, …).
   */
  readonly producerFactory: ProducerFactoryRegistry;
}

/** Everything the pipeline needs to decide one load, independent of the SDK. */
export interface LoadRequest {
  /** Media duration when the transport can vouch for one, else null. */
  readonly durationSeconds?: null | number;
  /**
   * The bounded probe bytes already fetched by the transport layer (the head
   * that reached the classifier). The index builders re-read the object
   * through {@link LoadRequest.source} rather than guessing at head extents.
   */
  readonly head: Uint8Array;
  /**
   * A caller-declared type for the object (e.g. the `type` attribute on a
   * `<source>` tag); producers trust it only when it genuinely describes the
   * append format (MP4-flavoured and codec-qualified).
   */
  readonly inputMime?: string;
  /** The transport the rest of the object is readable through. */
  readonly source: ByteSource;
}

/** One pipeline decision: the producer, its output, and the capability report. */
export interface LoadResult {
  /** Domain capability report (what `SOURCE_OK.info` will carry to the host). */
  readonly capabilities: SourceCapabilities;
  /** Codecs discovered on the object, in track order. */
  readonly codecs: readonly CodecDescriptor[];
  /** Best-effort random-access index, or null when none could be built. */
  readonly index: null | RandomAccessIndex;
  /** MSE-ready MIME the producer will append with. */
  readonly mime: string;
  /**
   * Probe-attached degradation reason for a progressive-MP4 load (e.g. a
   * bounded head the engine could not deep-parse, or a probe that could not
   * resolve), or null when untouched.
   */
  readonly mp4ProbeDegradation: null | string;
  /** The selected producer for this load. */
  readonly producer: AppendableProducer;
  /** Stable producer-selection diagnostic, e.g. `producer:passthrough`. */
  readonly reason: string;
}

/**
 * Builds the load-pipeline seam over the injected classifier, index builders,
 * and producer registry. `run` is pure with respect to its dependencies: no
 * Sia SDK, no MSE, no global capability reads.
 */
export function createLoadPipeline(deps: LoadPipelineDeps): LoadPipeline {
  const {
    capabilities,
    classifier,
    codecsFromHead = defaultCodecsFromHead,
    indexBuilders,
    mp4Probe,
    producerFactory,
  } = deps;

  return {
    async run(request: LoadRequest): Promise<LoadResult> {
      const profile = classifier.classify(request.head);
      const index = await buildFirstIndex(indexBuilders, request.source, profile);
      let codecs = codecsFromHead(request.head, profile);
      let durationSeconds = request.durationSeconds ?? null;
      let mp4ProbeDegradation: null | string = null;

      // Progressive MP4 gets its codecs/duration from the bounded runtime
      // probe (no selection, no feature check: the Mediabunny engine is the
      // only engine). A probe that cannot resolve or that degrades its parse
      // never fails the load — it leaves the structural facts behind and
      // records the reason; only a cancellation propagates.
      if (profile.container === containerKind.mp4 && mp4Probe) {
        try {
          const probe = await mp4Probe(request.source);
          mp4ProbeDegradation = probe.degradation;
          if (probe.tracks.length > 0) codecs = codecDescriptorsFromTracks(probe.tracks);
          if (index === null && probe.durationSeconds !== null) {
            durationSeconds = probe.durationSeconds;
          }
        } catch (error) {
          if (isAbortError(error)) throw error;
          mp4ProbeDegradation = 'mp4-probe-unavailable';
        }
      }

      const context: ProducerContext = {
        capabilities,
        codecs,
        container: profile.container,
        indexAvailable: index !== null,
        inputMime: request.inputMime,
      };
      const selection: ProducerSelection = producerFactory.select(context);
      const mime = selection.producer.outputMime;

      return {
        capabilities: sourceCapabilitiesFor({
          codecs,
          container: profile.container,
          durationSeconds,
          index,
          mime,
          playback: selection.producer.mode,
        }),
        codecs,
        index,
        mime,
        mp4ProbeDegradation,
        producer: selection.producer,
        reason: selection.reason,
      };
    },
  };
}

/**
 * Default codec discovery: fMP4 derives its codecs from the object's own init
 * segment (`moov` sample descriptions), WebM sniffs them from its EBML/WebM
 * head (the Segment's Tracks element), TS objects vouch for the mux.js remux
 * set, and any other container reports no codecs (the producer eligibility
 * check rejects it before codecs matter).
 */
function defaultCodecsFromHead(head: Uint8Array, profile: ContainerProfile): readonly CodecDescriptor[] {
  if (profile.container === containerKind.fmp4) {
    const csv = mp4CodecsFromInit(head);
    return csv ? codecDescriptorsFromRfc6381(csv) : [];
  }
  if (profile.container === containerKind.webm) return webmCodecsFromHead(head);
  if (profile.container === containerKind.ts) return TS_REMUX_CODECS;
  return [];
}

/** AbortErrors express cancellation, not degradation: they propagate as-is. */
function isAbortError(error: unknown): boolean {
  return (
    (typeof DOMException !== 'undefined' && error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  );
}
