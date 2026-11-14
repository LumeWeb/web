# 0013: keep playback recovery with the host's play intent

## Status

Accepted (implemented in `libs/sia-video-source`)

## Context

A Sia read can stall, a download can lack enough shards, or MSE can fail
after a source has opened. Restarting every failure loses a user's pause and can loop
on an object that briefly plays before failing again. A seek can also need a
new conversion window while the worker is opening or recovering a source.
The host has the media element's play intent and visibility state; the reader
and worker do not.

## Decision

`src/host-playback-machine.ts` records recovery decisions for each
`SiaVideoSource`. The host performs the resulting effects and owns the media
element, MSE, and worker messages. The machine does not retain DOM objects or
request IDs.

`RangedReader` retries eligible failed downloads within a read window before
a failure reaches the host. Stalls and shard shortages do not enter that retry
loop. The host can restart an active load after a decode,
read-stalled, or shard-shortage failure. A generic network failure is terminal
until a user acts. A paused or never-started load with a recoverable failure
records a repair rather than starting playback. The next explicit play
restarts at the saved position and resumes; an explicit seek restarts at the
new target without choosing to play. A far seek can itself require a source
restart. Incidental media events from a replaced resource must not override a
user pause during recovery.

`MAX_RECOVERY_ATTEMPTS` permits two consecutive recovery restarts for a load.
Reopening a source does not restore that budget: the recovered load must
actually play again or resolve its repositioning seek. A second limit,
`MAX_CONSECUTIVE_AUTO_RECOVERIES`, permits three automatic incidents in one
recovery session, even if each restart briefly succeeds. Sustained playback
without another automatic failure for `AUTO_RECOVERY_STABLE_RESET_MS` (five
minutes) ends that session. A fresh source, re-attach, or explicit `load()`
clears recovery state.

When the document is hidden, an automatic restart waits for visibility instead
of spending a retry on throttled work. The machine counts the incident when
it parks the restart and uses the current play choice when visibility returns.
User actions can update the parked position or choice without starting a
second restart.

## Consequences

The host can recover a stalled or unavailable active load without silently
playing one the user paused. A source that keeps failing after short successful
periods eventually reports an error rather than restarting indefinitely.
Generic network errors and exhausted recovery budgets remain visible to the
consumer; automatic recovery is not a promise that playback will succeed.

The reader's per-window retries and the host's source-restart limits have
different jobs. Changing the read retry policy does not change the machine's
restart budget. Both limits, the visibility behavior, and the play-intent
rules need tests when the recovery policy changes.

## Related ADRs

- Ranged reads and deferred seeks: [0004](0004-ranged-seeking-and-deferred-seek.md)
- Worker request identity: [0005](0005-custom-zero-copy-proto-over-comlink.md)
- Backend selection and native playback: [0011](0011-backend-policy-and-native-stream-provider.md)
