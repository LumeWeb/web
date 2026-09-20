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
import { mediaKind, type MediaKind } from '../../media/types.ts';

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
      const mapped: MediaTrack[] = [];
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
          // Minimal fixtures report a degenerate id of 0; mediaTrackId falls
          // back to the 1-based ordinal so identities stay stable and positive.
          trackId: mediaTrackId(track.id, mapped.length + 1),
        });
      }
      const durationSeconds = await input.getDurationFromMetadata().catch(() => null);
      return { durationSeconds: durationSeconds ?? null, tracks: mapped };
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
