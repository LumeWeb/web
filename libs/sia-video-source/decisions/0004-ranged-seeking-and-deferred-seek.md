# 0004: seek with ranged Sia downloads and defer seeks during loads

## Status

Accepted (2026-09-08; implemented in `libs/sia-video-source`)

## Context

The Sia SDK supports `offset` and `length` downloads. A seek can therefore
start a new range instead of downloading an entire object. A media element can
also seek while source resolution, inspection, or conversion is still running.
The host needs to retain that intent without allowing work from a replaced load
to reach the current sink.

## Decision

`RangedReader` in `src/ranged-reader.ts` is an exact-range reader. It exposes
`start(offset, length)` and `stop()` for a read window; it does not own a
persistent playback position or a `seek(offset)` method. The session coordinator
starts a new conversion and reader window for a new seek target. The default
transport budget and cache limit concurrent ranged reads.

`SessionCoordinator` stores a deferred target in `#pendingSeekTime` when a seek
arrives before streaming can start. The current load and attach lifecycle decide
when that intent is consumed or cleared. Conversion and stream controllers use
request identity and cancellation to prevent a replaced source from delivering
bytes to the active sink.

Time to byte mapping remains a media-pipeline concern. The package does not
claim an exact byte index for arbitrary sources. The browser's media element
remains the current-time authority once buffered output is available.

## Consequences

Playback can request only the range needed for the current conversion window,
and a pending seek does not disappear during source setup. Cancellation closes
an active reader before a replacement starts. Request checks keep late worker
messages from the current load.

A seek can be approximate until media timestamps and buffered ranges are
available. Applications should treat a pending seek as asynchronous and rely on
standard media events for completion. Changes to seek indexing or duration
mapping require a new decision.

## Related ADRs

- Worker ownership: [0002](0002-worker-owner-streaming-engine.md)
- Conversion output: [0003](0003-mse-fmp4-remux-and-unsupported-format.md)
- Request identity: [0005](0005-custom-zero-copy-proto-over-comlink.md)
