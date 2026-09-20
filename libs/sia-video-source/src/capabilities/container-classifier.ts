/**
 * Container classifier: wraps the `container-probe.ts` sniff core and extends
 * its `ContainerKind` verdict into the full load-pipeline `ContainerProfile`
 * (mseAppendable, ordered indexSources, producerMode, producerFamily) that the
 * index-builder registry and the load pipeline key on.
 *
 * This module is classification only. It constructs no producers, performs no
 * normalization, and never imports the Sia SDK or MSE. The profile it returns
 * is the container-level route; finer per-source decisions — whether a
 * top-level `sidx` actually exists, which codecs the object carries, which
 * browser is asking — stay with the index builders and load pipeline.
 */

import { sniffContainer } from '../container-probe.ts';
import { type ContainerProfile, indexSourceKind, producerFamily, type ProducerFamily } from '../container/index/random-access-index.ts';
import { containerKind, type ContainerKind, producerMode } from '../media/types.ts';

/**
 * Injectable classification seam: unit tests override the verdict without
 * touching the sniff core or network.
 */
export interface ContainerClassifier {
  classify(bytes: Uint8Array): ContainerProfile;
}

/** The injected sniff core a classifier uses; defaults to `sniffContainer`. */
export type ContainerSniff = (bytes: Uint8Array) => ContainerKind;

/**
 * Maps a container kind to its profile. The table is the single source of
 * truth for container-level capability facts; later steps may refine
 * per-container rows (e.g. split fMP4-with/without `sidx`) at the load
 * pipeline without changing this container-level verdict.
 */
const PROFILE_BY_CONTAINER: Readonly<Record<ContainerKind, ContainerProfile>> = {
  [containerKind.fmp4]: frozenProfile({
    container: containerKind.fmp4,
    indexSources: [indexSourceKind.sidx, indexSourceKind['moof-walk']], // sidx when present; MoofWalkIndex fallback
    mseAppendable: true, // top-level moof/mdat append as-is where MP4 is supported
    producerFamily: producerFamily.passthrough,
    producerMode: producerMode.passthrough,
  }),
  [containerKind.mkv]: frozenProfile({
    container: containerKind.mkv,
    indexSources: [indexSourceKind.cues],
    mseAppendable: false,
    producerFamily: producerFamily['mkv-to-webm'],
    producerMode: producerMode.repatch,
  }),
  [containerKind.mp4]: frozenProfile({
    container: containerKind.mp4, // progressive MP4/MOV: media inside moov/mdat, not fragmented
    indexSources: [indexSourceKind.stbl],
    mseAppendable: false,
    producerFamily: producerFamily['progressive-mp4'],
    producerMode: producerMode.normalized,
  }),
  [containerKind.ts]: frozenProfile({
    container: containerKind.ts,
    indexSources: [indexSourceKind['ts-rap']],
    mseAppendable: false, // TS never appends as-is to MSE in Chrome/Firefox
    producerFamily: producerFamily['ts-to-fmp4'],
    producerMode: producerMode.normalized,
  }),
  [containerKind.unknown]: frozenProfile({
    container: containerKind.unknown,
    indexSources: [], // nothing can be indexed before the container is identified
    mseAppendable: false,
    producerFamily: producerFamily.reject,
    producerMode: producerMode.degraded, // no authoritative route; the pipeline rejects before a producer
  }),
  [containerKind.webm]: frozenProfile({
    container: containerKind.webm,
    indexSources: [indexSourceKind.cues],
    mseAppendable: true, // WebM appends as-is in browsers whose MSE supports its codecs
    producerFamily: producerFamily['webm-native'],
    producerMode: producerMode.native,
  }),
};

/** Sniffs bytes and returns the full profile for the verdict. */
export function classifyContainer(bytes: Uint8Array): ContainerProfile {
  return containerProfileFor(sniffContainer(bytes));
}

/** Pure kind → profile lookup; the load pipeline snapshots one of these per load. */
export function containerProfileFor(container: ContainerKind): ContainerProfile {
  return PROFILE_BY_CONTAINER[container] ?? PROFILE_BY_CONTAINER[containerKind.unknown];
}

/**
 * Builds an injectable classifier over a sniff function (defaults to the real
 * `sniffContainer` core). Composition roots pass the default; tests inject a
 * stub verdict.
 */
export function createContainerClassifier(sniff: ContainerSniff = sniffContainer): ContainerClassifier {
  return {
    classify(bytes: Uint8Array): ContainerProfile {
      return containerProfileFor(sniff(bytes));
    },
  };
}

/** Deep-freezes one table row so callers cannot mutate shared profiles. */
function frozenProfile<K extends ContainerKind>(profile: ContainerProfile & { container: K; }): ContainerProfile & { container: K; } {
  return Object.freeze({ ...profile, indexSources: Object.freeze([...profile.indexSources]) });
}

export type { ContainerKind, ContainerProfile, ProducerFamily };
