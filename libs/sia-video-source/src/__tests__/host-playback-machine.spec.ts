/**
 * The Robot3 recovery decision machine for the SiaVideoSource host (see
 * `host-playback-machine.ts`). These specs run with no DOM and no worker: the
 * machine records decisions, `SiaVideoSource` performs the effects. State
 * names may appear in the describe blocks; the individual tests name behavior
 * a user sees or an engineer relies on.
 */
import { describe, expect, it } from 'vitest';
import {
  hostDecisionKind,
  hostPlaybackEvent,
  HostPlaybackMachine,
  hostPlaybackState,
  hostReportKind,
  playbackPreference,
  recoveryReason,
} from '../host-playback-machine.ts';

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

    // A stuck far seek restarts once more (budget 2), then exhausts and
    // surfaces a decode-class error.
    machine.send({ seconds: 120, type: hostPlaybackEvent.stalledSeek });
    expect(machine.attempt).toBe(2);
    const decisions = machine.send({ seconds: 120, type: hostPlaybackEvent.stalledSeek });
    expect(decisions).toEqual([{ error: hostReportKind.decode, kind: hostDecisionKind.reportError }]);
    expect(machine.current).toBe(hostPlaybackState.failed);
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
