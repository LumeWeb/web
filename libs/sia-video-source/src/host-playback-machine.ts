/**
 * Host playback decision machine for `SiaVideoSource`, implemented with
 * Robot3 (one machine per video source instance). It tracks ONLY decision
 * state: where the session is, whether a repair is owed and at what position,
 * how many consecutive recovery attempts the current load has spent, and — as
 * a side output — the small `HostDecision` the host performs effects from.
 * DOM objects, the worker, MSE handles, buffered ranges, request ids, and the
 * current playhead all stay outside this module in `SiaVideoSource`.
 *
 * The machine is synchronous: no Robot3 `invoke` services. Every transition
 * runs inline; effects are recorded as decisions and applied by the host.
 *
 * States
 * ──────
 *  idle       — no source set.
 *  loading    — a source is set and the worker load has not acknowledged.
 *  ready      — a healthy load is attached and reporting.
 *  pausepending — a native pause arrived on a playing load (video.js fires it
 *               before `seeking` on a far scrub); the playing choice is
 *               retained until the host's next-task `pause.confirmed` settles
 *               it as a user pause or a seek/play supersedes it.
 *  recovering — an automatic reload/restart is in flight; incidental native
 *               pause/ended/seeking/error events from the replaced pipeline
 *               are ignored here.
 *  failed     — a failure surfaced; only an explicit user action or a fresh
 *               source moves on.
 *
 * Context (decision state only)
 * ─────────────────────────────
 *  preference — one value: 'never-started' | 'playing' | 'paused'.
 *  attempt    — consecutive recovery attempts spent on the current load,
 *               bounded by `MAX_RECOVERY_ATTEMPTS`, shared by decode reloads,
 *               out-of-window seek restarts, and native-failure restarts.
 *  repairOwed — the position (and its reason) of a repair that must wait for
 *               an explicit user action; null when none is owed.
 *  recovery   — the in-flight restart's request (seconds, wantsPlay, reason);
 *               null when no restart is in flight.
 *
 * Behaviour rules (encoded in the transitions below)
 * ──────────────────────────────────────────────────
 *  - Reader retries never reach this machine: only a worker error the worker
 *    already exhausted its retries on arrives as `load.failed`.
 *  - A decode failure while playing restarts at the watch position, at most
 *    `MAX_RECOVERY_ATTEMPTS` times; exhaustion surfaces a decode error.
 *  - A decode failure while explicitly paused never reloads: it records a
 *    repair. The next explicit play restarts once and resumes; the next
 *    explicit seek restarts at the target and stays paused.
 *  - A native element error from a dead/replaced resource is ignored while a
 *    recovery is in flight or a repair is already owed; paused with nothing
 *    owed it records a repair; actively playing it gets the retry-capped
 *    restart.
 *  - User pause wins: an incidental teardown pause during `recovering` is
 *    never treated as the user stopping.
 *  - A transport failure (network kind, after reader retries) never reloads;
 *    it surfaces a network error and waits for an explicit play/seek.
 *  - The recovery budget restores only when a recovery load genuinely plays
 *    again (or its repositioning seek resolves): a reloaded load that merely
 *    re-opens and fails again is the same broken object consuming the same
 *    attempts.
 *  - A fresh source, a re-attach, or an explicit load() drops all recovery
 *    state; a re-attach keeps the playback choice.
 */
import {
  createMachine,
  guard,
  interpret,
  reduce,
  state,
  transition,
  type Transition,
} from 'robot3';

/** The slice of Robot3's service this host reads/writes. */
interface HostPlaybackService {
  context: HostPlaybackState;
  machine: { current: LifecycleState };
  send(event: HostPlaybackEvent): void;
}

export const MAX_RECOVERY_ATTEMPTS = 2;

/**
 * Sentinel for a recovery restart's `wantsPlay` signal: resolve the boolean
 * against the stored playback choice when the restart happens instead of
 * fixing it at recording time.
 */
const AS_PREFERENCE = 'as-preference';

/**
 * The Robot3 lifecycle states: the machine's `current` vocabulary. The values
 * are the exact names Robot3 reports as the current state and that every
 * transition targets, so the machine, the host, and the specs all compare
 * against these — never raw strings.
 */
export const hostPlaybackState = {
  failed: 'failed',
  idle: 'idle',
  loading: 'loading',
  pausePending: 'pausepending',
  ready: 'ready',
  recovering: 'recovering',
} as const;

/** The Robot3 lifecycle state names; see {@link hostPlaybackState}. */
export type LifecycleState = (typeof hostPlaybackState)[keyof typeof hostPlaybackState];

/**
 * The events the host sends into the machine. The dotted names are the wire
 * vocabulary Robot3 matches as transition triggers; every `HostPlaybackEvent`
 * construction and guard compares these, never raw strings.
 */
export const hostPlaybackEvent = {
  loadFailed: 'load.failed',
  nativeError: 'native.error',
  pause: 'pause',
  pauseConfirmed: 'pause.confirmed',
  play: 'play',
  recoverPlayed: 'recover.played',
  seek: 'seek',
  seekOutOfWindow: 'seek.outOfWindow',
  seekResolved: 'seek.resolved',
  sourceAttach: 'source.attach',
  sourceReady: 'source.ready',
  sourceReset: 'source.reset',
  sourceSet: 'source.set',
  stalledSeek: 'stalled.seek',
} as const;

/** The machine event names; see {@link hostPlaybackEvent}. */
export type HostPlaybackEventName = (typeof hostPlaybackEvent)[keyof typeof hostPlaybackEvent];

/** The failure kinds a `load.failed` event may carry (the same set as the wire's `WorkerErrorCode`). */
export const hostReportKind = {
  decode: 'decode',
  device: 'device',
  network: 'network',
  unsupported: 'unsupported',
} as const;

/** A failure kind a `load.failed` event may carry; see {@link hostReportKind}. */
export type HostReportKind = (typeof hostReportKind)[keyof typeof hostReportKind];

/**
 * The recovery/restart reasons the machine records in decisions and context.
 * A terminal `load.failed` keeps a repair owed only for the transport failure
 * kind (`network`), the one a user action can repair; an unsupported container
 * is not repairable and records no reason.
 */
export const recoveryReason = {
  decode: 'decode',
  native: 'native',
  network: 'network',
  seek: 'seek',
} as const;

/** A recovery/restart reason; see {@link recoveryReason}. */
export type RecoveryReason = (typeof recoveryReason)[keyof typeof recoveryReason];

/** The effects a transition may record; see `HostDecision`. */
export const hostDecisionKind = {
  deferRepair: 'defer-repair',
  reportError: 'report-error',
  restartSource: 'restart-source',
} as const;

/** A recorded effect kind; see `HostDecision`. */
export type HostDecisionKind = (typeof hostDecisionKind)[keyof typeof hostDecisionKind];

/** The stored playback choice in machine context. */
export const playbackPreference = {
  'never-started': 'never-started',
  paused: 'paused',
  playing: 'playing',
} as const;

/**
 * The one thing the host must DO after a transition. Empty `send` results mean
 * "nothing to do" — the host continues its ordinary wire forwarding.
 */
export type HostDecision =
  | { error: HostReportKind; kind: typeof hostDecisionKind.reportError }
  | { kind: typeof hostDecisionKind.deferRepair; reason: RecoveryReason; resumeSeconds: number }
  | { kind: typeof hostDecisionKind.restartSource; reason: RecoveryReason; resumeSeconds: number; wantsPlay: boolean };

/** Events the host sends into the machine. */
export type HostPlaybackEvent =
  | { kind: HostReportKind; resumeSeconds: number; type: typeof hostPlaybackEvent.loadFailed }
  | { resumeSeconds: number; type: typeof hostPlaybackEvent.nativeError }
  | { seconds: number; type: typeof hostPlaybackEvent.seekOutOfWindow }
  | { seconds: number; type: typeof hostPlaybackEvent.seek }
  | { seconds: number; type: typeof hostPlaybackEvent.stalledSeek }
  | { type: typeof hostPlaybackEvent.pauseConfirmed }
  | { type: typeof hostPlaybackEvent.pause }
  | { type: typeof hostPlaybackEvent.play }
  | { type: typeof hostPlaybackEvent.recoverPlayed }
  | { type: typeof hostPlaybackEvent.seekResolved }
  | { type: typeof hostPlaybackEvent.sourceAttach }
  | { type: typeof hostPlaybackEvent.sourceReady }
  | { type: typeof hostPlaybackEvent.sourceReset }
  | { type: typeof hostPlaybackEvent.sourceSet };
export interface HostPlaybackState {
  attempt: number;
  preference: PlaybackPreference;
  recovery: null | RecoveryRequest;
  repairOwed: null | RepairOwed;
}
/** The stored playback choice; see {@link playbackPreference}. */
export type PlaybackPreference = (typeof playbackPreference)[keyof typeof playbackPreference];

export interface RecoveryRequest {
  reason: RecoveryReason;
  resumeSeconds: number;
  wantsPlay: boolean;
}

export interface RepairOwed {
  reason: RecoveryReason;
  seconds: number;
}

type MachineEvent = HostPlaybackEvent;

function initialContext(): HostPlaybackState {
  return {
    attempt: 0,
    preference: playbackPreference['never-started'],
    recovery: null,
    repairOwed: null,
  };
}

function resumeOf(event: MachineEvent): number {
  switch (event.type) {
    case hostPlaybackEvent.loadFailed:
    case hostPlaybackEvent.nativeError:
      return event.resumeSeconds;
    case hostPlaybackEvent.seek:
    case hostPlaybackEvent.seekOutOfWindow:
    case hostPlaybackEvent.stalledSeek:
      return event.seconds;
    default:
      return 0;
  }
}

const setPreference = (preference: PlaybackPreference) =>
  reduce<HostPlaybackState, MachineEvent>((ctx) => ({ ...ctx, preference }));

const resetAll = reduce<HostPlaybackState, MachineEvent>(() => initialContext());

const resetRecovery = reduce<HostPlaybackState, MachineEvent>((ctx) => ({
  ...ctx,
  attempt: 0,
  recovery: null,
  repairOwed: null,
}));

// Guards.
const isOwed = (ctx: HostPlaybackState): boolean => ctx.repairOwed !== null;
const isPaused = (ctx: HostPlaybackState): boolean => ctx.preference === playbackPreference.paused;
const isPlaying = (ctx: HostPlaybackState): boolean => ctx.preference === playbackPreference.playing;
const canRetry = (ctx: HostPlaybackState): boolean => ctx.attempt < MAX_RECOVERY_ATTEMPTS;
const spentBudget = (ctx: HostPlaybackState): boolean => !canRetry(ctx);
const isSeekRecovery = (ctx: HostPlaybackState): boolean =>
  ctx.recovery?.reason === recoveryReason.seek;
const isDecodeFailure = (_ctx: HostPlaybackState, event: MachineEvent): boolean =>
  event.type === hostPlaybackEvent.loadFailed && event.kind === hostReportKind.decode;
const isTerminalFailure = (_ctx: HostPlaybackState, event: MachineEvent): boolean =>
  event.type === hostPlaybackEvent.loadFailed && event.kind !== hostReportKind.decode;

/** ANDs a state predicate onto the decode-failure recognition guard. */
const decodeFailureWhen =
  (pred: (ctx: HostPlaybackState) => boolean) =>
  (ctx: HostPlaybackState, event: MachineEvent): boolean =>
    isDecodeFailure(ctx, event) && pred(ctx);

/**
 * The Robot3 service for one SiaVideoSource instance. `send` hands the event
 * to the machine and returns any decision recorded during that transition;
 * the host performs the effects synchronously.
 */
export class HostPlaybackMachine {
  get attempt(): number {
    return this.#service.context.attempt;
  }
  get current(): LifecycleState {
    return this.#service.machine.current;
  }

  get isRecovering(): boolean {
    return this.current === hostPlaybackState.recovering;
  }

  get preference(): PlaybackPreference {
    return this.#service.context.preference;
  }

  get repairOwed(): null | RepairOwed {
    return this.#service.context.repairOwed;
  }

  readonly #decisions: HostDecision[];

  readonly #service: HostPlaybackService;

  constructor() {
    this.#decisions = [];
    this.#service = interpret(buildMachine(this.#decisions), () => undefined) as unknown as HostPlaybackService;
  }

  send(event: HostPlaybackEvent): HostDecision[] {
    this.#service.send(event);
    const taken = this.#decisions.slice();
    this.#decisions.length = 0;
    return taken;
  }
}

/**
 * Builds the transitions a healthy-load state (loading / ready) shares. `self`
 * is the state to stay in for ordinary user events. Guards choose between
 * consuming an owed repair, deferring behind a paused user, restarting, or
 * surfacing fatal errors across the recovery kinds.
 */
function activeLoadTransitions(
  self: typeof hostPlaybackState.loading | typeof hostPlaybackState.ready,
  decisions: HostDecision[],
): Transition<string>[] {
  // Explicit user play repairs an owed load: restart from the owed position,
  // resuming, spending one attempt.
  const consumeOwedOnPlay = reduce<HostPlaybackState, MachineEvent>((ctx) => {
    const owed = ctx.repairOwed;
    if (!owed) return ctx;
    decisions.push({
      kind: hostDecisionKind.restartSource,
      reason: owed.reason,
      resumeSeconds: owed.seconds,
      wantsPlay: true,
    });
    return {
      ...ctx,
      attempt: ctx.attempt + 1,
      preference: playbackPreference.playing,
      recovery: { reason: owed.reason, resumeSeconds: owed.seconds, wantsPlay: true },
      repairOwed: null,
    };
  });

  // Explicit user seek repairs an owed load at the NEW target, staying paused.
  const consumeOwedOnSeek = reduce<HostPlaybackState, MachineEvent>((ctx, event) => {
    const owed = ctx.repairOwed;
    if (!owed) return ctx;
    const resumeSeconds = resumeOf(event);
    decisions.push({
      kind: hostDecisionKind.restartSource,
      reason: owed.reason,
      resumeSeconds,
      wantsPlay: false,
    });
    return {
      ...ctx,
      attempt: ctx.attempt + 1,
      recovery: { reason: owed.reason, resumeSeconds, wantsPlay: false },
      repairOwed: null,
    };
  });

  const recordRestart = (reason: RecoveryReason, wantsPlay: boolean | typeof AS_PREFERENCE) =>
    reduce<HostPlaybackState, MachineEvent>((ctx, event) => {
      const resumeSeconds = resumeOf(event);
      const play = wantsPlay === AS_PREFERENCE ? ctx.preference === playbackPreference.playing : wantsPlay;
      decisions.push({ kind: hostDecisionKind.restartSource, reason, resumeSeconds, wantsPlay: play });
      return {
        ...ctx,
        attempt: ctx.attempt + 1,
        recovery: { reason, resumeSeconds, wantsPlay: play },
        repairOwed: null,
      };
    });

  const recordDefer = (reason: RecoveryReason) =>
    reduce<HostPlaybackState, MachineEvent>((ctx, event) => {
      const resumeSeconds = resumeOf(event);
      decisions.push({ kind: hostDecisionKind.deferRepair, reason, resumeSeconds });
      return { ...ctx, repairOwed: { reason, seconds: resumeSeconds } };
    });

  // A failure surfaced after the budget drained: the load is finished, but a
  // repair stays owed so an explicit user action may start a fresh source.
  const recordExhausted = (reason: RecoveryReason, kind: HostReportKind) =>
    reduce<HostPlaybackState, MachineEvent>((ctx, event) => {
      const resumeSeconds = resumeOf(event);
      decisions.push({ error: kind, kind: hostDecisionKind.reportError });
      return {
        ...ctx,
        attempt: 0,
        recovery: null,
        repairOwed: { reason, seconds: resumeSeconds },
      };
    });

  // A transport/fatal failure never reloads a healthy load; it surfaces now.
  // Network stays repairable by user action; an unsupported container is not.
  const recordFatal = () =>
    reduce<HostPlaybackState, MachineEvent>((ctx, event) => {
      const kind = event.type === hostPlaybackEvent.loadFailed ? event.kind : hostReportKind.decode;
      const resumeSeconds = resumeOf(event);
      decisions.push({ error: kind, kind: hostDecisionKind.reportError });
      return {
        ...ctx,
        attempt: 0,
        recovery: null,
        repairOwed: kind === hostReportKind.network ? { reason: kind, seconds: resumeSeconds } : null,
      };
    });

  return [
    // Source boundaries: a fresh source drops all recovery state; a re-attach
    // rebuilds the load but keeps the playback choice.
    transition(hostPlaybackEvent.sourceSet, hostPlaybackState.loading, resetAll),
    transition(hostPlaybackEvent.sourceReset, hostPlaybackState.idle, resetAll),
    transition(hostPlaybackEvent.sourceAttach, hostPlaybackState.loading, resetRecovery),
    transition(hostPlaybackEvent.sourceReady, hostPlaybackState.ready, resetRecovery),

    // User intent: play / pause record the choice in the current state.
    transition(hostPlaybackEvent.play, hostPlaybackState.recovering, guard(isOwed), consumeOwedOnPlay),
    transition(hostPlaybackEvent.play, self, setPreference(playbackPreference.playing)),
    // A pause on a PLAYING load is provisional: video.js emits a native pause
    // before `seeking` on every far scrub, so the machine stays in
    // `pausepending` (retaining the playing choice) until the host's next-task
    // `pause.confirmed` lands or a seek/play supersedes it. An already-paused
    // (or never-started) load treats the pause as final directly.
    transition(hostPlaybackEvent.pause, hostPlaybackState.pausePending, guard(isPlaying)),
    transition(hostPlaybackEvent.pause, self, setPreference(playbackPreference.paused)),

    // An owed repair consumed by an explicit scrub at the new target, paused.
    transition(hostPlaybackEvent.seek, hostPlaybackState.recovering, guard(isOwed), consumeOwedOnSeek),
    // An ordinary in-window seek needs no decision from the machine.
    transition(hostPlaybackEvent.seek, self),

    // Out-of-window / unresolved seeks restart the source now, retry-capped.
    transition(hostPlaybackEvent.seekOutOfWindow, hostPlaybackState.recovering, guard(isOwed), consumeOwedOnSeek),
    transition(hostPlaybackEvent.seekOutOfWindow, hostPlaybackState.failed, guard(spentBudget), recordExhausted(recoveryReason.seek, hostReportKind.decode)),
    transition(hostPlaybackEvent.seekOutOfWindow, hostPlaybackState.recovering, recordRestart(recoveryReason.seek, AS_PREFERENCE)),
    transition(hostPlaybackEvent.stalledSeek, hostPlaybackState.failed, guard(spentBudget), recordExhausted(recoveryReason.seek, hostReportKind.decode)),
    transition(hostPlaybackEvent.stalledSeek, hostPlaybackState.recovering, recordRestart(recoveryReason.seek, AS_PREFERENCE)),
    transition(hostPlaybackEvent.seekResolved, self),

    // Transport and fatal failures surface immediately; they never reload.
    transition(hostPlaybackEvent.loadFailed, hostPlaybackState.failed, guard(isTerminalFailure), recordFatal()),
    // A decode failure on a healthy load: paused defers (deferral never
    // spends budget, so a paused load with a drained budget still records a
    // repair); otherwise an exhausted budget surfaces the decode error, and a
    // spendable run restarts at the watch position (resuming only when the
    // choice is playing).
    transition(
      hostPlaybackEvent.loadFailed,
      self,
      guard(decodeFailureWhen(isPaused)),
      recordDefer(recoveryReason.decode),
    ),
    transition(
      hostPlaybackEvent.loadFailed,
      hostPlaybackState.failed,
      guard(decodeFailureWhen(spentBudget)),
      recordExhausted(recoveryReason.decode, hostReportKind.decode),
    ),
    transition(
      hostPlaybackEvent.loadFailed,
      hostPlaybackState.recovering,
      guard(decodeFailureWhen(canRetry)),
      recordRestart(recoveryReason.decode, AS_PREFERENCE),
    ),

    // Native element failure from a dead/replaced resource: an already-owed
    // repair ignores the echo; paused records one repair (deferral never
    // spends budget, so a paused load with a drained budget still records a
    // repair); otherwise a retry-capped restart, and a drained budget reports
    // a decode error.
    transition(hostPlaybackEvent.nativeError, self, guard(isOwed)),
    transition(hostPlaybackEvent.nativeError, self, guard(isPaused), recordDefer(recoveryReason.native)),
    transition(
      hostPlaybackEvent.nativeError,
      hostPlaybackState.failed,
      guard(spentBudget),
      recordExhausted(recoveryReason.native, hostReportKind.decode),
    ),
    transition(hostPlaybackEvent.nativeError, hostPlaybackState.recovering, recordRestart(recoveryReason.native, AS_PREFERENCE)),
  ];
}


function buildMachine(decisions: HostDecision[]) {
  // The idle state's transitions live here (the helper builders own the shared
  // ones); Robot3's `state(...)` infers a single event generic, so they are
  // widened to the common `Transition<string>` shape.
  const idleTransitions: Transition<string>[] = [
    transition(hostPlaybackEvent.sourceSet, hostPlaybackState.loading, resetAll),
    transition(hostPlaybackEvent.sourceAttach, hostPlaybackState.loading, resetAll),
    transition(hostPlaybackEvent.sourceReset, hostPlaybackState.idle),
    // A worker-level report without a request id can arrive with no source
    // active (e.g. the worker stopped). It belongs to no load to repair, so
    // it surfaces as-is and the machine stays idle.
    transition(
      hostPlaybackEvent.loadFailed,
      hostPlaybackState.idle,
      reduce<HostPlaybackState, MachineEvent>((ctx, event) => {
        if (event.type !== hostPlaybackEvent.loadFailed) return ctx;
        decisions.push({ error: event.kind, kind: hostDecisionKind.reportError });
        return ctx;
      }),
    ),
    transition(hostPlaybackEvent.nativeError, hostPlaybackState.idle),
  ];
  return createMachine(
    hostPlaybackState.idle,
    {
      [hostPlaybackState.failed]: state(...failedTransitions(decisions)),
      [hostPlaybackState.idle]: state(...idleTransitions),
      [hostPlaybackState.loading]: state(...activeLoadTransitions(hostPlaybackState.loading, decisions)),
      [hostPlaybackState.pausePending]: state(...pausePendingTransitions(decisions)),
      [hostPlaybackState.ready]: state(...activeLoadTransitions(hostPlaybackState.ready, decisions)),
      [hostPlaybackState.recovering]: state(...recoveringTransitions(decisions)),
    },
    () => initialContext(),
  );
}

/** Transitions for the surfaced-failure state. */
function failedTransitions(decisions: HostDecision[]): Transition<string>[] {
  const consumeOwedOnPlay = reduce<HostPlaybackState, MachineEvent>((ctx) => {
    const owed = ctx.repairOwed;
    if (!owed) return ctx;
    decisions.push({
      kind: hostDecisionKind.restartSource,
      reason: owed.reason,
      resumeSeconds: owed.seconds,
      wantsPlay: true,
    });
    return {
      ...ctx,
      attempt: 0,
      preference: playbackPreference.playing,
      recovery: { reason: owed.reason, resumeSeconds: owed.seconds, wantsPlay: true },
      repairOwed: null,
    };
  });

  const consumeOwedOnSeek = reduce<HostPlaybackState, MachineEvent>((ctx, event) => {
    const owed = ctx.repairOwed;
    if (!owed) return ctx;
    const resumeSeconds = resumeOf(event);
    decisions.push({
      kind: hostDecisionKind.restartSource,
      reason: owed.reason,
      resumeSeconds,
      wantsPlay: false,
    });
    return {
      ...ctx,
      attempt: 0,
      recovery: { reason: owed.reason, resumeSeconds, wantsPlay: false },
      repairOwed: null,
    };
  });

  return [
    transition(hostPlaybackEvent.sourceSet, hostPlaybackState.loading, resetAll),
    transition(hostPlaybackEvent.sourceReset, hostPlaybackState.idle, resetAll),
    transition(hostPlaybackEvent.sourceAttach, hostPlaybackState.loading, resetRecovery),
    // The explicit play/seek starts a fresh source when a repair is owed;
    // otherwise (e.g. an unsupported container) nothing helps and it stays.
    transition(hostPlaybackEvent.play, hostPlaybackState.recovering, guard(isOwed), consumeOwedOnPlay),
    transition(hostPlaybackEvent.play, hostPlaybackState.failed),
    transition(hostPlaybackEvent.seek, hostPlaybackState.recovering, guard(isOwed), consumeOwedOnSeek),
    transition(hostPlaybackEvent.seek, hostPlaybackState.failed),
  ];
}

/**
 * Transitions for the provisional-pause window. video.js emits a native
 * `pause` before `seeking` on a far scrub of a playing element; the machine
 * waits in this state (retaining the playing choice) until the host's
 * next-task `pause.confirmed` settles it as a genuine user pause, or a
 * seek/play supersedes it first. The window is one host turn, so only the
 * events that can land inside it are routed here; failures follow the
 * playing-flavored healthy-load handling because the playing choice is
 * retained until confirmation.
 */
function pausePendingTransitions(decisions: HostDecision[]): Transition<string>[] {
  // A restart inside the window records the retained (playing) choice, so an
  // out-of-window scrub preserves playback.
  const recordRestart = (reason: RecoveryReason, wantsPlay: boolean | typeof AS_PREFERENCE) =>
    reduce<HostPlaybackState, MachineEvent>((ctx, event) => {
      const resumeSeconds = resumeOf(event);
      const play = wantsPlay === AS_PREFERENCE ? ctx.preference === playbackPreference.playing : wantsPlay;
      decisions.push({ kind: hostDecisionKind.restartSource, reason, resumeSeconds, wantsPlay: play });
      return {
        ...ctx,
        attempt: ctx.attempt + 1,
        recovery: { reason, resumeSeconds, wantsPlay: play },
        repairOwed: null,
      };
    });

  const recordExhausted = (reason: RecoveryReason, kind: HostReportKind) =>
    reduce<HostPlaybackState, MachineEvent>((ctx, event) => {
      const resumeSeconds = resumeOf(event);
      decisions.push({ error: kind, kind: hostDecisionKind.reportError });
      return { ...ctx, attempt: 0, recovery: null, repairOwed: { reason, seconds: resumeSeconds } };
    });

  const recordFatal = () =>
    reduce<HostPlaybackState, MachineEvent>((ctx, event) => {
      const kind = event.type === hostPlaybackEvent.loadFailed ? event.kind : hostReportKind.decode;
      const resumeSeconds = resumeOf(event);
      decisions.push({ error: kind, kind: hostDecisionKind.reportError });
      return {
        ...ctx,
        attempt: 0,
        recovery: null,
        repairOwed: kind === hostReportKind.network ? { reason: kind, seconds: resumeSeconds } : null,
      };
    });

  return [
    // Source boundaries — the same precedence as any healthy load.
    transition(hostPlaybackEvent.sourceSet, hostPlaybackState.loading, resetAll),
    transition(hostPlaybackEvent.sourceReset, hostPlaybackState.idle, resetAll),
    transition(hostPlaybackEvent.sourceAttach, hostPlaybackState.loading, resetRecovery),
    transition(hostPlaybackEvent.sourceReady, hostPlaybackState.ready, resetRecovery),

    // The next-task confirmation: no seek intervened, so the pause was
    // deliberate and the retained playing choice settles to paused. The event
    // has no transition anywhere else, so a stale confirmation after a
    // seek/play has already moved the machine is a harmless no-op.
    transition(
      hostPlaybackEvent.pauseConfirmed,
      hostPlaybackState.ready,
      setPreference(playbackPreference.paused),
    ),
    // A redundant native pause while pending stays pending.
    transition(hostPlaybackEvent.pause, hostPlaybackState.pausePending),
    // The resumed seek (or the user pressing play) wins over the confirmation.
    transition(hostPlaybackEvent.play, hostPlaybackState.ready, setPreference(playbackPreference.playing)),
    transition(hostPlaybackEvent.recoverPlayed, hostPlaybackState.ready, resetRecovery),

    // A scrub inside the window is ordinary playback work: the in-window SEEK
    // is a plain message, and the out-of-window / stalled restart preserves the
    // (still playing) choice via AS_PREFERENCE.
    transition(hostPlaybackEvent.seek, hostPlaybackState.ready),
    transition(hostPlaybackEvent.seekResolved, hostPlaybackState.ready),
    transition(
      hostPlaybackEvent.seekOutOfWindow,
      hostPlaybackState.failed,
      guard(spentBudget),
      recordExhausted(recoveryReason.seek, hostReportKind.decode),
    ),
    transition(hostPlaybackEvent.seekOutOfWindow, hostPlaybackState.recovering, recordRestart(recoveryReason.seek, AS_PREFERENCE)),
    transition(
      hostPlaybackEvent.stalledSeek,
      hostPlaybackState.failed,
      guard(spentBudget),
      recordExhausted(recoveryReason.seek, hostReportKind.decode),
    ),
    transition(hostPlaybackEvent.stalledSeek, hostPlaybackState.recovering, recordRestart(recoveryReason.seek, AS_PREFERENCE)),

    // Failures during the fleeting window follow the playing-flavored
    // healthy-load handling (the playing choice is retained until confirm).
    transition(hostPlaybackEvent.nativeError, hostPlaybackState.ready, guard(isOwed)),
    transition(
      hostPlaybackEvent.nativeError,
      hostPlaybackState.failed,
      guard(spentBudget),
      recordExhausted(recoveryReason.native, hostReportKind.decode),
    ),
    transition(hostPlaybackEvent.nativeError, hostPlaybackState.recovering, recordRestart(recoveryReason.native, AS_PREFERENCE)),
    transition(hostPlaybackEvent.loadFailed, hostPlaybackState.failed, guard(isTerminalFailure), recordFatal()),
    transition(
      hostPlaybackEvent.loadFailed,
      hostPlaybackState.failed,
      guard(decodeFailureWhen(spentBudget)),
      recordExhausted(recoveryReason.decode, hostReportKind.decode),
    ),
    transition(
      hostPlaybackEvent.loadFailed,
      hostPlaybackState.recovering,
      guard(decodeFailureWhen(canRetry)),
      recordRestart(recoveryReason.decode, AS_PREFERENCE),
    ),
  ];
}

/** Transitions for the recovery-in-flight state. */
function recoveringTransitions(decisions: HostDecision[]): Transition<string>[] {
  const recordRestart = (reason: RecoveryReason, wantsPlay: boolean | typeof AS_PREFERENCE) =>
    reduce<HostPlaybackState, MachineEvent>((ctx, event) => {
      const resumeSeconds = resumeOf(event);
      const play = wantsPlay === AS_PREFERENCE ? ctx.preference === playbackPreference.playing : wantsPlay;
      decisions.push({ kind: hostDecisionKind.restartSource, reason, resumeSeconds, wantsPlay: play });
      return {
        ...ctx,
        attempt: ctx.attempt + 1,
        recovery: { reason, resumeSeconds, wantsPlay: play },
        repairOwed: null,
      };
    });

  const recordDefer = (reason: RecoveryReason) =>
    reduce<HostPlaybackState, MachineEvent>((ctx, event) => {
      const resumeSeconds = resumeOf(event);
      decisions.push({ kind: hostDecisionKind.deferRepair, reason, resumeSeconds });
      return { ...ctx, repairOwed: { reason, seconds: resumeSeconds } };
    });

  const recordExhausted = (reason: RecoveryReason, kind: HostReportKind) =>
    reduce<HostPlaybackState, MachineEvent>((ctx, event) => {
      const resumeSeconds = resumeOf(event);
      decisions.push({ error: kind, kind: hostDecisionKind.reportError });
      return { ...ctx, attempt: 0, recovery: null, repairOwed: { reason, seconds: resumeSeconds } };
    });

  const recordFatal = () =>
    reduce<HostPlaybackState, MachineEvent>((ctx, event) => {
      const kind = event.type === hostPlaybackEvent.loadFailed ? event.kind : hostReportKind.decode;
      const resumeSeconds = resumeOf(event);
      decisions.push({ error: kind, kind: hostDecisionKind.reportError });
      return {
        ...ctx,
        attempt: 0,
        recovery: null,
        repairOwed: kind === hostReportKind.network ? { reason: kind, seconds: resumeSeconds } : null,
      };
    });

  return [
    transition(hostPlaybackEvent.sourceSet, hostPlaybackState.loading, resetAll),
    transition(hostPlaybackEvent.sourceReset, hostPlaybackState.idle, resetAll),
    transition(hostPlaybackEvent.sourceAttach, hostPlaybackState.loading, resetRecovery),
    // The recovery load re-opens: this is the SAME broken object, so the
    // budget stays untouched (counter intact) until it genuinely plays again.
    transition(hostPlaybackEvent.sourceReady, hostPlaybackState.recovering),

    // Incidental native events from the replaced pipeline are engine work,
    // never user input: pause, ended, seeking, and native errors are ignored
    // here. A watchdog stall, however, is not incidental: it re-enters the
    // retry-capped seek restart (or reports) exactly like the first attempt.
    transition(hostPlaybackEvent.play, hostPlaybackState.recovering),
    transition(hostPlaybackEvent.pause, hostPlaybackState.recovering),
    transition(hostPlaybackEvent.seek, hostPlaybackState.recovering),
    transition(hostPlaybackEvent.seekOutOfWindow, hostPlaybackState.recovering),
    transition(hostPlaybackEvent.nativeError, hostPlaybackState.recovering),

    // A watchdog stall while a recovery is in flight: another retry-capped
    // seek restart, or the shared budget is spent and it reports.
    transition(hostPlaybackEvent.stalledSeek, hostPlaybackState.failed, guard(spentBudget), recordExhausted(recoveryReason.seek, hostReportKind.decode)),
    transition(hostPlaybackEvent.stalledSeek, hostPlaybackState.recovering, recordRestart(recoveryReason.seek, AS_PREFERENCE)),

    // The recovery load genuinely plays again: budget restores, window closes.
    transition(hostPlaybackEvent.recoverPlayed, hostPlaybackState.ready, resetRecovery),
    // A seek-restart whose repositioning seek resolves closes the window too.
    transition(hostPlaybackEvent.seekResolved, hostPlaybackState.ready, guard(isSeekRecovery), resetRecovery),

    // Another decode failure on the reloaded load: a paused choice always
    // defers a repair (even on a drained budget); otherwise an exhausted
    // budget reports, or a retry-capped restart — the same precedence as a
    // failure on a healthy load.
    transition(hostPlaybackEvent.loadFailed, hostPlaybackState.recovering, guard(isTerminalFailure), recordFatal()),
    transition(
      hostPlaybackEvent.loadFailed,
      hostPlaybackState.recovering,
      guard(decodeFailureWhen(isPaused)),
      recordDefer(recoveryReason.decode),
    ),
    transition(
      hostPlaybackEvent.loadFailed,
      hostPlaybackState.failed,
      guard(decodeFailureWhen(spentBudget)),
      recordExhausted(recoveryReason.decode, hostReportKind.decode),
    ),
    transition(
      hostPlaybackEvent.loadFailed,
      hostPlaybackState.recovering,
      guard(decodeFailureWhen(canRetry)),
      recordRestart(recoveryReason.decode, AS_PREFERENCE),
    ),
  ];
}
