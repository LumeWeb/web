# 0004 — seek with ranged Sia downloads and defer seeks from in-flight loads

## Status

Accepted (2026-09-08; implemented and audit-hardened in `libs/sia-video-source`)

## Context

On Sia, a pinned object is read through the WASM SDK's ranged API:
`Sdk.download(object, { offset, length, ... })` returns a `ReadableStream`,
and `PinnedObject.slabs()` provides the local range→slab map that makes
`offset`/`length` reads cheap metadata math. Unlike a CDN-backed video URL,
there is no HTTP `Range` line to fire and forget: every seek is a fresh
WebTransport download from a byte offset, and the SDK aborts in-flight shard
recovery when the stream is dropped.

This forces several design questions:

1. **Real ranged seeks, or download-then-seek?** The naive "download the
   whole object into IndexedDB/the local filesystem, then seek locally"
   turns load time into full-object download time and doubles storage. The
   SDK's `offset`/`length` make true ranged reads a first-class operation —
   and slab layout means the SDK re-reads locally from necessity anyway.
2. **Seeking during a load.** The `<video>` element can fire `seeking` while
   the worker is still probing an object (SDK resolution, head read, MSE
   handshake all sit between `SOURCE` and `SOURCE_OK`). The worker has no
   reader yet and no reliable time→byte map (a throughput estimate from a
   4 KiB head is meaningless).
3. **Time→byte mapping.** The engine has no real duration map (fragmented
   files rarely expose duration in the probe head; `probeDurationSeconds`
   returns `null` past the first `mdat` box). Seeking means estimating a
   byte offset from delivered bytes per wall-clock second
   (`#bytesPerSecond` with a finite floor for the first second), not from a
   cue table.
4. **Concurrency.** A `SOURCE` can be superseded while its probe or stream is
   still in flight; without a guard, chunks from the old object would be
   appended under the new load's request id, or a mid-probe SEEK would start
   streaming a stale object.

## Decision

Seeking is **real ranged seeks through the SDK's `offset`/`length`** — never
download-and-seek-locally — combined with **deferred seek intent** for loads
still in flight and an **epoch regime** for concurrency:

- `RangedReader` (`src/ranged-reader.ts`) owns one logical playback position:
  `seek(offset)` cancels the in-flight stream (dropping it aborts the SDK's
  shard recovery) and calls `sdk.download(object, { offset, length })` (with
  `length = size − offset`) again from the target byte. Parallel slab streams
  and the exact-window LRU chunk cache re-serve recently delivered ranges so
  short backward seeks never hit the network.
- Time→byte mapping is a throughput estimate (delivered bytes over wall-clock
  since the first byte, floored to stay finite in the first second); the
  target offset is clamped to the object size, the transmuxer is rebuilt for
  the new position, and the read restarts there.
- **Deferred seek**: a `SEEK` arriving while a load is still probing (or
  while streaming has not started) is parked as intent — `#pendingSeekTime`,
  scoped per attach session via `#seekParkedSinceAttach`. The deferred seek
  starts streaming at **byte 0**; the `<video>` element then re-applies the
  user's `currentTime` from its own persisted seek, because once data is
  buffered the element's own seek machinery resolves the position. No
  time→byte table is needed for the parked case.
- Worker-side epoch concurrency: every `SOURCE` bumps `#loadEpoch`; async
  continuations (SDK resolution, object fetch, head probe) check the epoch
  after each `await` and abandon superseded work. `#object` and its reader
  binding carry `#objectEpoch`, so `#startStreaming` refuses to bind a reader
  to an object whose load is no longer current, and a mid-probe SEEK cannot
  route to the previous object. PLAY and SEEK carry the load's `requestId`,
  and worker replies (`CHUNK`, `PROGRESS`, `SOURCE_OK`, `ERROR`) are filtered
  on the host's current request id, so stale deliveries die at the boundary.
- Parked-seek scoping: a seek parked under a live ATTACH session survives
  `SOURCE` supersession (a replacement load must not strand the user's seek);
  a load that genuinely fails, succeeds, or is superseded outside an attach
  window drops the intent, so a seek can never auto-start an unrelated later
  load without a PLAY.

## Consequences

**Easier**

- Startup cost is bounded by playback position: a user landing at minute 40
  starts reading at that byte offset instead of after a full-object download.
- Seek semantics stay native: the element emits `seeking`/`seeked`, UI
  scrubbers work unchanged, and the engine never needs its own currentTime
  state machine — the element is the source of truth for the position.
- Cache coherence is simple: every source load clears the LRU cache (it only
  ever holds the previous object's ranges), and epochs make stale
  continuations self-abandon rather than requiring a cancellation registry.

**Harder**

- There is no exact seek: offset estimation uses a throughput heuristic, so
  seeks land near the target and the element's re-applied `currentTime` can
  briefly show a stall before the surrounding buffered region covers it.
  Handling arbitrary-duration media will eventually require a real time→byte
  index (e.g. from an `mfro`/`sidx` sidecar or an added index format) — a
  deliberate scope cut, worth its own ADR if taken up.
- Seek-while-loading needs two intent mechanisms (`#pendingSeekTime` +
  `#seekParkedSinceAttach`, plus `#playRequested`) whose lifecycles interact;
  the audit-hardened rules (parked seek survives supersession within an
  attach session, is consumed on load success, cleared on failure) are subtle
  and documented only in the code that implements them.
- Two engines share the primitive: worker-MSE seeks rebuild only the
  transmuxer, where `mode === 'main'` falls back
  to host-side append machinery that must also drain its own append queue —
  the equivalence of the two paths is not covered by an integration test.
- Chunk delivery across the worker boundary is asymmetric with seeks:
  parked-seek re-applies depend on the element's natural buffered-data seek,
  so a browser that buffers data but does not re-fire the seek would strand
  the position (no such browser behavior is documented as of 2026-09-08, but
  it is an external assumption).

**Follow-on ADRs**

- The dedicated worker owning the reads →
  [0002](0002-worker-owner-streaming-engine.md)
- The requestId filtering that makes stale-delivery rejection possible →
  [0005](0005-custom-zero-copy-proto-over-comlink.md)

Facts recorded 2026-09-08 that can go stale: `@siafoundation/sia-storage`
0.0.14 ranged-download API shape (`offset`/`length`/`maxBufferedChunks`),
and the assumption that `<video>` re-applies `currentTime` once buffered
data appears after a seek on a not-yet-buffered time.
