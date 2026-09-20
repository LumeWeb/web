/**
 * TDD contract for the container classifier integration
 * (`capabilities/container-classifier.ts` wraps `container-probe.ts`).
 * `sniffContainer` stays the classification core; the classifier extends the
 * verdict into the full load-pipeline `ContainerProfile` — `mseAppendable`,
 * ordered `indexSources`, `producerMode`, and `producerFamily` — that the
 * load pipeline and index builders key on.
 *
 * Classification only: it must implement no normalization, and must leave
 * `ContainerProfile` consumers that only read `.container` (the sidx builder)
 * byte-identical in behavior.
 */

import { describe, expect, it } from 'vitest';
import { classifyContainer, type ContainerClassifier, containerProfileFor, createContainerClassifier } from '../capabilities/container-classifier.ts';
import { containerKind, type ContainerKind, producerMode } from '../media/types.ts';
import { type ContainerProfile, indexSourceKind, type IndexSourceKind, producerFamily, type ProducerFamily } from '../container/index/random-access-index.ts';

function box(type: string, payload: number[] = []): Uint8Array {
  const size = payload.length + 8;
  const bytes = new Uint8Array(size);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, size);
  for (let i = 0; i < 4; i++) bytes[4 + i] = type.charCodeAt(i);
  bytes.set(payload, 8);
  return bytes;
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const bytes = new Uint8Array(parts.reduce((total, part) => total + part.byteLength, 0));
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.byteLength;
  }
  return bytes;
}

function ebml(doctype: 'matroska' | 'webm'): Uint8Array {
  const doctypeBytes = Array.from(doctype, (char) => char.charCodeAt(0));
  return new Uint8Array([
    0x1a, 0x45, 0xdf, 0xa3,
    0x42, 0x82, 0x88,
    ...doctypeBytes,
  ]);
}

const fmp4Bytes = () => concat(box('ftyp'), box('moov'), box('sidx'), box('moof'));
const mp4Bytes = () => concat(box('ftyp'), box('moov'), box('mdat'));
const tsBytes = () => new Uint8Array(188 * 4).map((_, index) => (index % 188 === 0 ? 0x47 : 0));
const webmBytes = () => ebml('webm');
const mkvBytes = () => ebml('matroska');
const unknownBytes = () => new TextEncoder().encode('<html>definitely not video</html>');

describe('containerProfileFor', () => {
  it('classifies every container kind into its profile-table row', () => {
    const table: readonly (readonly [ContainerKind, ContainerProfile])[] = [
      [containerKind.fmp4, { container: containerKind.fmp4, indexSources: [indexSourceKind.sidx, indexSourceKind['moof-walk']], mseAppendable: true, producerFamily: producerFamily.passthrough, producerMode: producerMode.passthrough }],
      [containerKind.mp4, { container: containerKind.mp4, indexSources: [indexSourceKind.stbl], mseAppendable: false, producerFamily: producerFamily['progressive-mp4'], producerMode: producerMode.normalized }],
      [containerKind.webm, { container: containerKind.webm, indexSources: [indexSourceKind.cues], mseAppendable: true, producerFamily: producerFamily['webm-native'], producerMode: producerMode.native }],
      [containerKind.mkv, { container: containerKind.mkv, indexSources: [indexSourceKind.cues], mseAppendable: false, producerFamily: producerFamily['mkv-to-webm'], producerMode: producerMode.repatch }],
      [containerKind.ts, { container: containerKind.ts, indexSources: [indexSourceKind['ts-rap']], mseAppendable: false, producerFamily: producerFamily['ts-to-fmp4'], producerMode: producerMode.normalized }],
      [containerKind.unknown, { container: containerKind.unknown, indexSources: [], mseAppendable: false, producerFamily: producerFamily.reject, producerMode: producerMode.degraded }],
    ];
    for (const [container, expected] of table) {
      expect(containerProfileFor(container)).toEqual(expected);
    }
  });

  it('only ever emits valid index sources and producer families', () => {
    const indexSources: IndexSourceKind[] = [indexSourceKind.cues, indexSourceKind['moof-walk'], indexSourceKind.packet, indexSourceKind.sidx, indexSourceKind.stbl, indexSourceKind['ts-rap']];
    const producerFamilies: ProducerFamily[] = [producerFamily.passthrough, producerFamily['progressive-mp4'], producerFamily['ts-to-fmp4'], producerFamily['webm-native'], producerFamily['mkv-to-webm'], producerFamily.reject];
    for (const container of [containerKind.fmp4, containerKind.mp4, containerKind.mkv, containerKind.ts, containerKind.unknown, containerKind.webm] as const) {
      const profile = containerProfileFor(container);
      for (const source of profile.indexSources) expect(indexSources).toContain(source);
      expect(producerFamilies).toContain(profile.producerFamily);
      expect(typeof profile.mseAppendable).toBe('boolean');
    }
  });
});

describe('classifyContainer', () => {
  it('classifies real bytes through the sniff core into a full profile', () => {
    expect(classifyContainer(fmp4Bytes())).toEqual(containerProfileFor(containerKind.fmp4));
    expect(classifyContainer(mp4Bytes())).toEqual(containerProfileFor(containerKind.mp4));
    expect(classifyContainer(tsBytes())).toEqual(containerProfileFor(containerKind.ts));
    expect(classifyContainer(webmBytes())).toEqual(containerProfileFor(containerKind.webm));
    expect(classifyContainer(mkvBytes())).toEqual(containerProfileFor(containerKind.mkv));
    expect(classifyContainer(unknownBytes())).toEqual(containerProfileFor(containerKind.unknown));
  });

  it('rejects an unrecognized container with the reject producer family, not a playback mode', () => {
    const profile = classifyContainer(unknownBytes());
    expect(profile.producerFamily).toBe(producerFamily.reject);
    expect(profile.indexSources).toEqual([]);
  });

  it('reports whether the container can append as-is without over-claiming', () => {
    // fMP4 and WebM append as-is where their codecs are MSE-supported; the
    // reprocessing containers (progressive mp4, mkv, ts) never do as-is.
    expect(classifyContainer(fmp4Bytes()).mseAppendable).toBe(true);
    expect(classifyContainer(webmBytes()).mseAppendable).toBe(true);
    expect(classifyContainer(mp4Bytes()).mseAppendable).toBe(false);
    expect(classifyContainer(mkvBytes()).mseAppendable).toBe(false);
    expect(classifyContainer(tsBytes()).mseAppendable).toBe(false);
  });
});

describe('createContainerClassifier', () => {
  it('exposes an injectable sniff function for unit tests', () => {
    const stub: ContainerClassifier = createContainerClassifier(() => containerKind.webm);
    expect(stub.classify(unknownBytes())).toEqual(containerProfileFor(containerKind.webm));
  });

  it('defaults to the real sniff core when no function is supplied', () => {
    const classifier = createContainerClassifier();
    expect(classifier.classify(fmp4Bytes())).toEqual(containerProfileFor(containerKind.fmp4));
    expect(classifier.classify(tsBytes())).toEqual(containerProfileFor(containerKind.ts));
  });

  it('produces immutable profile objects', () => {
    expect(Object.isFrozen(containerProfileFor(containerKind.fmp4))).toBe(true);
    expect(Object.isFrozen(containerProfileFor(containerKind.fmp4).indexSources)).toBe(true);
  });
});
