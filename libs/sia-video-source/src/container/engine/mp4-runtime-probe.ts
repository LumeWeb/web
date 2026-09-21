/**
 * Bounded runtime probe for progressive MP4. Given a `ByteSource`, reads at
 * most `headBytes` (default 256 KiB) in one clamped request, sniffs the
 * container, and — for MP4-family heads — runs the Mediabunny engine to map
 * track/duration facts onto the neutral vocabulary the load pipeline reports.
 *
 * Rules:
 * - Reads stay bounded: every probe read is clamped to `headBytes`, so a
 *   progressive-MP4 load never scans past the bounded head during probing
 *   (finding a tail-positioned moov is out of scope).
 * - Degradation is safe: a head that cannot be deep-parsed (e.g. a broken or
 *   odd moov) settles as a structural result with an explicit `degradation`
 *   reason; a non-MP4 or unclassifiable head settles structurally without
 *   one. The probe never throws for a degraded parse — a cancellation
 *   (AbortError) is the only thing that propagates, so the caller's epoch
 *   discipline is preserved.
 */
import { sniffContainer } from '../../container-probe.ts';
import { type CodecDescriptor, containerKind, type ContainerKind } from '../../media/legacy-types.ts';
import type { ByteSource } from '../../transport/byte-source.ts';
import { analyzeMp4Head, type MediaTrack, type Mp4HeadParse } from './mediabunny-engine.ts';

/** Default bounded-probe head: front `moov` box trees fit comfortably. */
export const DEFAULT_PROBE_HEAD_BYTES = 256 * 1024;

/** Engine seam (defaults to the Mediabunny engine); injectable so degradation
 * behavior is testable without a real parse. */
export type Mp4HeadAnalyzer = (head: Uint8Array) => Promise<Mp4HeadParse | null>;

/** The seam the load pipeline injects (defaults to `probeProgressiveMp4`). */
export type Mp4RuntimeProbe = (
  source: ByteSource,
  options?: Mp4RuntimeProbeOptions,
) => Promise<Mp4RuntimeProbeResult>;

/** Probe tuning (bounded head size + external cancellation). */
export interface Mp4RuntimeProbeOptions {
  readonly headBytes?: number;
  readonly signal?: AbortSignal;
}

/** The neutral facts a probe yields for one progressive-MP4 load. */
export interface Mp4RuntimeProbeResult {
  readonly container: ContainerKind;
  /** Engine-attached degradation reason, or null when the parse was clean. */
  readonly degradation: null | string;
  readonly durationSeconds: null | number;
  readonly tracks: readonly MediaTrack[];
}

/** Maps engine track metadata onto the codec descriptors the pipeline uses. */
export function codecDescriptorsFromTracks(tracks: readonly MediaTrack[]): CodecDescriptor[] {
  return tracks.map((track) => ({ codec: track.codec, kind: track.kind, mimeCodec: track.codec }));
}

/**
 * Probes `source` through the Mediabunny engine. The engine deep-parses
 * MP4-family heads only; every other container returns a structural result
 * with empty facts and no engine bytes moved. A cancellation propagates as-is.
 */
export async function probeProgressiveMp4(
  source: ByteSource,
  options: Mp4RuntimeProbeOptions = {},
  analyze: Mp4HeadAnalyzer = analyzeMp4Head,
): Promise<Mp4RuntimeProbeResult> {
  const headBytes = options.headBytes ?? DEFAULT_PROBE_HEAD_BYTES;
  const head = await readBoundedHead(source, headBytes, options.signal);
  const container = sniffContainer(head);

  if (container === containerKind.mp4 || container === containerKind.fmp4) {
    const parsed = await analyze(head);
    if (parsed === null) {
      return {
        container,
        degradation: 'mediabunny: head not mp4-readable',
        durationSeconds: null,
        tracks: [],
      };
    }
    return { container, degradation: null, durationSeconds: parsed.durationSeconds, tracks: parsed.tracks };
  }

  // Non-MP4 heads move no engine bytes: settle as a structural result.
  return { container, degradation: null, durationSeconds: null, tracks: [] };
}

/** Safely stringifies an arbitrary abort reason (no `[object Object]` fallbacks). */
function describeAbortReason(reason: unknown): string {
  if (
    typeof reason === 'string' ||
    typeof reason === 'number' ||
    typeof reason === 'bigint' ||
    typeof reason === 'boolean' ||
    typeof reason === 'symbol'
  ) {
    return String(reason);
  }
  return 'bounded head read aborted';
}

/** Normalizes an abort into a throwable error (stable across node + browser). */
function headAbortError(signal: AbortSignal): Error {
  const reason: unknown = signal.reason;
  if (reason instanceof Error) return reason;
  return typeof DOMException !== 'undefined'
    ? new DOMException(describeAbortReason(reason), 'AbortError')
    : new Error(describeAbortReason(reason));
}

/**
 * Reads a bounded, clamped head from a `ByteSource`, always settling the
 * underlying read (a short read or EOF is normal). The probe uses this so the
 * engine never needs to page around the object.
 *
 * Cancellation contract: a pre-aborted `signal` rejects immediately
 * (deterministic, never a hang), and an abort mid-read cancels the in-flight
 * read so a source that does not honor `signal` inside `read()` still settles.
 */
async function readBoundedHead(
  source: ByteSource,
  maxBytes: number = DEFAULT_PROBE_HEAD_BYTES,
  signal?: AbortSignal,
): Promise<Uint8Array> {
  if (signal?.aborted) throw headAbortError(signal);

  const stream = source.read({ length: maxBytes, offset: 0 }, { loadGeneration: 0, signal });
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  const onAbort = (): void => {
    // Cancelling the reader settles the underlying read; the source also
    // receives the signal through `ReadOptions.signal`, so both paths unwind.
    void reader.cancel(signal?.reason);
  };
  signal?.addEventListener('abort', onAbort, { once: true });
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      const remaining = maxBytes - total;
      chunks.push(remaining < value.byteLength ? value.subarray(0, remaining) : value);
      total += Math.min(value.byteLength, remaining);
      if (total >= maxBytes) break;
    }
  } finally {
    signal?.removeEventListener('abort', onAbort);
    // Always settle the underlying read (close no-ops on an already-closed stream).
    await reader.cancel();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}
