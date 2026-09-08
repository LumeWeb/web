# 0005 — define a custom typed wire protocol over the worker boundary instead of comlink

## Status

Accepted (2026-09-08; implemented and audit-hardened in `libs/sia-video-source`)

## Context

ADR [0002](0002-worker-owner-streaming-engine.md) places the engine in a
dedicated worker. Choosing the main↔worker transport is then a forced
conversation with structured clone semantics, and two requirements collide
head-on with the popular abstraction for worker RPC:

1. **The worker must push.** Streaming is worker-initiated: `CHUNK` and
   `PROGRESS` messages flow from worker to host continuously and
   independently of any request, for every load. Comlink (GoogleChromeLabs,
   promise-based RPC over postMessage) only carries values in replies to a
   call from the other side, so pushing would mean either a long-lived
   "subscribe" call resolving to a queue — with the caller's promise and
   back-pressure fighting the stream's push shape — or stepping around
   Comlink to do exactly what it was meant to hide.
2. **Zero-copy buffer transfer is mandatory.** Each fMP4 chunk (a 256 KiB
   target `CHUNK_SIZE`) is handed to the host by transferring ownership of
   its `ArrayBuffer` via the postMessage transfer list — the only way to
   avoid a second full copy per chunk on a sustained video bitrate.
   *Transferring means relinquishing: the sender's view of the buffer is
   detached.* A silent structured clone, by contrast, works but doubles
   allocation rates on the hot path — which is exactly what an RPC layer
   doing plain `postMessage(msg)` (no `transfer` argument) does.

A third force in the same direction: **any RPC object layer must not strip
request identity across an async world where loads supersede each other.**
ADR [0004](0004-ranged-seeking-and-deferred-seek.md)'s concurrency guard only
works if the host can tell a superseded load's reply from a live one — a
`requestId` echoed faithfully on every reply, `CHUNK`, `PROGRESS`, and
`ERROR`. That's a protocol property, not something a generic proxy library
provides.

An additional correctness hazard was discovered with the low-level transport
itself: postMessage transfer of a `Uint8Array` subarray view detaches (or
clones, depending on implementation) its **entire underlying ArrayBuffer** —
which shares backing storage with LRU-cache entries and sibling slices in the
engine. Transferring `chunk.buffer` when chunks share a parent buffer is a
silent-corruption bug class independent of any RPC abstraction.

## Decision

The worker boundary uses a **custom typed, versioned wire protocol**
(`src/protocol.ts`), not Comlink:

- **Versioning**: `PROTOCOL_VERSION` (monotonic, currently 2) is negotiated in
  the `HELLO` handshake; `HELLO_OK` echoes the worker's version, and a
  mismatch is a hard `unsupported` error on the host — an old host and a new
  worker (or vice versa) cannot interoperate by accident.
- **Message set** — `MainToWorkerMessage` / `WorkerToMainMessage` discriminated
  unions, one `type` field per message:
  - Main→worker: `HELLO` (worker config; config changes force SDK invalidation
    in the worker), `ATTACH`/`DETACH` (element session lifecycle), `SOURCE`
    (src/mime/preload plus a fresh `requestId`), `PLAY` (deferred start),
    `SEEK` (target time), `DESTROY`.
  - Worker→main: `HELLO_OK` (version + capabilities), `ATTACH_OK`
    (negotiated `mode`: `'worker'` = worker-owned MSE, `'main'` = host-side
    MSE fallback), `SOURCE_OK` (probed container/duration/append MIME),
    `HANDLE` (transferable `MediaSourceHandle`), `CHUNK` (init/media segment
    bytes), `PROGRESS` (buffered windows + received bytes), `ERROR`
    (structure that maps onto `MediaError` codes).
- **Runtime message guards**: `isMainToWorkerMessage` /
  `isWorkerToMainMessage` validate the discriminator plus the shape of each
  variant before anything reaches a state machine — foreign payloads
  (another library's worker) or mismatched protocol versions never become
  typed casts.
- **Request-id-based stale filtering**: `nextRequestId()` allocates on the
  main thread only; the worker echoes the id it received. The host tracks its
  current load's `#requestId` and drops mismatched `CHUNK`/`PROGRESS`/
  `SOURCE_OK`/`HANDLE`/`ERROR` — this is what makes the epoch
  regime of ADR [0004](0004-ranged-seeking-and-deferred-seek.md) safe at the
  async boundary instead of just inside the worker.
- **Transfer discipline**: `#postChunk` always transfers a freshly owned
  shallow copy (`chunk.slice()`), never the cache's or the stream's own
  view — the copy is the same cost as the structured-clone fallback, but the
  host side stays zero-copy. `HANDLE` transfers `mediaSource.handle`
  directly.
- **Shared constants on the wire**: `DEFAULT_FMP4_MIME`
  (`video/mp4; codecs="avc1.640028,mp4a.40.2"`) lives in `src/protocol.ts`
  because worker-MSE appends and the host's main-thread fallback both need
  the same string; defining it once prevents the two MIME checks from
  drifting (see ADR [0003](0003-mse-fmp4-remux-and-unsupported-format.md)).

## Consequences

**Easier**

- The push streaming shape is the protocol's native shape, not an abuse of
  RPC: `CHUNK`/`PROGRESS` are first-class messages with no subscription
  machinery, and per-load ownership of the append pipeline can be expressed
  directly (`requestId` scoping).
- Zero-copy transfer is explicit and auditable at exactly one site
  (`#postChunk`); there is no RPC layer that could silently clone on the
  256 KiB-per-chunk hot path.
- Evolvability is owned in one file: a version bump plus new guard branches
  are the whole compatibility surface, and an old worker meeting a new host
  fails loudly instead of half-working.

**Harder**

- Everything Comlink gives away for free must be maintained here: runtime
  type guards must stay in lockstep with the unions (a new message needs new
  guard logic and a new test in `src/__tests__/protocol.spec.ts`), and
  message shapes are hand-written JSON-serializable data — no arbitrary
  object graphs across the boundary.
- The protocol is a public semver-ish surface for the worker subpath export:
  consumers app-inject workers with their own pipelines must speak the exact
  versioned dialect, and `PROTOCOL_VERSION` bumps are breaking releases for
  them.
- Concurrency reasoning now spans two isolates: the worker's epoch regime
  (ADR [0004](0004-ranged-seeking-and-deferred-seek.md)) and the host's
  request-id filtering are two halves of one guarantee, and a bug in either
  half can admit stale bytes into the current append pipeline. The boundary
  needs its own tests rather than falling out of worker-side guards.
- `postMessage` transfer semantics (whole-buffer detach on subarray views)
  remain a footgun for future contributors adding transfer sites; the rule is
  contained today to `#postChunk` and `HANDLE`.

**Follow-on ADRs**

- The deferred-seek semantics this transport carries →
  [0004](0004-ranged-seeking-and-deferred-seek.md)
- The v10 media host consuming these messages →
  [0001](0001-custom-media-contracts.md)
- Where the worker's capabilities themselves are decided →
  [0002](0002-worker-owner-streaming-engine.md)

Comlink is a stable GoogleChromeLabs project as of 2026-09-08; its promise-RPC
model would still not satisfy requirement (1) without workarounds that amount
to writing this protocol anyway. Re-evaluate only if worker→main streaming
needs grow beyond chunk/progress push (e.g. bidirectional byte ranges).
