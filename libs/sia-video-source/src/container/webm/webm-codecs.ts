/**
 * Dependency-neutral WebM codec discovery: maps the Tracks element's
 * `CodecID` strings (V_VP8, V_VP9, A_OPUS, A_VORBIS, A_FLAC, …) into
 * `CodecDescriptor`s and a codec-qualified `video/webm` MIME — the input the
 * native-WebM producer eligibility check runs with `MediaSource.isTypeSupported`.
 *
 * No external library and no runtime globals; the codec sniff reads only the
 * bounded probe head via the dependency-neutral `probeWebm` walker, so it runs
 * equally in browsers, workers, and Node tests.
 */
import { type CodecDescriptor, mediaKind } from '../../media/types.ts';
import { ebmlWalkMode } from './ebml-reader.ts';
import { probeWebm } from './webm-probe.ts';

/** WebM `CodecID` → `CodecDescriptor` for the codecs this path serves. */
const WEBM_CODECS = new Map<string, CodecDescriptor>([
  ['A_FLAC', { codec: 'flac', kind: mediaKind.audio, mimeCodec: 'flac' }],
  ['A_OPUS', { codec: 'opus', kind: mediaKind.audio, mimeCodec: 'opus' }],
  ['A_VORBIS', { codec: 'vorbis', kind: mediaKind.audio, mimeCodec: 'vorbis' }],
  ['V_VP8', { codec: 'vp8', kind: mediaKind.video, mimeCodec: 'vp8' }],
  ['V_VP9', { codec: 'vp9', kind: mediaKind.video, mimeCodec: 'vp9' }],
]);

/**
 * Maps one WebM `CodecID` string to its `CodecDescriptor`, or null for an
 * unknown/empty id (a codec this path never serves — e.g. `V_MPEG4/ISO/AVC`,
 * which does not belong to WebM's codec set).
 */
export function webmCodecFromId(codecId: string): CodecDescriptor | null {
  if (codecId === '') return null;
  return WEBM_CODECS.get(codecId) ?? null;
}

/**
 * Sniffs the codecs out of a bounded WebM head (the EBML header + Segment
 * Info + Tracks fit within the classifier's probe head). Returns the
 * recognized tracks in track order (video then audio, matching how WebM
 * authors order TrackEntries); unknown CodecIDs are skipped, and an unparseable
 * head yields `[]`.
 */
export function webmCodecsFromHead(head: Uint8Array): CodecDescriptor[] {
  const probe = probeWebm(head, ebmlWalkMode.sniff);
  if (probe === null) return [];
  const out: CodecDescriptor[] = [];
  for (const track of probe.tracks) {
    const descriptor = webmCodecFromId(track.codecId);
    if (descriptor) out.push(descriptor);
  }
  return out;
}

/** `video/webm; codecs="…"` from `mimeCodec`s, or bare `video/webm` when absent. */
export function webmMimeForCodecs(codecs: readonly CodecDescriptor[]): string {
  const joined = codecs.map((codec) => codec.mimeCodec).join(',');
  return joined ? `video/webm; codecs="${joined}"` : 'video/webm';
}
