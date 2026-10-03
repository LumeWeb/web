/**
 * The Robot3 recovery decision machine for the SiaVideoSource host (see
 * `host-playback-machine.ts`). These specs run with no DOM and no worker: the
 * machine records decisions, `SiaVideoSource` performs the effects. State
 * names may appear in the describe blocks; the individual tests name behavior
 * a user sees or an engineer relies on.
 */
import { describe, expect, it, vi } from 'vitest';
import {
  type HostDecision,
  hostDecisionKind,
  hostPlaybackEvent,
  HostPlaybackMachine,
  hostPlaybackState,
  hostReportKind,
  playbackPreference,
  recoveryReason,
} from '../host-playback-machine.ts';
import { workerErrorCode } from '../protocol.ts';

/** A fresh machine with no source set. */
function fresh(): HostPlaybackMachine {
  return new HostPlaybackMachine();
}

/** Sets a source and acknowledges the load: the common ready setup. */
function readyMachine(): HostPlaybackMachine {
  const machine = fresh();
  machine.send({ type: hostPlaybackEvent.sourceSet });
  machine.send({ type: hostPlaybackEvent.sourceReady });
  return machine;
}

describe('the load-failure vocabulary', () => {
  it('keeps hostReportKind the same set as the wire WorkerErrorCode', () => {
    // A load-failure kind travels worker to host: the worker posts it as the
    // wire's WorkerErrorCode, the host records it as a hostReportKind. Keeping
    // the sets equal means a posted kind always fits the host kind type.
    expect(Object.values(hostReportKind).sort()).toEqual(Object.values(workerErrorCode).sort());
  });
});

describe('a source without playback', () => {
  const idle = () => fresh();

  it('sits idle with no playback choice until a source is set', () => {
    const machine = idle();
    expect(machine.current).toBe(hostPlaybackState.idle);
    expect(machine.preference).toBe(playbackPreference['never-started']);
    expect(machine.attempt).toBe(0);
    expect(machine.repairOwed).toBeNull();
    expect(machine.isRecovering).toBe(false);
  });

  it('setting a source opens a load that turns ready once the worker acknowledges', () => {
    const machine = idle();
    expect(machine.send({ type: hostPlaybackEvent.sourceSet })).toEqual([]);
    expect(machine.current).toBe(hostPlaybackState.loading);
    expect(machine.preference).toBe(playbackPreference['never-started']);
    expect(machine.send({ type: hostPlaybackEvent.sourceReady })).toEqual([]);
    expect(machine.current).toBe(hostPlaybackState.ready);
  });

  it('a global worker error while no source is set still reaches the UI', () => {
    // No source is set, yet a worker-level report without a request id
    // (e.g. "worker stopped") must not vanish: the host surfaced it before the
    // state machine existed and still must.
    const machine = idle();
    const decisions = machine.send({
      kind: hostReportKind.network,
      resumeSeconds: 0,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(decisions).toEqual([{ error: hostReportKind.network, kind: hostDecisionKind.reportError }]);
  });
});

describe('the playback choice', () => {
  it('records play and then a deliberate pause as separate choices', () => {
    // The pause is two-phase: a native pause on a playing load keeps the
    // playing choice provisionally, and the next-task confirmation settles it.
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    expect(machine.preference).toBe(playbackPreference.playing);
    machine.send({ type: hostPlaybackEvent.pause });
    expect(machine.preference).toBe(playbackPreference.playing);
    machine.send({ type: hostPlaybackEvent.pauseConfirmed });
    expect(machine.preference).toBe(playbackPreference.paused);
  });

  it('does not count a pause that lands during an in-flight recovery as the user stopping', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 42.5,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(machine.current).toBe(hostPlaybackState.recovering);

    // The teardown of the reload fires an incidental native pause; the user's
    // playback choice must survive it so any later recovery still resumes.
    machine.send({ type: hostPlaybackEvent.pause });
    expect(machine.preference).toBe(playbackPreference.playing);
  });
});

describe('decode failure while playing', () => {
  it('restarts at the watch position and resumes playback', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });

    const decisions = machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 42.5,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(decisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.decode,
        resumeSeconds: 42.5,
        wantsPlay: true,
      },
    ]);
    expect(machine.current).toBe(hostPlaybackState.recovering);
    expect(machine.attempt).toBe(1);
  });

  it('tries at most twice before surfacing a decode error', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });

    // First failure reloads.
    machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 42.5,
      type: hostPlaybackEvent.loadFailed,
    });
    // The reloaded load re-opens but never plays; the second failure reloads again.
    machine.send({ type: hostPlaybackEvent.sourceReady });
    expect(machine.attempt).toBe(1);
    machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 42.5,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(machine.attempt).toBe(2);
    expect(machine.current).toBe(hostPlaybackState.recovering);

    // The third failure no longer restarts; it surfaces a decode error.
    const decisions = machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 42.5,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(decisions).toEqual([{ error: hostReportKind.decode, kind: hostDecisionKind.reportError }]);
    expect(machine.current).toBe(hostPlaybackState.failed);
  });

  it('a native element failure while playing restarts like a decode failure', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    const decisions = machine.send({ resumeSeconds: 7, type: hostPlaybackEvent.nativeError });
    expect(decisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.native,
        resumeSeconds: 7,
        wantsPlay: true,
      },
    ]);
    expect(machine.attempt).toBe(1);
  });
});

describe('decode failure while paused', () => {
  it('never reloads behind the user; the repair waits for an explicit play to consume it', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ type: hostPlaybackEvent.pause });
    // The pause settles to deliberate on the next-task confirmation before the
    // failure lands (a worker error is not the seek that follows a scrub).
    machine.send({ type: hostPlaybackEvent.pauseConfirmed });
    expect(machine.preference).toBe(playbackPreference.paused);

    const decisions = machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 12.5,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(decisions).toEqual([
      { kind: hostDecisionKind.deferRepair, reason: recoveryReason.decode, resumeSeconds: 12.5 },
    ]);
    // No restart happened, the budget is untouched, and the machine stays in
    // its current load with a repair now owed.
    expect(machine.current).toBe(hostPlaybackState.ready);
    expect(machine.attempt).toBe(0);
    expect(machine.repairOwed).toEqual({ reason: recoveryReason.decode, seconds: 12.5 });

    // The explicit play repairs it exactly once: restart from the owed
    // position, and only now does the attempt spend.
    const playDecisions = machine.send({ type: hostPlaybackEvent.play });
    expect(playDecisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.decode,
        resumeSeconds: 12.5,
        wantsPlay: true,
      },
    ]);
    expect(machine.repairOwed).toBeNull();
    expect(machine.attempt).toBe(1);
    expect(machine.current).toBe(hostPlaybackState.recovering);
  });

  it('defers a decode repair on a paused recovery load instead of surfacing it', () => {
    // The paused contract holds across chained recovery: a decode failure on
    // a paused recovery load records a deferred repair — never a
    // MEDIA_ERR_DECODE — and it leaves the attempt budget intact so an
    // explicit play can repair it on a fresh source.
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ type: hostPlaybackEvent.pause });
    machine.send({ type: hostPlaybackEvent.pauseConfirmed });
    expect(machine.preference).toBe(playbackPreference.paused);

    // A paused out-of-window scrub starts the recovery (attempt 1); the
    // recovery load re-opens without spending.
    machine.send({ seconds: 120, type: hostPlaybackEvent.seekOutOfWindow });
    machine.send({ type: hostPlaybackEvent.sourceReady });
    expect(machine.current).toBe(hostPlaybackState.recovering);
    expect(machine.attempt).toBe(1);
    expect(machine.preference).toBe(playbackPreference.paused);

    const decisions = machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 12.5,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(decisions).toEqual([
      { kind: hostDecisionKind.deferRepair, reason: recoveryReason.decode, resumeSeconds: 12.5 },
    ]);
    // No reportError: the machine stays in the load with the repair parked
    // and the budget untouched.
    expect(machine.current).toBe(hostPlaybackState.recovering);
    expect(machine.attempt).toBe(1);
    expect(machine.repairOwed).toEqual({ reason: recoveryReason.decode, seconds: 12.5 });
  });

  it('a scrub while a repair is owed repairs at the new position without starting playback', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ type: hostPlaybackEvent.pause });
    machine.send({ type: hostPlaybackEvent.pauseConfirmed });
    machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 12.5,
      type: hostPlaybackEvent.loadFailed,
    });

    const decisions = machine.send({ seconds: 40, type: hostPlaybackEvent.seek });
    expect(decisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.decode,
        resumeSeconds: 40,
        wantsPlay: false,
      },
    ]);
    expect(machine.repairOwed).toBeNull();
  });

  it('consumes a pending repair once even when the same failure echoes again', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ type: hostPlaybackEvent.pause });
    machine.send({ type: hostPlaybackEvent.pauseConfirmed });
    machine.send({ resumeSeconds: 12.5, type: hostPlaybackEvent.nativeError });
    expect(machine.repairOwed).toEqual({ reason: recoveryReason.native, seconds: 12.5 });

    // The echo of the same incident must neither surface nor replace the owed
    // repair.
    expect(machine.send({ resumeSeconds: 12.5, type: hostPlaybackEvent.nativeError })).toEqual([]);
    expect(machine.repairOwed).toEqual({ reason: recoveryReason.native, seconds: 12.5 });
    expect(machine.preference).toBe(playbackPreference.paused);

    machine.send({ type: hostPlaybackEvent.play });
    expect(machine.repairOwed).toBeNull();
    // A second play in the same turn would find nothing owed.
    expect(machine.send({ type: hostPlaybackEvent.play })).toEqual([]);
  });
});

describe('decode failure on a never-started source', () => {
  it('defers the repair and leaves the recovery budget untouched', () => {
    const machine = readyMachine();
    // No play — the source is attached but never started.
    expect(machine.preference).toBe(playbackPreference['never-started']);

    const decisions = machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 12.5,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(decisions).toEqual([
      { kind: hostDecisionKind.deferRepair, reason: recoveryReason.decode, resumeSeconds: 12.5 },
    ]);
    // The repair is parked, the budget is untouched, and the machine stays
    // in the ready load.
    expect(machine.current).toBe(hostPlaybackState.ready);
    expect(machine.attempt).toBe(0);
    expect(machine.repairOwed).toEqual({ reason: recoveryReason.decode, seconds: 12.5 });
  });

  it('an explicit play consumes the deferred repair with one restart and wantsPlay true', () => {
    const machine = readyMachine();
    machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 12.5,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(machine.repairOwed).toEqual({ reason: recoveryReason.decode, seconds: 12.5 });
    expect(machine.attempt).toBe(0);

    const playDecisions = machine.send({ type: hostPlaybackEvent.play });
    expect(playDecisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.decode,
        resumeSeconds: 12.5,
        wantsPlay: true,
      },
    ]);
    expect(machine.repairOwed).toBeNull();
    expect(machine.attempt).toBe(1);
    expect(machine.current).toBe(hostPlaybackState.recovering);
  });

  it('a second play after the deferred repair is consumed is a no-op', () => {
    const machine = readyMachine();
    machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 12.5,
      type: hostPlaybackEvent.loadFailed,
    });
    machine.send({ type: hostPlaybackEvent.play });
    expect(machine.current).toBe(hostPlaybackState.recovering);

    // A second play while recovering is ignored (incidental engine event).
    expect(machine.send({ type: hostPlaybackEvent.play })).toEqual([]);
  });

  it('defers the repair while in recovery after an explicit seek, without a second recovery attempt', async () => {
    const machine = readyMachine();
    // No play: the source is attached but never started.
    expect(machine.preference).toBe(playbackPreference['never-started']);

    // The explicit scrub is out of window: one restart at the target, no
    // playback requested, one attempt spent.
    const seekDecisions = machine.send({ seconds: 120, type: hostPlaybackEvent.seekOutOfWindow });
    expect(seekDecisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.seek,
        resumeSeconds: 120,
        wantsPlay: false,
      },
    ]);
    expect(machine.current).toBe(hostPlaybackState.recovering);
    expect(machine.attempt).toBe(1);

    // The reloaded load fails to decode again: a never-started source has no
    // play intent, so the failure defers a repair at the failure position
    // instead of a second restart; nothing is surfaced and the budget stays
    // where the seek restart left it.
    const decisions = machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 120,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(decisions).toEqual([
      { kind: hostDecisionKind.deferRepair, reason: recoveryReason.decode, resumeSeconds: 120 },
    ]);
    expect(machine.current).toBe(hostPlaybackState.recovering);
    expect(machine.attempt).toBe(1);
    expect(machine.repairOwed).toEqual({ reason: recoveryReason.decode, seconds: 120 });

    // The module's behaviour-rules summary documents this deferral; the
    // source read needs node:fs, which the browser suite lacks.
    if (typeof document !== 'undefined') return;
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const sourcePath = fileURLToPath(new URL('../host-playback-machine.ts', import.meta.url));
    const source = readFileSync(sourcePath, 'utf8');
    const rules = source.slice(
      source.indexOf('Behaviour rules'),
      source.indexOf('*/', source.indexOf('Behaviour rules')),
    );
    expect(rules).toMatch(/decode failure[\s\S]*never-started/);
  });

  it('an explicit play consumes a deferred repair while the machine is recovering', () => {
    const machine = readyMachine();
    // No play: the source is attached but never started.
    expect(machine.preference).toBe(playbackPreference['never-started']);

    // The explicit scrub is out of window: one restart at the target, no
    // playback requested, one attempt spent.
    machine.send({ seconds: 120, type: hostPlaybackEvent.seekOutOfWindow });
    expect(machine.current).toBe(hostPlaybackState.recovering);
    expect(machine.attempt).toBe(1);

    // The reloaded load fails to decode: a never-started source defers a
    // plain repair at the failure position (no second restart, no budget).
    machine.send({ kind: hostReportKind.decode, resumeSeconds: 120, type: hostPlaybackEvent.loadFailed });
    expect(machine.current).toBe(hostPlaybackState.recovering);
    expect(machine.attempt).toBe(1);
    expect(machine.repairOwed).toEqual({ reason: recoveryReason.decode, seconds: 120 });

    // The explicit play consumes the deferred repair: exactly one restart
    // with wantsPlay true, and no remaining repair.
    const playDecisions = machine.send({ type: hostPlaybackEvent.play });
    expect(playDecisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.decode,
        resumeSeconds: 120,
        wantsPlay: true,
      },
    ]);
    expect(machine.repairOwed).toBeNull();
    expect(machine.attempt).toBe(2);
    expect(machine.current).toBe(hostPlaybackState.recovering);
  });
});

describe('recovery completion', () => {
  it('a load that genuinely plays again restores the recovery budget', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 42.5,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(machine.attempt).toBe(1);
    // The reloaded source is acknowledged and then plays: the budget restores,
    // so the next failure gets a fresh run instead of an instant surfacing.
    machine.send({ type: hostPlaybackEvent.sourceReady });
    machine.send({ type: hostPlaybackEvent.recoverPlayed });
    expect(machine.current).toBe(hostPlaybackState.ready);
    expect(machine.attempt).toBe(0);

    machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 42.5,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(
      machine.send({ kind: hostReportKind.decode, resumeSeconds: 42.5, type: hostPlaybackEvent.loadFailed })
        .length,
    ).toBe(1);
  });

  it('an out-of-window seek restart that resolves closes the recovery window', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ seconds: 120, type: hostPlaybackEvent.seekOutOfWindow });
    expect(machine.current).toBe(hostPlaybackState.recovering);
    expect(machine.attempt).toBe(1);

    // The seek-restart resolves: the target was reachable after all, the
    // restart budget restores and later failures recover normally.
    machine.send({ type: hostPlaybackEvent.seekResolved });
    expect(machine.current).toBe(hostPlaybackState.ready);
    expect(machine.attempt).toBe(0);
  });

  it('a seek-restart resolving during a decode recovery does not spend the budget early', () => {
    // A fresh decoded load's own seek-restart also fires a native `seeked`;
    // that must NOT count as the load having played. Only the playhead
    // advancing again (or a seek-restart resolving) restores the budget, so a
    // persistently broken object keeps consuming the same attempts.
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 12.5,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(machine.attempt).toBe(1);
    machine.send({ type: hostPlaybackEvent.sourceReady });

    machine.send({ type: hostPlaybackEvent.seekResolved });
    expect(machine.current).toBe(hostPlaybackState.recovering);
    expect(machine.attempt).toBe(1);

    // The second failure on the same broken load still reloads (budget 2)...
    machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 12.5,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(machine.attempt).toBe(2);
    // ...and the third is the last one this run allows: it surfaces.
    const decisions = machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 12.5,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(decisions).toEqual([{ error: hostReportKind.decode, kind: hostDecisionKind.reportError }]);
  });
});

describe('out-of-window seek recovery', () => {
  it('an out-of-window seek restarts a paused source at the target without playback', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.pause });

    const decisions = machine.send({ seconds: 120, type: hostPlaybackEvent.seekOutOfWindow });
    expect(decisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.seek,
        resumeSeconds: 120,
        wantsPlay: false,
      },
    ]);
    expect(machine.current).toBe(hostPlaybackState.recovering);
    expect(machine.attempt).toBe(1);
  });

  it('an out-of-window seek restarts a playing source and keeps playing', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    const decisions = machine.send({ seconds: 120, type: hostPlaybackEvent.seekOutOfWindow });
    expect(decisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.seek,
        resumeSeconds: 120,
        wantsPlay: true,
      },
    ]);
  });

  it('shares the restart budget with decode recovery and surfaces when exhausted', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });

    // One decode reload already spent part of the shared budget.
    machine.send({ kind: hostReportKind.decode, resumeSeconds: 5, type: hostPlaybackEvent.loadFailed });
    expect(machine.attempt).toBe(1);

    // A stuck recovery load fails again (budget 2), then exhausts and
    // surfaces a decode-class error.
    machine.send({ kind: hostReportKind.decode, resumeSeconds: 120, type: hostPlaybackEvent.loadFailed });
    expect(machine.attempt).toBe(2);
    const decisions = machine.send({ kind: hostReportKind.decode, resumeSeconds: 120, type: hostPlaybackEvent.loadFailed });
    expect(decisions).toEqual([{ error: hostReportKind.decode, kind: hostDecisionKind.reportError }]);
    expect(machine.current).toBe(hostPlaybackState.failed);
  });
});

describe('an explicit play during an in-flight seek recovery', () => {
  it('is honored on a paused seek recovery so a chained recovery resumes', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ type: hostPlaybackEvent.pause });
    machine.send({ type: hostPlaybackEvent.pauseConfirmed });
    expect(machine.preference).toBe(playbackPreference.paused);

    const first = machine.send({ seconds: 120, type: hostPlaybackEvent.seekOutOfWindow });
    expect(first).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.seek,
        resumeSeconds: 120,
        wantsPlay: false,
      },
    ]);
    expect(machine.current).toBe(hostPlaybackState.recovering);

    // The user presses play while the recovery is still in flight. The
    // recovering transition must record the fresh intent; a no-op here is
    // exactly the loss the chained restart then repeats.
    machine.send({ type: hostPlaybackEvent.play });
    expect(machine.preference).toBe(playbackPreference.playing);

    // The replacement load fails while the user now wants play: the chained
    // recovery must restart playing, not defer behind the stale paused choice.
    const chained = machine.send({ kind: hostReportKind.decode, resumeSeconds: 120, type: hostPlaybackEvent.loadFailed });
    expect(chained).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.decode,
        resumeSeconds: 120,
        wantsPlay: true,
      },
    ]);
    expect(machine.current).toBe(hostPlaybackState.recovering);
  });

  it('leaves an already-playing recovery unchanged when another play lands', () => {
    // A play during a recovery the engine is already resuming (wantsPlay=true)
    // is the recovery's own resume: the choice is already playing, so the
    // event must not disturb the in-flight decision.
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ seconds: 120, type: hostPlaybackEvent.seekOutOfWindow });
    expect(machine.current).toBe(hostPlaybackState.recovering);
    expect(machine.preference).toBe(playbackPreference.playing);

    machine.send({ type: hostPlaybackEvent.play });
    expect(machine.preference).toBe(playbackPreference.playing);
    expect(machine.send({ kind: hostReportKind.decode, resumeSeconds: 120, type: hostPlaybackEvent.loadFailed })).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.decode,
        resumeSeconds: 120,
        wantsPlay: true,
      },
    ]);
  });
});

describe('a transient MSE append/quota failure (quota kind)', () => {
  it('is terminal while playing: surfaces immediately, never a decode-style restart or budget spend', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    expect(machine.attempt).toBe(0);

    // A quota refusal (memory pressure the pipe's bounded eviction retries
    // could not clear) must not collapse into the decode recovery: no
    // reposition-and-resume reload, and no recovery budget consumed.
    const decisions = machine.send({
      kind: hostReportKind.quota,
      resumeSeconds: 42.5,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(decisions).toEqual([{ error: hostReportKind.quota, kind: hostDecisionKind.reportError }]);
    expect(machine.current).toBe(hostPlaybackState.failed);
    expect(machine.attempt).toBe(0);

    // Quota leaves nothing owed (a terminal, non-repairable incident like an
    // unsupported container): an explicit play cannot conjure a fresh load.
    expect(machine.send({ type: hostPlaybackEvent.play })).toEqual([]);
    expect(machine.current).toBe(hostPlaybackState.failed);

    // A fresh source restarts everything; a genuine decode failure then spends
    // the budget from zero, proving quota never consumed a decode attempt.
    machine.send({ type: hostPlaybackEvent.sourceSet });
    machine.send({ type: hostPlaybackEvent.sourceReady });
    machine.send({ type: hostPlaybackEvent.play });
    expect(machine.attempt).toBe(0);
    const restart = machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 42.5,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(restart).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.decode,
        resumeSeconds: 42.5,
        wantsPlay: true,
      },
    ]);
    expect(machine.attempt).toBe(1);
  });

  it('is terminal even on a paused or never-started source (unlike decode, which defers)', () => {
    // Paused: a decode failure would defer a repair. A quota refusal stays
    // terminal: there is no load to repair behind a paused user, and the pipe
    // already exhausted its own memory recovery.
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ type: hostPlaybackEvent.pause });
    machine.send({ type: hostPlaybackEvent.pauseConfirmed });

    const decisions = machine.send({
      kind: hostReportKind.quota,
      resumeSeconds: 12.5,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(decisions).toEqual([{ error: hostReportKind.quota, kind: hostDecisionKind.reportError }]);
    expect(machine.current).toBe(hostPlaybackState.failed);
    expect(machine.attempt).toBe(0);
    expect(machine.repairOwed).toBeNull();
  });
});

describe('the churn guard on repeating auto recovery incidents', () => {
  it('stops auto-recovering a load that keeps failing-and-playing within a short burst', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });

    // A flappy load: the recovery genuinely plays each time (so the ordinary
    // budget restores), but the same incident keeps repeating within seconds.
    // Each cycle is an automatic decode restart followed by a genuine play.
    const fail = (): HostDecision[] =>
      machine.send({ kind: hostReportKind.decode, resumeSeconds: 42.5, type: hostPlaybackEvent.loadFailed });
    const recoverAndPlay = (): void => {
      machine.send({ type: hostPlaybackEvent.sourceReady });
      machine.send({ type: hostPlaybackEvent.recoverPlayed });
    };

    expect(fail().at(0)).toMatchObject({ kind: hostDecisionKind.restartSource });
    recoverAndPlay();
    expect(fail().at(0)).toMatchObject({ kind: hostDecisionKind.restartSource });
    recoverAndPlay();
    expect(fail().at(0)).toMatchObject({ kind: hostDecisionKind.restartSource });
    recoverAndPlay();

    // Within the session, the automatic recoveries exhaust: the next failure
    // surfaces instead of spending yet another restored budget on the same
    // broken object.
    const exhausted = fail();
    expect(exhausted).toEqual([{ error: hostReportKind.decode, kind: hostDecisionKind.reportError }]);
    expect(machine.current).toBe(hostPlaybackState.failed);
  });

  it('bounds recurring automatic restarts spaced 50 to 51s apart (cadence regression)', () => {
    vi.useFakeTimers();
    try {
      // Both an automatic decode restart and a native-element restart of the
      // same broken load must stay bounded while the incidents recur on a
      // recovery cycle inside the session reset, whatever cadence the cycle
      // takes.
      const triggers: ((machine: HostPlaybackMachine) => HostDecision[])[] = [
        (machine) =>
          machine.send({ kind: hostReportKind.decode, resumeSeconds: 42.5, type: hostPlaybackEvent.loadFailed }),
        (machine) => machine.send({ resumeSeconds: 42.5, type: hostPlaybackEvent.nativeError }),
      ];
      // The cadence steps the test exercises: 50s and 51s apart.
      const cadences = [50_000, 50_500, 51_000];

      for (const cadenceMs of cadences) {
        for (const trigger of triggers) {
          const machine = readyMachine();
          machine.send({ type: hostPlaybackEvent.play });
          vi.setSystemTime(1_000_000);

          const recoverAndPlay = (): void => {
            machine.send({ type: hostPlaybackEvent.sourceReady });
            machine.send({ type: hostPlaybackEvent.recoverPlayed });
          };

          // Three automatic recoveries at the cadence are allowed...
          for (let cycle = 0; cycle < 3; cycle += 1) {
            expect(trigger(machine).at(0)).toMatchObject({ kind: hostDecisionKind.restartSource });
            recoverAndPlay();
            vi.setSystemTime(1_000_000 + (cycle + 1) * cadenceMs);
          }
          // ...but the fourth, still inside the same sick session, surfaces
          // instead of auto-recovering yet again. A sliding window shorter
          // than the gap between incidents lets each one age out before the
          // next arrives and could never bound this; a session that only
          // resets after sustained stable playback must.
          const exhausted = trigger(machine);
          expect(exhausted).toEqual([{ error: hostReportKind.decode, kind: hostDecisionKind.reportError }]);
          expect(machine.current).toBe(hostPlaybackState.failed);
        }
      }
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps recovering genuinely sparse incidents that are each followed by sustained stable playback', () => {
    vi.useFakeTimers();
    try {
      const machine = readyMachine();
      machine.send({ type: hostPlaybackEvent.play });
      vi.setSystemTime(1_000_000);

      const cycles = (): boolean =>
        machine.send({ kind: hostReportKind.decode, resumeSeconds: 42.5, type: hostPlaybackEvent.loadFailed }).some(
          (decision) => decision.kind === hostDecisionKind.restartSource,
        );

      // Genuinely sparse recoveries, each followed by a healthy stretch of
      // stable playback far beyond the session reset, must keep being
      // repaired: every incident starts a fresh session of one, so the
      // budget never exhausts no matter how many sparse events arrive.
      for (let index = 0; index < 4; index += 1) {
        expect(cycles()).toBe(true);
        machine.send({ type: hostPlaybackEvent.sourceReady });
        machine.send({ type: hostPlaybackEvent.recoverPlayed });
        vi.setSystemTime(1_000_000 + (index + 1) * 10 * 60_000);
      }
      expect(cycles()).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('transport failure', () => {
  it('surfaces a network error without reloading, then a fresh source starts on explicit play', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });

    // The reader retries were already exhausted; the host must not reload.
    const decisions = machine.send({
      kind: hostReportKind.network,
      resumeSeconds: 8,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(decisions).toEqual([{ error: hostReportKind.network, kind: hostDecisionKind.reportError }]);
    expect(machine.current).toBe(hostPlaybackState.failed);
    expect(machine.attempt).toBe(0);

    // The explicit play starts a fresh source from where the network died.
    const restart = machine.send({ type: hostPlaybackEvent.play });
    expect(restart).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.network,
        resumeSeconds: 8,
        wantsPlay: true,
      },
    ]);
    expect(machine.current).toBe(hostPlaybackState.recovering);
  });

  it('also waits inside the failure for an explicit seek to start a fresh source paused', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({
      kind: hostReportKind.network,
      resumeSeconds: 8,
      type: hostPlaybackEvent.loadFailed,
    });

    const decisions = machine.send({ seconds: 30, type: hostPlaybackEvent.seek });
    expect(decisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.network,
        resumeSeconds: 30,
        wantsPlay: false,
      },
    ]);
  });
});

describe('an unsupported container', () => {
  it('is terminal: the error surfaces, no repair is owed, and an explicit play stays failed', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });

    const decisions = machine.send({
      kind: hostReportKind.unsupported,
      resumeSeconds: 8,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(decisions).toEqual([{ error: hostReportKind.unsupported, kind: hostDecisionKind.reportError }]);
    expect(machine.current).toBe(hostPlaybackState.failed);
    expect(machine.attempt).toBe(0);
    expect(machine.repairOwed).toBeNull();

    // An unsupported container cannot be repaired, so an explicit play must
    // not restart the identical source: no decision and the state stays failed.
    expect(machine.send({ type: hostPlaybackEvent.play })).toEqual([]);
    expect(machine.current).toBe(hostPlaybackState.failed);

    // The same for an explicit seek: no fresh load attempt.
    expect(machine.send({ seconds: 30, type: hostPlaybackEvent.seek })).toEqual([]);
    expect(machine.current).toBe(hostPlaybackState.failed);
  });
});

describe('moving between sources', () => {
  it('a fresh source drops every trace of the previous recovery', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 12.5,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(machine.attempt).toBe(1);

    const decisions = machine.send({ type: hostPlaybackEvent.sourceSet });
    expect(decisions).toEqual([]);
    expect(machine.current).toBe(hostPlaybackState.loading);
    expect(machine.preference).toBe(playbackPreference['never-started']);
    expect(machine.attempt).toBe(0);
    expect(machine.repairOwed).toBeNull();
  });

  it('a re-attach rebuilds the same load without losing the playback choice', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });

    const decisions = machine.send({ type: hostPlaybackEvent.sourceAttach });
    expect(decisions).toEqual([]);
    expect(machine.current).toBe(hostPlaybackState.loading);
    expect(machine.preference).toBe(playbackPreference.playing);
    expect(machine.attempt).toBe(0);
  });

  it('a native failure on an idle never-started load still repairs it eagerly without playing', () => {
    const machine = readyMachine();
    const decisions = machine.send({ resumeSeconds: 0, type: hostPlaybackEvent.nativeError });
    expect(decisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.native,
        resumeSeconds: 0,
        wantsPlay: false,
      },
    ]);
  });
});

describe('a pause that starts a seek is provisional, not a user stop', () => {
  it('a seek that starts by pausing a playing video still restarts with playback requested', () => {
    // video.js emits a native `pause` BEFORE `seeking` on a far scrub of a
    // playing element. That pause is engine work (the seek), not the user
    // stopping, so the restart that follows must still want play.
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ type: hostPlaybackEvent.pause });
    expect(machine.current).toBe(hostPlaybackState.pausePending);
    expect(machine.preference).toBe(playbackPreference.playing);

    const decisions = machine.send({ seconds: 120, type: hostPlaybackEvent.seekOutOfWindow });
    expect(decisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.seek,
        resumeSeconds: 120,
        wantsPlay: true,
      },
    ]);
    expect(machine.current).toBe(hostPlaybackState.recovering);
  });

  it('pressing pause without seeking leaves the video paused after the pause settles', () => {
    // The provisional pause only becomes the user's choice once the next task
    // confirms it with no seek in between.
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ type: hostPlaybackEvent.pause });
    expect(machine.preference).toBe(playbackPreference.playing);

    const decisions = machine.send({ type: hostPlaybackEvent.pauseConfirmed });
    expect(decisions).toEqual([]);
    expect(machine.current).toBe(hostPlaybackState.ready);
    expect(machine.preference).toBe(playbackPreference.paused);
  });

  it('seeking after a deliberate pause stays paused', () => {
    // Once the pause has settled as deliberate, a scrub that follows repairs
    // the position without starting playback.
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ type: hostPlaybackEvent.pause });
    machine.send({ type: hostPlaybackEvent.pauseConfirmed });

    const decisions = machine.send({ seconds: 120, type: hostPlaybackEvent.seekOutOfWindow });
    expect(decisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.seek,
        resumeSeconds: 120,
        wantsPlay: false,
      },
    ]);
  });

  it('a play after the provisional pause wins over the pending confirmation', () => {
    // The seek's resume lands a native `play`; it must take the machine out of
    // the pending window and back to playing without waiting for the confirm.
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ type: hostPlaybackEvent.pause });
    machine.send({ type: hostPlaybackEvent.play });
    expect(machine.current).toBe(hostPlaybackState.ready);
    expect(machine.preference).toBe(playbackPreference.playing);
  });

  it('an already-paused element sees another pause as a no-op, never a pending window', () => {
    // `ready` + already-paused + pause stays paused directly; there is no
    // provisional window to open for an element that was never playing.
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ type: hostPlaybackEvent.pause });
    machine.send({ type: hostPlaybackEvent.pauseConfirmed });
    machine.send({ type: hostPlaybackEvent.pause });
    expect(machine.current).toBe(hostPlaybackState.ready);
    expect(machine.preference).toBe(playbackPreference.paused);
  });
});

describe('document visibility deferring automatic recovery', () => {
  it('tracks document visibility from the visibility events', () => {
    const machine = readyMachine();
    expect(machine.visible).toBe(true);
    machine.send({ type: hostPlaybackEvent.visibilityHidden });
    expect(machine.visible).toBe(false);
    machine.send({ type: hostPlaybackEvent.visibilityVisible });
    expect(machine.visible).toBe(true);
  });

  it('defers a playing decode recovery while hidden and spends no budget; visibility returning consumes it once', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ type: hostPlaybackEvent.visibilityHidden });

    const decisions = machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 42.5,
      type: hostPlaybackEvent.loadFailed,
    });
    // No restart while the worker may be throttled: the repair is recorded and
    // the budget is untouched.
    expect(decisions).toEqual([
      { kind: hostDecisionKind.deferRepair, reason: recoveryReason.decode, resumeSeconds: 42.5 },
    ]);
    expect(machine.current).toBe(hostPlaybackState.ready);
    expect(machine.attempt).toBe(0);
    expect(machine.repairOwed).toEqual({
      reason: recoveryReason.decode,
      resumeOnVisible: true,
      seconds: 42.5,
      wantsPlay: true,
    });

    // Visibility returns: the automatic recovery is consumed exactly once.
    const visibleDecisions = machine.send({ type: hostPlaybackEvent.visibilityVisible });
    expect(visibleDecisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.decode,
        resumeSeconds: 42.5,
        wantsPlay: true,
      },
    ]);
    expect(machine.current).toBe(hostPlaybackState.recovering);
    expect(machine.attempt).toBe(1);
    expect(machine.repairOwed).toBeNull();

    // A repeated visibility event must not restart a second time.
    expect(machine.send({ type: hostPlaybackEvent.visibilityVisible })).toEqual([]);
  });

  it('does not consume a user-paused repair when visibility returns', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ type: hostPlaybackEvent.pause });
    machine.send({ type: hostPlaybackEvent.pauseConfirmed });
    machine.send({ kind: hostReportKind.decode, resumeSeconds: 12.5, type: hostPlaybackEvent.loadFailed });
    expect(machine.repairOwed).toEqual({ reason: recoveryReason.decode, seconds: 12.5 });

    // The paused user's repair is not an automatic recovery: visibility
    // returning must leave it parked for the explicit play/seek that owns it.
    expect(machine.send({ type: hostPlaybackEvent.visibilityVisible })).toEqual([]);
    expect(machine.repairOwed).toEqual({ reason: recoveryReason.decode, seconds: 12.5 });
    expect(machine.current).toBe(hostPlaybackState.ready);
  });

  it('repeated hidden decode failures never spend budget and one visibility consumes the latest repair only', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ type: hostPlaybackEvent.visibilityHidden });

    machine.send({ kind: hostReportKind.decode, resumeSeconds: 1, type: hostPlaybackEvent.loadFailed });
    expect(machine.attempt).toBe(0);
    machine.send({ kind: hostReportKind.decode, resumeSeconds: 2, type: hostPlaybackEvent.loadFailed });
    expect(machine.attempt).toBe(0);
    expect(machine.repairOwed?.seconds).toBe(2);

    // Exactly one consume on visible.
    machine.send({ type: hostPlaybackEvent.visibilityVisible });
    expect(machine.attempt).toBe(1);
    expect(machine.current).toBe(hostPlaybackState.recovering);
    expect(machine.repairOwed).toBeNull();
  });

  it('an out-of-window seek while hidden defers and restarts on visible with the stored play choice', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ type: hostPlaybackEvent.visibilityHidden });

    machine.send({ seconds: 120, type: hostPlaybackEvent.seekOutOfWindow });
    expect(machine.attempt).toBe(0);
    expect(machine.current).toBe(hostPlaybackState.ready);

    const decisions = machine.send({ type: hostPlaybackEvent.visibilityVisible });
    expect(decisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.seek,
        resumeSeconds: 120,
        wantsPlay: true,
      },
    ]);
    expect(machine.attempt).toBe(1);
  });

  it('a hidden phase never lifts the budget cap that visible-phase restarts already drained', () => {
    // Two visible-phase decode restarts drain the budget; the third failure
    // surfaces even while hidden again: hidden phases never spend, but a
    // budget drained while visible still caps the run (no indefinite loop).
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ kind: hostReportKind.decode, resumeSeconds: 5, type: hostPlaybackEvent.loadFailed }); // 1
    machine.send({ type: hostPlaybackEvent.sourceReady });
    machine.send({ kind: hostReportKind.decode, resumeSeconds: 5, type: hostPlaybackEvent.loadFailed }); // 2
    expect(machine.attempt).toBe(2);

    machine.send({ type: hostPlaybackEvent.visibilityHidden });
    const decisions = machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 5,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(decisions).toEqual([{ error: hostReportKind.decode, kind: hostDecisionKind.reportError }]);
  });

  it('a fresh source while hidden keeps the hidden visibility instead of resetting it', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ type: hostPlaybackEvent.visibilityHidden });

    machine.send({ type: hostPlaybackEvent.sourceSet });
    expect(machine.visible).toBe(false);
    expect(machine.preference).toBe(playbackPreference['never-started']);
    expect(machine.attempt).toBe(0);
  });

  it('a paused machine whose far seek was parked while hidden restarts paused on visible', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ type: hostPlaybackEvent.pause });
    machine.send({ type: hostPlaybackEvent.pauseConfirmed });
    machine.send({ type: hostPlaybackEvent.visibilityHidden });

    machine.send({ seconds: 120, type: hostPlaybackEvent.seekOutOfWindow });
    expect(machine.attempt).toBe(0);
    expect(machine.preference).toBe(playbackPreference.paused);

    const decisions = machine.send({ type: hostPlaybackEvent.visibilityVisible });
    // The parked restore keeps the paused user's choice: no auto-play.
    expect(decisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.seek,
        resumeSeconds: 120,
        wantsPlay: false,
      },
    ]);
  });
});

describe('a repair parked while the document is hidden', () => {
  /** The common parked-repair setup: a playing load with the document hidden. */
  function hiddenPlaying(): HostPlaybackMachine {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ type: hostPlaybackEvent.visibilityHidden });
    return machine;
  }

  it('a user pause that settles after the park keeps the load paused on the visible restart', () => {
    // The park-time snapshot said playing, but the user's deliberate pause
    // (the two-phase one) settled while the repair was parked: the restart
    // on visible must resolve the play choice from the current preference,
    // not from that snapshot, or it would auto-play against the user pause.
    const machine = hiddenPlaying();
    machine.send({ kind: hostReportKind.decode, resumeSeconds: 42.5, type: hostPlaybackEvent.loadFailed });
    expect(machine.repairOwed).toEqual({
      reason: recoveryReason.decode,
      resumeOnVisible: true,
      seconds: 42.5,
      wantsPlay: true,
    });

    machine.send({ type: hostPlaybackEvent.pause });
    machine.send({ type: hostPlaybackEvent.pauseConfirmed });
    expect(machine.preference).toBe(playbackPreference.paused);
    expect(machine.current).toBe(hostPlaybackState.ready);

    const decisions = machine.send({ type: hostPlaybackEvent.visibilityVisible });
    expect(decisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.decode,
        resumeSeconds: 42.5,
        wantsPlay: false,
      },
    ]);
    expect(machine.current).toBe(hostPlaybackState.recovering);
    expect(machine.attempt).toBe(1);
  });

  it('a hidden load that keeps failing surfaces once its recovery session saturates', () => {
    // Each hidden failure parks (spending no budget), and each park must
    // count against the in-session churn ledger exactly like the visible
    // restart it replaces: the consume on visible, the brief play, and the
    // budget restore must not let a flapping hidden load loop past
    // MAX_CONSECUTIVE_AUTO_RECOVERIES.
    const triggers: ((machine: HostPlaybackMachine) => HostDecision[])[] = [
      (machine) =>
        machine.send({ kind: hostReportKind.decode, resumeSeconds: 42.5, type: hostPlaybackEvent.loadFailed }),
      (machine) => machine.send({ resumeSeconds: 42.5, type: hostPlaybackEvent.nativeError }),
    ];

    for (const trigger of triggers) {
      const machine = hiddenPlaying();

      for (let cycle = 0; cycle < 3; cycle += 1) {
        const parked = trigger(machine);
        expect(parked.at(0)).toMatchObject({ kind: hostDecisionKind.deferRepair });
        expect(machine.attempt).toBe(0);
        expect(machine.current).toBe(hostPlaybackState.ready);

        // The park is consumed on visible, the load plays, the budget
        // restores, and the document hides again: one sick session.
        expect(machine.send({ type: hostPlaybackEvent.visibilityVisible }).at(0)).toMatchObject({
          kind: hostDecisionKind.restartSource,
        });
        machine.send({ type: hostPlaybackEvent.sourceReady });
        machine.send({ type: hostPlaybackEvent.recoverPlayed });
        expect(machine.attempt).toBe(0);
        machine.send({ type: hostPlaybackEvent.visibilityHidden });
      }

      // The fourth incident inside the session saturates it: the hidden
      // failure surfaces instead of parking for a restart the throttled
      // worker would never finish.
      const decisions = trigger(machine);
      expect(decisions).toEqual([{ error: hostReportKind.decode, kind: hostDecisionKind.reportError }]);
      expect(machine.current).toBe(hostPlaybackState.failed);
    }
  });

  it('a saturated session surfaces a hidden failure before the hidden park catches it', () => {
    // Three visible flaps saturate the session.
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    for (let index = 0; index < 3; index += 1) {
      machine.send({ kind: hostReportKind.decode, resumeSeconds: 42.5, type: hostPlaybackEvent.loadFailed });
      machine.send({ type: hostPlaybackEvent.sourceReady });
      machine.send({ type: hostPlaybackEvent.recoverPlayed });
    }

    machine.send({ type: hostPlaybackEvent.visibilityHidden });
    const decisions = machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 42.5,
      type: hostPlaybackEvent.loadFailed,
    });
    // Parking a saturated session would let it run on, so the failure
    // surfaces even with the document hidden.
    expect(decisions).toEqual([{ error: hostReportKind.decode, kind: hostDecisionKind.reportError }]);
    expect(machine.current).toBe(hostPlaybackState.failed);
  });

  it('a hidden play while a repair is parked records the choice without spending an attempt', () => {
    // A play that lands while the document is hidden (a lock-screen resume)
    // must not restart on the throttled worker: the parked restart stays
    // owed, the preference flips, and visibility returning is the only
    // thing that spends the attempt.
    const machine = hiddenPlaying();
    machine.send({ kind: hostReportKind.decode, resumeSeconds: 42.5, type: hostPlaybackEvent.loadFailed });
    expect(machine.repairOwed?.resumeOnVisible).toBe(true);

    const decisions = machine.send({ type: hostPlaybackEvent.play });
    expect(decisions).toEqual([
      { kind: hostDecisionKind.deferRepair, reason: recoveryReason.decode, resumeSeconds: 42.5 },
    ]);
    expect(machine.current).toBe(hostPlaybackState.ready);
    expect(machine.attempt).toBe(0);
    expect(machine.preference).toBe(playbackPreference.playing);
    expect(machine.repairOwed).toEqual({
      reason: recoveryReason.decode,
      resumeOnVisible: true,
      seconds: 42.5,
      wantsPlay: true,
    });

    const visibleDecisions = machine.send({ type: hostPlaybackEvent.visibilityVisible });
    expect(visibleDecisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.decode,
        resumeSeconds: 42.5,
        wantsPlay: true,
      },
    ]);
    expect(machine.attempt).toBe(1);
    expect(machine.repairOwed).toBeNull();
  });

  it('a hidden scrub while a repair is parked re-parks it at the scrub position', () => {
    // A scrub in a hidden tab (media-session seeking) must not spend an
    // attempt on the throttled worker either: the parked repair moves to
    // the new position with the current play choice, and visibility
    // returning restores the latest scrub, not the stale one.
    const machine = hiddenPlaying();
    machine.send({ kind: hostReportKind.decode, resumeSeconds: 42.5, type: hostPlaybackEvent.loadFailed });

    const decisions = machine.send({ seconds: 100, type: hostPlaybackEvent.seek });
    expect(decisions).toEqual([
      { kind: hostDecisionKind.deferRepair, reason: recoveryReason.decode, resumeSeconds: 100 },
    ]);
    expect(machine.current).toBe(hostPlaybackState.ready);
    expect(machine.attempt).toBe(0);
    expect(machine.repairOwed).toEqual({
      reason: recoveryReason.decode,
      resumeOnVisible: true,
      seconds: 100,
      wantsPlay: true,
    });

    const visibleDecisions = machine.send({ type: hostPlaybackEvent.visibilityVisible });
    expect(visibleDecisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.decode,
        resumeSeconds: 100,
        wantsPlay: true,
      },
    ]);
    expect(machine.attempt).toBe(1);
  });

  it('a hidden out-of-window scrub while a repair is parked re-parks it without spending budget', () => {
    const machine = hiddenPlaying();
    machine.send({ kind: hostReportKind.decode, resumeSeconds: 42.5, type: hostPlaybackEvent.loadFailed });

    const decisions = machine.send({ seconds: 120, type: hostPlaybackEvent.seekOutOfWindow });
    expect(decisions).toEqual([
      { kind: hostDecisionKind.deferRepair, reason: recoveryReason.decode, resumeSeconds: 120 },
    ]);
    expect(machine.current).toBe(hostPlaybackState.ready);
    expect(machine.attempt).toBe(0);
    expect(machine.repairOwed).toEqual({
      reason: recoveryReason.decode,
      resumeOnVisible: true,
      seconds: 120,
      wantsPlay: true,
    });

    const visibleDecisions = machine.send({ type: hostPlaybackEvent.visibilityVisible });
    expect(visibleDecisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.decode,
        resumeSeconds: 120,
        wantsPlay: true,
      },
    ]);
    expect(machine.attempt).toBe(1);
  });

  it('a hidden play on a paused-parked repair restarts playing when visibility returns', () => {
    // The park-time snapshot said paused, but the user resumed while the
    // document was hidden: the re-parked choice is the current one, so the
    // visible restart plays.
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ type: hostPlaybackEvent.pause });
    machine.send({ type: hostPlaybackEvent.pauseConfirmed });
    machine.send({ type: hostPlaybackEvent.visibilityHidden });

    machine.send({ seconds: 120, type: hostPlaybackEvent.seekOutOfWindow });
    expect(machine.repairOwed).toEqual({
      reason: recoveryReason.seek,
      resumeOnVisible: true,
      seconds: 120,
      wantsPlay: false,
    });

    const decisions = machine.send({ type: hostPlaybackEvent.play });
    expect(decisions).toEqual([
      { kind: hostDecisionKind.deferRepair, reason: recoveryReason.seek, resumeSeconds: 120 },
    ]);
    expect(machine.preference).toBe(playbackPreference.playing);
    expect(machine.attempt).toBe(0);
    expect(machine.repairOwed).toEqual({
      reason: recoveryReason.seek,
      resumeOnVisible: true,
      seconds: 120,
      wantsPlay: true,
    });

    const visibleDecisions = machine.send({ type: hostPlaybackEvent.visibilityVisible });
    expect(visibleDecisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.seek,
        resumeSeconds: 120,
        wantsPlay: true,
      },
    ]);
    expect(machine.attempt).toBe(1);
  });

  it('a hidden scrub on a paused-parked repair keeps the paused choice at the new position', () => {
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ type: hostPlaybackEvent.pause });
    machine.send({ type: hostPlaybackEvent.pauseConfirmed });
    machine.send({ type: hostPlaybackEvent.visibilityHidden });

    machine.send({ seconds: 120, type: hostPlaybackEvent.seekOutOfWindow });
    expect(machine.attempt).toBe(0);

    const decisions = machine.send({ seconds: 90, type: hostPlaybackEvent.seek });
    expect(decisions).toEqual([
      { kind: hostDecisionKind.deferRepair, reason: recoveryReason.seek, resumeSeconds: 90 },
    ]);
    expect(machine.current).toBe(hostPlaybackState.ready);
    expect(machine.attempt).toBe(0);
    expect(machine.repairOwed).toEqual({
      reason: recoveryReason.seek,
      resumeOnVisible: true,
      seconds: 90,
      wantsPlay: false,
    });

    // The user never chose to play, so the visible restart stays paused.
    const visibleDecisions = machine.send({ type: hostPlaybackEvent.visibilityVisible });
    expect(visibleDecisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.seek,
        resumeSeconds: 90,
        wantsPlay: false,
      },
    ]);
    expect(machine.attempt).toBe(1);
  });

  it('an explicit play while hidden still consumes a user-paused repair', () => {
    // The hidden-parked protection applies only to repairs parked FOR the
    // visibility return: a repair recorded for a user-paused load (no
    // resumeOnVisible mark) stays explicit-action-owned and is consumed by
    // a play even while the document is hidden.
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ type: hostPlaybackEvent.pause });
    machine.send({ type: hostPlaybackEvent.pauseConfirmed });
    machine.send({ type: hostPlaybackEvent.visibilityHidden });
    machine.send({ kind: hostReportKind.decode, resumeSeconds: 12.5, type: hostPlaybackEvent.loadFailed });
    expect(machine.repairOwed).toEqual({ reason: recoveryReason.decode, seconds: 12.5 });

    const decisions = machine.send({ type: hostPlaybackEvent.play });
    expect(decisions).toEqual([
      {
        kind: hostDecisionKind.restartSource,
        reason: recoveryReason.decode,
        resumeSeconds: 12.5,
        wantsPlay: true,
      },
    ]);
    expect(machine.current).toBe(hostPlaybackState.recovering);
    expect(machine.attempt).toBe(1);
  });

  it('hidden far-seek parks do not count as churn incidents', () => {
    // User far-seek restarts never feed the in-session churn ledger, and the
    // hidden park of the same restart does not either: hidden far scrubs
    // that each resolve on visibility must not saturate the session, or
    // the first decode failure after them would surface instead of being
    // repaired.
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });
    machine.send({ type: hostPlaybackEvent.visibilityHidden });

    for (let index = 0; index < 3; index += 1) {
      machine.send({ seconds: 120, type: hostPlaybackEvent.seekOutOfWindow });
      expect(machine.attempt).toBe(0);
      machine.send({ type: hostPlaybackEvent.visibilityVisible });
      machine.send({ type: hostPlaybackEvent.sourceReady });
      machine.send({ type: hostPlaybackEvent.recoverPlayed });
      expect(machine.current).toBe(hostPlaybackState.ready);
      machine.send({ type: hostPlaybackEvent.visibilityHidden });
    }

    const decisions = machine.send({
      kind: hostReportKind.decode,
      resumeSeconds: 5,
      type: hostPlaybackEvent.loadFailed,
    });
    expect(decisions.at(0)).toMatchObject({ kind: hostDecisionKind.deferRepair });
  });

  it('a hidden parked repair in recovering remains deferred on an explicit play', () => {
    // A decode failure that parks a repair while the document is hidden and
    // the machine is already recovering must not be consumed by an explicit
    // play: the restart stays owed to the visibility return.
    const machine = readyMachine();
    machine.send({ type: hostPlaybackEvent.play });

    // A decode failure starts a recovery restart (attempt 1).
    machine.send({ kind: hostReportKind.decode, resumeSeconds: 42.5, type: hostPlaybackEvent.loadFailed });
    expect(machine.current).toBe(hostPlaybackState.recovering);
    expect(machine.attempt).toBe(1);

    // The document hides while the recovery is in flight.
    machine.send({ type: hostPlaybackEvent.visibilityHidden });
    expect(machine.visible).toBe(false);

    // A second decode failure while hidden in recovering parks a hidden
    // repair (resumeOnVisible: true) instead of spending more budget.
    machine.send({ kind: hostReportKind.decode, resumeSeconds: 42.5, type: hostPlaybackEvent.loadFailed });
    expect(machine.current).toBe(hostPlaybackState.recovering);
    expect(machine.attempt).toBe(1);
    expect(machine.repairOwed).toEqual({
      reason: recoveryReason.decode,
      resumeOnVisible: true,
      seconds: 42.5,
      wantsPlay: true,
    });

    // An explicit play while the hidden-parked repair is in place must NOT
    // consume it: the restart stays owed to the visibility return.
    const playDecisions = machine.send({ type: hostPlaybackEvent.play });
    expect(playDecisions).toEqual([
      { kind: hostDecisionKind.deferRepair, reason: recoveryReason.decode, resumeSeconds: 42.5 },
    ]);
    expect(machine.current).toBe(hostPlaybackState.recovering);
    expect(machine.attempt).toBe(1);
    expect(machine.repairOwed).toEqual({
      reason: recoveryReason.decode,
      resumeOnVisible: true,
      seconds: 42.5,
      wantsPlay: true,
    });
  });
});
