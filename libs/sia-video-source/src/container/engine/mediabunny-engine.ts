/**
 * Mediabunny engine: the bounded MP4 analysis behind the load pipeline's
 * progressive-MP4 runtime probe. Mediabunny 1.58.0 (MPL-2.0) is the only
 * engine; its ISO-BMFF info reader extracts codec-level track facts and a
 * metadata duration from a bounded head, which the probe maps onto the media
 * vocabulary.
 *
 * The mediabunny import is lazy (inside the open path) so this module loads
 * identically in node and the browser. The engine never throws for a head it
 * cannot read: an unrecognizable container or a broken/odd moov degrades to
 * `null`, and the probe reports that degradation instead of failing a load.
 * Only the MP4 family is deep-parsed here; non-MP4 heads move no mediabunny
 * bytes.
 */
import { mediaKind, type MediaKind } from '../../media/legacy-types.ts';

/**
 * One track the engine discovered in an MP4 head. Facts beyond `codec`/`kind`
 * are best-effort: a fact the engine cannot report cheaply is `null`. `trackId`
 * is a stable positive identity (see {@link mediaTrackId}).
 */
export interface MediaTrack {
  readonly codec: string;
  readonly kind: MediaKind;
  /** Container timescale in ticks/second when the engine reports it. */
  readonly timescale: null | number;
  /** Stable track identity for this source (positive integer). */
  readonly trackId: number;
}

/** Codec-level facts the engine extracted from an MP4 head. */
export interface Mp4HeadParse {
  readonly durationSeconds: null | number;
  readonly tracks: readonly MediaTrack[];
}

/** The mediabunny track types that map onto the media `MediaKind`. */
const KIND_BY_MEDIABUNNY_TYPE: Readonly<Record<string, MediaKind>> = {
  audio: mediaKind.audio,
  video: mediaKind.video,
};

/**
 * Runs mediabunny's ISO-BMFF info parse over `head` and maps its tracks to the
 * neutral vocabulary. Returns `null` when the head is not MP4-readable (a
 * broken/odd moov or an engine import failure); the probe settles that as a
 * structural, degraded result — never a throw.
 */
export async function analyzeMp4Head(head: Uint8Array): Promise<Mp4HeadParse | null> {
  const mediabunny = await import('mediabunny');
  try {
    const input = new mediabunny.Input({
      formats: [mediabunny.MP4],
      source: new mediabunny.BufferSource(head),
    });
    try {
      const tracks = await input.getTracks();
      const mapped: Omit<MediaTrack, 'trackId'>[] = [];
      const reportedIds: unknown[] = [];
      for (const track of tracks) {
        const kind = KIND_BY_MEDIABUNNY_TYPE[track.type];
        if (!kind) continue; // subtitle/data tracks are out of the first release
        const codec = await track.getCodecParameterString().catch(() => null);
        if (!codec) continue;
        const timescale = await track.getTimeResolution().catch(() => null);
        mapped.push({
          codec,
          kind,
          timescale: typeof timescale === 'number' ? timescale : null,
        });
        // Minimal fixtures report a degenerate id of 0, so ids are resolved as
        // a whole list afterwards: a fallback ordinal must never equal a valid
        // sibling id (or two tracks would share one identity).
        reportedIds.push(track.id);
      }
      const trackIds = resolveTrackIds(reportedIds);
      const resolved: MediaTrack[] = mapped.map((track, index) => ({ ...track, trackId: trackIds[index] }));
      const durationSeconds = await input.getDurationFromMetadata().catch(() => null);
      return { durationSeconds: durationSeconds ?? null, tracks: resolved };
    } finally {
      input.dispose();
    }
  } catch {
    // Unrecognizable container or a truncated/odd moov: degrade, never throw.
    return null;
  }
}

/**
 * Normalizes an engine-reported track id into a stable, positive identity:
 * positive ids pass through; non-positive/absent ids fall back to the 1-based
 * ordinal position within the mapped track list.
 */
export function mediaTrackId(reported: unknown, ordinal: number): number {
  return typeof reported === 'number' && Number.isInteger(reported) && reported > 0 ? reported : ordinal;
}

/**
 * Maps a whole reported-id list into distinct positive ids. Each reported id
 * keeps its value when it is a positive integer; degenerate (non-positive or
 * absent) ids fall back to their 1-based ordinal within the mapped list. A
 * value that collides with an earlier assignment — a valid positive id that
 * equals another track's ordinal fallback, or a duplicated valid id — is
 * remapped to the first free positive ordinal, preserving iteration order.
 * Distinct ids keep source-buffer wiring unambiguous even when a container
 * reports duplicate or zero track ids.
 */
export function resolveTrackIds(reported: readonly unknown[]): number[] {
  const used = new Set<number>();
  return reported.map((id, index) => {
    let resolved = mediaTrackId(id, index + 1);
    if (used.has(resolved)) {
      let candidate = 1;
      while (used.has(candidate)) candidate += 1;
      resolved = candidate;
    }
    used.add(resolved);
    return resolved;
  });
}
