/**
 * The one mediabunny pipeline for a load: a single `Input` serves metadata
 * discovery AND conversion, so the object's bytes are downloaded once. Track
 * discovery, codec-qualified MIME, duration, and the CMAF fragment stream all
 * come from mediabunny; this module only adapts the transport
 * (`mediaLibrarySource`) and prepares the conversion against the browser's MSE
 * before the load is accepted.
 *
 * The conversion is initialized while the object is inspected, never deferred
 * to playback start: by the time the load is accepted, the chosen video and
 * audio tracks have already been validated for forced-copy into CMAF, so a
 * source a copy cannot support is rejected up front with a stable reason code.
 *
 * Playback is restartable: `restart(seconds)` cancels the current conversion
 * and arms a fresh one trimmed at the seek point over the same input, so a
 * seek re-runs the conversion from the nearest library-chosen keyframe instead
 * of streaming the whole object again. Each armed conversion is a run guarded
 * by its own ordinal, so a superseded run can never emit into the sink or
 * report against the run that replaced it.
 */
import {
  ALL_FORMATS,
  CmafOutputFormat,
  Conversion,
  ConversionCanceledError,
  Input,
  type InputAudioTrack,
  InputDisposedError,
  type InputFormat,
  type InputVideoTrack,
  MatroskaInputFormat,
  type MediaCodec,
  Mp4InputFormat,
  MpegTsInputFormat,
  NullTarget,
  Output,
  QuickTimeInputFormat,
  WebMInputFormat,
} from 'mediabunny';
import type { PlaybackCapabilities } from '../capabilities/browser-capabilities.ts';
import type { AppendSink } from '../sink/append-sink.ts';
import type { ByteSource } from '../transport/byte-source.ts';
import { ByteSourceSupersededError } from '../transport/byte-source.ts';
import type { ContainerKind, PlaybackTrack } from './types.ts';
import { mediaLibrarySource } from './library-source.ts';

/** Minimum media-fragment duration in seconds; fragments break on keyframes. */
const DEFAULT_FRAGMENT_SECONDS = 1;

/**
 * How far inside the media's true end a seek may still point. A trimmed
 * conversion serves the fragment that CONTAINS the target, which starts at the
 * keyframe at-or-before it and ends at the final sample; a target at or past
 * that final sample leaves the run nothing to emit and it completes as an
 * "incomplete CMAF stream". The guard keeps the clamped target inside the last
 * reachable fragment while still letting the user land as close to the tail as
 * the media allows.
 */
const SEEK_TAIL_GUARD_SECONDS = 0.25;

/**
 * Clamps a seek target to a position the trimmed conversion can actually
 * serve. `servableEndSeconds` is the media's true end (the largest sample end
 * timestamp across tracks, from the shared input's sample tables — not the
 * metadata duration, which can overshoot the real content). A request beyond
 * that extent would trim every sample out and come through as a broken
 * stream, so the target is pulled back inside the last reachable fragment
 * instead.
 */
export function clampSeekTarget(trimStart: number, servableEndSeconds: number): number {
  return Math.max(0, Math.min(trimStart, servableEndSeconds - SEEK_TAIL_GUARD_SECONDS));
}

/** MSE-output audio preference: AAC first, then Opus, then MP3. */
const AUDIO_CODEC_PREFERENCE: readonly MediaCodec[] = ['aac', 'opus', 'mp3'];

export interface CancelledMediaLoad {
  readonly status: 'cancelled';
}

export interface InspectMediaLibraryOptions {
  /** MSE/codec capability snapshot used for the startup validation. */
  readonly capabilities: PlaybackCapabilities;
  /** Load-generation counter forwarded to every ByteSource read. */
  readonly loadGeneration?: number;
  /** External abort signal forwarded to every ByteSource read. */
  readonly signal?: AbortSignal;
}

/** The typed verdict for one load, replacing string status dispatch. */
export type MediaLoadResult = CancelledMediaLoad | ReadyMediaLoad | UnsupportedMediaLoad;

export interface MediaPlayback {
  dispose(): void;
  /**
   * Restarts the conversion near `fromSeconds` after the first run, for seeks:
   * the in-flight run is cancelled and a new, trimmed run begins at the
   * library-chosen keyframe at or before the timestamp. Returns false when the
   * playback has not started, is disposed, or a restart is already in flight.
   * Kept optional so load fakes that only exercise the initial conversion keep
   * satisfying the interface; the playback returned for a ready load has it.
   */
  restart?(fromSeconds: number): boolean;
  start(
    sink: AppendSink,
    loadGeneration: number,
    callbacks: {
      readonly onComplete: () => void;
      readonly onError: (error: unknown) => void;
    },
  ): void;
}

/** One discovered, validated load that can begin converting. */
export interface ReadyMediaLoad {
  /** Container family the library reported. */
  readonly container: string;
  /** Metadata duration in seconds when the object states one, else null. */
  readonly durationSeconds: null | number;
  /** MSE-ready, codec-qualified MIME for the load's SourceBuffer. */
  readonly mime: string;
  /** Runs the prepared conversion; the load owns its lifecycle. */
  readonly playback: MediaPlayback;
  readonly status: 'ready';
  /** Discovered track codecs in track order. */
  readonly tracks: readonly PlaybackTrack[];
}

/** Discovered but not playable in this MSE. */
export interface UnsupportedMediaLoad {
  /** Raw failure message for read/format failures, when one exists. */
  readonly detail?: string;
  /** Why the object cannot play (track list, MSE codec rejection, copy). */
  readonly reason: UnsupportedReason;
  readonly status: 'unsupported';
}

export type UnsupportedReason =
  | 'audio-codec-unsupported'
  | 'audio-track-missing'
  | 'copy-unavailable'
  | 'format-unreadable'
  | 'mime-unsupported'
  | 'video-codec-unknown'
  | 'video-track-missing';

/**
 * One armed conversion attempt. `run` matches `assembly.run` at arm time and
 * guards the attempt's callbacks and completion, so a superseded run can
 * neither assemble boxes into the sink nor report against a newer run.
 */
interface ConversionRun {
  readonly conversion: Conversion;
  readonly run: number;
}

/**
 * CMAF box assembly shared by the output callbacks and the playback closure.
 * The conversion pairs boxes: ftyp is held for its moov, moof for its mdat.
 * `sink` stays null until playback starts so the conversion can be prepared
 * and validated without appending anywhere; `disposed` reaches the callbacks
 * so a torn-down playback stops emitting before the sink is aborted. The
 * box-pairing fields and `fault` are per-`run`: each conversion run resets
 * them at arm time, and the run ordinal keeps superseded runs from touching
 * them.
 */
interface FragmentAssembly {
  disposed: boolean;
  /** Order violation recorded by a callback, raised at execution end. */
  fault: Error | null;
  ftyp: null | Uint8Array;
  initEmitted: boolean;
  mediaEmitted: boolean;
  moof: null | Uint8Array;
  /** Ordinal of the currently armed run; callbacks act only for their run. */
  run: number;
  sink: AppendSink | null;
}

/**
 * Discovers and validates one load through a shared mediabunny `Input` and
 * prepares its conversion before reporting `ready`. Returns `unsupported`
 * with a stable reason for an object with no video or audio track, with
 * codecs the MSE rejects, or with tracks a forced copy cannot place in CMAF;
 * `cancelled` when the reads were superseded or aborted; and `ready` with a
 * runnable playback otherwise.
 */
export async function inspectMediaLibrary(
  source: ByteSource,
  options: InspectMediaLibraryOptions,
): Promise<MediaLoadResult> {
  const { capabilities, loadGeneration, signal } = options;
  const customSource = mediaLibrarySource(source, { loadGeneration, signal });
  const input = new Input({ formats: ALL_FORMATS, source: customSource });
  let result: MediaLoadResult;
  try {
    result = await prepareLoad(input, capabilities);
  } catch (error) {
    result = isCancelledError(error)
      ? { status: 'cancelled' }
      : { detail: describeError(error), reason: 'format-unreadable', status: 'unsupported' };
  }
  if (result.status !== 'ready') input.dispose();
  return result;
}

/** Preference rank for an audio codec; -1 marks a codec outside the list. */
function audioCodecRank(codec: MediaCodec | null): number {
  if (codec === null) return -1;
  const index = AUDIO_CODEC_PREFERENCE.indexOf(codec);
  return index >= 0 ? index : -1;
}

/** Cancels a conversion without surfacing cancellation races as failures. */
function cancelConversion(run: ConversionRun): void {
  const conversion = run.conversion;
  if (conversion.state === 'done' || conversion.state === 'canceled') return;
  void conversion.cancel().catch(() => {
    // Cancellation races are reported by mediabunny, not this seam.
  });
}

/** Picks the strongest-preference audio track from the library's ranking. */
async function chooseAudioTrack(tracks: InputAudioTrack[]): Promise<InputAudioTrack | null> {
  let best: null | { readonly rank: number; readonly track: InputAudioTrack } = null;
  for (const track of tracks) {
    const codec = await track.getCodec();
    const rank = audioCodecRank(codec);
    if (rank < 0) continue;
    if (best === null || rank < best.rank) best = { rank, track };
  }
  return best === null ? null : best.track;
}

/** Concatenates two byte buffers, or returns the non-null one. */
function concatBytes(a: null | Uint8Array, b: null | Uint8Array): null | Uint8Array {
  if (a === null) return b === null ? null : new Uint8Array(b);
  if (b === null) return new Uint8Array(a);
  const out = new Uint8Array(a.byteLength + b.byteLength);
  out.set(a, 0);
  out.set(b, a.byteLength);
  return out;
}

/** Container family the library's detected input format maps to. */
function containerFromFormat(format: InputFormat): ContainerKind {
  if (format instanceof Mp4InputFormat || format instanceof QuickTimeInputFormat) return 'mp4';
  if (format instanceof WebMInputFormat) return 'webm';
  if (format instanceof MatroskaInputFormat) return 'mkv';
  if (format instanceof MpegTsInputFormat) return 'ts';
  return 'unknown';
}

/** Copies a callback-provided view so appended bytes never alias mediabunny buffers. */
function copyBytes(data: Uint8Array): Uint8Array {
  return new Uint8Array(data);
}

/**
 * Builds the runnable playback over the shared input and selected tracks. The
 * initial conversion was prepared during inspection; `start` executes that
 * run, and `restart` accepts every valid seek (latest-wins), driving one
 * replacement over the same input at a time towards the newest target.
 * Completion and error only reach the caller while their run is still
 * the current one, so a superseded run is silent.
 */
function createMediaPlayback(options: {
  readonly assembly: FragmentAssembly;
  readonly audioTrack: InputAudioTrack;
  readonly initial: ConversionRun;
  readonly input: Input;
  readonly videoTrack: InputVideoTrack;
}): MediaPlayback {
  const { assembly, audioTrack, initial, input, videoTrack } = options;
  let current: ConversionRun | null = initial;
  let generation = 0;
  let onComplete: (() => void) | null = null;
  let onError: ((error: unknown) => void) | null = null;
  let started = false;
  // Newest accepted seek target not yet consumed by the driver; a rapid seek
  // parks over an older one, so no valid intent is ever dropped.
  let pendingSeekTarget: null | number = null;
  // The single in-flight restart driver; a restart while it runs only parks a
  // newer target for its next pass.
  let restartDriver: null | Promise<void> = null;
  // The media's true end (largest sample end across tracks), computed once on
  // the first restart and reused: the restart driver clamps every seek target
  // against it, and the shared input's sample tables give it without decoding.
  let servableEnd: null | Promise<null | number> = null;

  const cancel = (): void => {
    const run = current;
    if (run !== null) cancelConversion(run);
  };

  const dispose = (): void => {
    if (assembly.disposed) return;
    assembly.disposed = true;
    cancel();
    input.dispose();
  };

  /**
   * Resolves the media's true end timestamp once and reuses it for every
   * restart. A duration query that fails (disposed input, format quirk) yields
   * null so the driver leaves the target unclamped rather than guessing.
   */
  const servableEndSeconds = (): Promise<null | number> => {
    servableEnd ??= input.computeDuration().catch(() => null);
    return servableEnd;
  };

  /** Executes one armed run, reporting only while it is the current run. */
  const execute = (run: ConversionRun): void => {
    void (async () => {
      try {
        await run.conversion.execute();
      } catch (error) {
        // A cancellation or a disposal supersedes the run; neither is a
        // failure and a superseded run must not report against an older run.
        if (!assembly.disposed && assembly.run === run.run && !isCancelledError(error)) onError?.(error);
        return;
      }
      if (assembly.disposed || assembly.run !== run.run) return;
      if (assembly.fault !== null) {
        onError?.(assembly.fault);
        return;
      }
      // The run ends cleanly only when init arrived and every moof/mdat pair
      // was completed during execution. A legitimate tail trim never gets
      // here: the restart driver clamps the seek target inside the last
      // reachable fragment, so an empty or dangling tail run means the media
      // genuinely cannot be serviced, not just that the target overshot.
      if (!assembly.initEmitted || assembly.moof !== null || !assembly.mediaEmitted) {
        onError?.(new Error('conversion ended with an incomplete CMAF stream'));
        return;
      }
      const sink = assembly.sink;
      if (sink !== null) sink.requestEndOfStream(generation);
      onComplete?.();
    })();
  };

  /**
   * Accepts every valid seek intent (latest-wins) instead of latching: the
   * newest parked target is recorded, and at most ONE asynchronous driver runs
   * — it consumes the latest target, bumps the run ordinal (so every prior
   * run's callbacks go stale), cancels the prior conversion, and prepares a
   * trimmed replacement over the same input. A newer target arriving while a
   * replacement is being prepared supersedes it before it can even start. Each
   * accepted seek is what makes the controller reset the sink at the target,
   * so the conversion trim and the MSE re-anchor always agree on the newest
   * position.
   */
  const driveRestarts = async (): Promise<void> => {
    try {
      while (!assembly.disposed && current !== null) {
        const target = pendingSeekTarget;
        if (target === null) return;
        pendingSeekTarget = null;
        const previous = current;
        // The seek is a request for the newest position, never a demand to
        // break: a target past the media's true end (the metadata duration can
        // overshoot the real samples) must clamp back inside the last
        // reachable fragment instead of trimming every sample out. The sink
        // already applied the seek's timestamp offset, so the clamped content
        // still lands on the element near the requested position.
        const end = await servableEndSeconds();
        const trimStart = end === null ? target : clampSeekTarget(target, end);
        // Arming the replacement first bumps the run ordinal, so the pending
        // run's callbacks go stale before its conversion is cancelled; its
        // cancellation can then never assemble boxes into the sink or report.
        const replacementPromise = prepareConversion({
          assembly,
          audioTrack,
          input,
          trimStart,
          videoTrack,
        });
        cancelConversion(previous);
        let replacement: ConversionRun;
        try {
          replacement = await replacementPromise;
        } catch (error) {
          // A canceled/disposed preparation is not a restart failure; consume
          // whichever newer target parked during it on the next pass.
          if (!assembly.disposed && !isCancelledError(error)) onError?.(error);
          continue;
        }
        // A newer seek (or teardown) landed while this replacement was being
        // prepared: it targets an older position, so never start it — cancel
        // it and continue with the latest parked target.
        if (assembly.disposed || pendingSeekTarget !== null) {
          cancelConversion(replacement);
          continue;
        }
        current = replacement;
        execute(replacement);
      }
    } finally {
      restartDriver = null;
      // A target that arrived while the driver was finishing must not be
      // stranded; the last restart's seek triggers the controller's sink reset
      // synchronously, but the driver re-arms here for any straggler.
      if (!assembly.disposed && started && current !== null && pendingSeekTarget !== null) {
        restartDriver = driveRestarts();
      }
    }
  };

  const restart = (fromSeconds: number): boolean => {
    if (assembly.disposed || !started || current === null) return false;
    pendingSeekTarget = fromSeconds;
    restartDriver ??= driveRestarts();
    return true;
  };

  const start = (
    sink: AppendSink,
    loadGeneration: number,
    callbacks: { readonly onComplete: () => void; readonly onError: (error: unknown) => void },
  ): void => {
    if (assembly.disposed || started) return;
    started = true;
    assembly.sink = sink;
    onComplete = callbacks.onComplete;
    onError = callbacks.onError;
    generation = loadGeneration;
    const run = current;
    if (run !== null) execute(run);
  };

  return { dispose, restart, start };
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Whether an error means the work was cancelled rather than failed. */
function isCancelledError(error: unknown): boolean {
  if (error instanceof ConversionCanceledError) return true;
  if (error instanceof InputDisposedError) return true;
  if (error instanceof ByteSourceSupersededError) return true;
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: unknown }).name === 'AbortError'
  );
}

/** `video/mp4` MIME carrying the chosen video and audio codec parameters. */
function mseMime(videoCodec: string, audioCodec: string): string {
  return `video/mp4; codecs="${videoCodec},${audioCodec}"`;
}

/**
 * Builds and initializes one CMAF conversion over the shared input, arming it
 * as the current run. Every attempt gets a fresh `Output`, so its init segment
 * and media fragments re-emit for a restart; the box-pairing state is reset
 * for the run and each callback only acts while `assembly.run` still matches
 * the run it was armed for. `trimStart` starts the copy at a
 * library-chosen keyframe at or before the requested timestamp.
 */
async function prepareConversion(options: {
  readonly assembly: FragmentAssembly;
  readonly audioTrack: InputAudioTrack;
  readonly input: Input;
  readonly trimStart?: number;
  readonly videoTrack: InputVideoTrack;
}): Promise<ConversionRun> {
  const { assembly, audioTrack, input, trimStart, videoTrack } = options;
  const run = ++assembly.run;
  assembly.fault = null;
  assembly.ftyp = null;
  assembly.initEmitted = false;
  assembly.mediaEmitted = false;
  assembly.moof = null;

  const output = new Output({
    format: new CmafOutputFormat({
      minimumFragmentDuration: DEFAULT_FRAGMENT_SECONDS,
      onFtyp: (data: Uint8Array) => {
        // A superseded run must not pair boxes into the current assembly.
        if (assembly.disposed || assembly.run !== run) return;
        if (assembly.ftyp !== null) {
          assembly.fault = new Error('ftyp arrived twice before moov');
          return;
        }
        assembly.ftyp = copyBytes(data);
      },
      // A media fragment is moof-led; the mdat that follows completes it, so
      // every moof/mdat pair appends as one self-contained segment.
      onMdat: (data: Uint8Array) => {
        if (assembly.disposed || assembly.run !== run) return;
        const lead = assembly.moof;
        assembly.moof = null;
        if (lead === null) {
          assembly.fault = new Error('mdat arrived without a pending moof');
          return;
        }
        const media = concatBytes(lead, data);
        const sink = assembly.sink;
        if (media !== null && sink !== null) {
          sink.append({ bytes: media, kind: 'media' });
          assembly.mediaEmitted = true;
        }
      },
      onMoof: (data: Uint8Array) => {
        if (assembly.disposed || assembly.run !== run) return;
        if (assembly.moof !== null) {
          assembly.fault = new Error('moof arrived twice before mdat');
          return;
        }
        assembly.moof = copyBytes(data);
      },
      onMoov: (data: Uint8Array) => {
        if (assembly.disposed || assembly.run !== run) return;
        const lead = assembly.ftyp;
        assembly.ftyp = null;
        if (lead === null) {
          assembly.fault = new Error('moov arrived without ftyp');
          return;
        }
        const init = concatBytes(lead, copyBytes(data));
        const sink = assembly.sink;
        if (init !== null && sink !== null) {
          sink.append({ bytes: init, kind: 'init' });
          assembly.initEmitted = true;
        }
      },
    }),
    initTarget: new NullTarget(),
    target: new NullTarget(),
  });

  const conversion = await Conversion.init({
    audio: (track: InputAudioTrack) => (track === audioTrack ? {} : { discard: true }),
    copy: { mode: 'forced' },
    input,
    output,
    showWarnings: false,
    trim: trimStart === undefined ? undefined : { start: trimStart },
    video: (track: InputVideoTrack) => (track === videoTrack ? {} : { discard: true }),
  });

  return { conversion, run };
}

/**
 * Runs discovery and, when the object qualifies, builds and validates the
 * CMAF conversion through `Conversion.init`. The conversion is created here,
 * before the load is accepted, so forced-copy failures surface as
 * `copy-unavailable` instead of at playback start.
 */
async function prepareLoad(input: Input, capabilities: PlaybackCapabilities): Promise<MediaLoadResult> {
  const tracks = await input.getTracks();
  const videoTracks = tracks.filter((track) => track.isVideoTrack());
  const audioTracks = tracks.filter((track) => track.isAudioTrack());
  if (videoTracks.length === 0) return unsupported('video-track-missing');
  if (audioTracks.length === 0) return unsupported('audio-track-missing');

  const videoTrack = await input.getPrimaryVideoTrack();
  if (videoTrack === null) return unsupported('video-track-missing');
  const videoCodec = await videoTrack.getCodecParameterString();
  if (videoCodec === null) return unsupported('video-codec-unknown');

  const audioTrack = await chooseAudioTrack(audioTracks);
  if (audioTrack === null) return unsupported('audio-codec-unsupported');
  const audioCodec = await audioTrack.getCodecParameterString();
  if (audioCodec === null) return unsupported('audio-codec-unsupported');

  const mime = mseMime(videoCodec, audioCodec);
  if (!capabilities.mseSupported(mime)) return unsupported('mime-unsupported');

  const assembly: FragmentAssembly = {
    disposed: false,
    fault: null,
    ftyp: null,
    initEmitted: false,
    mediaEmitted: false,
    moof: null,
    run: 0,
    sink: null,
  };
  const initial = await prepareConversion({ assembly, audioTrack, input, videoTrack });

  const utilisesChosenTracks =
    initial.conversion.utilizedTracks.includes(videoTrack) &&
    initial.conversion.utilizedTracks.includes(audioTrack);
  if (!initial.conversion.isValid || !utilisesChosenTracks) {
    cancelConversion(initial);
    return unsupported('copy-unavailable');
  }

  let durationSeconds: null | number = null;
  try {
    durationSeconds = await input.getDurationFromMetadata();
  } catch {
    durationSeconds = null;
  }

  return {
    container: containerFromFormat(await input.getFormat()),
    durationSeconds,
    mime,
    playback: createMediaPlayback({ assembly, audioTrack, initial, input, videoTrack }),
    status: 'ready',
    tracks: [
      { codec: videoCodec, kind: 'video' },
      { codec: audioCodec, kind: 'audio' },
    ],
  };
}

/** An `unsupported` verdict built from a stable reason and optional detail. */
function unsupported(reason: UnsupportedReason, detail?: string): UnsupportedMediaLoad {
  return detail === undefined ? { reason, status: 'unsupported' } : { detail, reason, status: 'unsupported' };
}
