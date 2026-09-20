/**
 * Mediabunny fragment engine: turns a complete progressive-MP4 object into
 * MSE-appendable fMP4 — one `init` segment (ftyp + moov) followed by ordered,
 * keyframe-aligned `media` segments (moof + mdat), each carrying increasing
 * decode timestamps.
 *
 * Mediabunny 1.58.0 (MPL-2.0) is the only engine. The load is a whole-object
 * sequential read (an index-less progressive MP4 has no sidx), so the
 * producer accumulates the object and drives this engine once at the terminator.
 *
 * The engine runs mediabunny's Conversion with a `CmafOutputFormat` configured
 * for fragmented output and uses the format's `onFtyp`/`onMoov`/`onMoof`/
 * `onMdat` callbacks — the published "extract data through format-specific
 * callbacks" surface — to capture the discrete boxes:
 *
 *   - `onFtyp` + `onMoov` → the MSE init segment;
 *   - each consecutive `onMoof` + `onMdat` pair → one self-contained media
 *     fragment (a moof-led, mdat-carrying segment whose start timestamp — the
 *     `onMoof` third argument — strictly increases).
 *
 * Media packets are copied, never transcoded (`copy: { mode: 'forced' }`), so
 * the engine needs no encoder and the bytes stay byte-exact. The mediabunny
 * import is lazy (inside the run path) so this module loads identically in
 * node and the browser, and no mediabunny type leaks past the seam.
 */
/** The result of one refragment job: init plus ordered media segments. */
export interface FragmentedMp4Output {
  /** MSE init segment (ftyp + moov); a fresh SourceBuffer must see it first. */
  readonly init: Uint8Array;
  /** Ordered, keyframe-aligned media segments (moof + mdat). */
  readonly media: readonly Uint8Array[];
}

/** Bytes → {init, media[]} refragment options. */
export interface Mp4FragmentOptions {
  /**
   * Minimum duration of each media fragment, in seconds. Fragments always
   * break on keyframes, so this only sets a lower bound on fragment length.
   * Defaults to 1 s.
   */
  readonly minimumFragmentDuration?: number;
}

interface Mp4FragmentState {
  init: null | Uint8Array;
  media: Uint8Array[];
}

/**
 * Refragments a full progressive-MP4 object into one init segment and ordered
 * media segments. Rejects when the bytes are not MP4-readable or the fragment
 * job produced no media; it never hangs (there is no engine-parse loophole —
 * an unreadable input throws from mediabunny's info/convert path).
 */
export async function mediabunnyFragmentFromBytes(
  bytes: Uint8Array,
  options: Mp4FragmentOptions = {},
): Promise<FragmentedMp4Output> {
  const mediabunny = await import('mediabunny');
  const state: Mp4FragmentState = { init: null, media: [] };
  // Capture callbacks: the fragment boxes are gathered from the format's
  // written boxes, so the targets need hold nothing (NullTarget discards).
  const format = new mediabunny.CmafOutputFormat({
    minimumFragmentDuration: options.minimumFragmentDuration ?? DEFAULT_FRAGMENT_SECONDS,
    onFtyp: (data: Uint8Array) => {
      state.init = appendInit(state.init, data);
    },
    onMdat: (data: Uint8Array) => {
      const last = state.media[state.media.length - 1];
      if (!last) return;
      state.media[state.media.length - 1] = concatBytes(last, data);
    },
    onMoof: (data: Uint8Array) => {
      // A media fragment is moof-led; the score line below appends mdat to
      // the moof bytes currently being gathered.
      state.media.push(new Uint8Array(data));
    },
    onMoov: (data: Uint8Array) => {
      state.init = appendInit(state.init, data);
    },
  });
  const input = new mediabunny.Input({
    formats: [mediabunny.MP4],
    source: new mediabunny.BufferSource(bytes),
  });
  try {
    const output = new mediabunny.Output({
      format,
      initTarget: new mediabunny.NullTarget(),
      target: new mediabunny.NullTarget(),
    });
    const conversion = await mediabunny.Conversion.init({
      copy: { mode: 'forced' },
      input,
      output,
      showWarnings: false,
    });
    // A non-composable conversion owns the output's full lifecycle: `execute`
    // writes and finalizes it (an explicit `output.finalize()` would just warn
    // "already finalized"), and the format callbacks captured every box.
    await conversion.execute();
  } finally {
    input.dispose();
  }
  const init = state.init;
  if (init === null) throw new Error('mediabunny fragment: init segment unavailable');
  if (state.media.length === 0) throw new Error('mediabunny fragment: no media segments');
  return { init, media: state.media };
}

/** Default minimum media-segment duration (1 s keeps fragments MSE-friendly). */
export const DEFAULT_FRAGMENT_SECONDS = 1;

/** Appends `part` onto the in-progress init segment (ftyp then moov). */
function appendInit(init: null | Uint8Array, part: Uint8Array): Uint8Array {
  if (init === null) return new Uint8Array(part);
  return concatBytes(init, part);
}

/** Concatenates two byte buffers into one standalone Uint8Array. */
function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.byteLength + b.byteLength);
  out.set(a, 0);
  out.set(b, a.byteLength);
  return out;
}
