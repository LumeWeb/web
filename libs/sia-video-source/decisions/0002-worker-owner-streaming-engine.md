# 0002 — own the streaming engine in a dedicated web worker

## Status

Accepted (2026-09-08; implemented and audit-hardened in `libs/sia-video-source`)

## Context

Playing Sia content requires running the `@siafoundation/sia-storage` WASM SDK
(version 0.0.14 as of this writing) to resolve pinned objects and pull ranged
bytes over WebTransport. That work must happen somewhere, and the placement
decision shapes everything downstream:

- **Main thread** is ruled out by jank: WASM SDK initialization, container
  probing, MPEG-TS transmuxing, and chunk fan-out are all steady CPU work
  that would compete with video decoding and rendering.
- **Service Worker** is the tempting "worker" in a browser, and it is a bad
  fit on three independent grounds:
  1. It is architecturally a *fetch proxy* — its natural API is
     `fetch`-event interception, while this engine needs to make *outbound*
     WebTransport/WASM SDK calls. We would be proxying URLs we generate
     ourselves to call APIs the Service Worker scope handles poorly.
  2. It is single-instance per domain: one service worker must serve *every*
     video element on the page and route messages per element, turning the
     worker into a shared, element-addressed broker rather than a simple
     one-session engine (`SiaVideoWorkerCore` is explicitly documented as
     "one instance per media element").
  3. Its lifetime is owned by the browser, which terminates idle workers.
     Long-lived, paused streams (preload `metadata`, then a play thirty
     minutes later) cannot rely on the worker surviving; every termination
     would drop the WASM SDK, the WebTransport session, and the LRU chunk
     cache.
- **A dedicated Web Worker** has none of those problems: one per media
  element, lifetime controlled by the host (`attach` spawns,
  `destroy` terminates via `worker.terminate()` in `src/sia-video-source.ts`),
  and free to make outbound SDK calls.

The additional draw is MSE placement. Since Chromium added
`MediaSource.canConstructInDedicatedWorker` and MediaSource is constructible
inside workers, a dedicated worker can own the `MediaSource` and hand the main
thread only a transferable `MediaSourceHandle` via `video.srcObject` — moving
`appendBuffer`, buffering, and remux budget off the main thread entirely.
(Chromium support as of 2026-09-08; Firefox does not set the flag, so a
main-thread fallback path is mandatory. Recorded at
`@lumeweb/sia-video-source` 0.0.1.)

## Decision

The streaming engine is owned by a **dedicated Web Worker**
(`@lumeweb/sia-video-source/worker` → `src/worker.ts` → `SiaVideoWorkerCore`
in `src/sia-video-source-worker.ts`), not a Service Worker and not the main
thread. The worker owns:

- the Sia WASM SDK lifecycle (`initSia`, `Builder`/`AppKey` registration via
  the HELLO config, disposal),
- ranged reads through `Sdk.download(object, { offset, length })` →
  `ReadableStream` and `PinnedObject.slabs()` metadata,
- container probing (`src/container-probe.ts`) against a 4 KiB head read,
- MSE remux of MPEG-TS to fragmented MP4 via mux.js, fMP4 passthrough,
- MSE itself where the platform allows
  (`MediaSource.canConstructInDedicatedWorker === true` → constructs
  `MediaSource` in the worker, transfers `mediaSource.handle` as a
  `HANDLE` message, and the host sets `video.srcObject`),
- and, in the fallback case (`mode === 'main'`, e.g. Firefox), transfers
  parsed fMP4 bytes as `CHUNK` messages over an owned buffer, which the host
  appends into its own main-thread `MediaSource` created behind
  `URL.createObjectURL`.

The default spawn is `new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })`
so bundlers (Vite, webpack, rolldown) emit the worker automatically; apps with
their own worker pipelines inject `createWorker`. The main thread keeps only:
message plumbing, the fallback SourceBuffer, and the
`HTMLVideoElementHost` contract surface.

## Consequences

**Easier**

- The main thread stays responsive: no WASM compilation, transmux loop, or
  decrypt/append bookkeeping runs on it; main-thread MSE work is zero on
  worker-MSE-capable browsers.
- One engine instance per element with a host-controlled lifetime matches
  `attach`/`destroy` on `MediaEngineHost` exactly; `destroy` can synchronously
  `terminate()` and release every native resource (see `withDisposal`).
- Worker-MSE can be enabled per browser by probing one flag
  (`detectWorkerMseSupport`), with the fallback selected invisibly per session
  (`mode` on `ATTACH_OK`, `SOURCE_OK.info.mode`).

**Harder**

- Every interaction crosses a message boundary with structured-clone
  semantics: seeking and play become asynchronous intents, and the protocol
  must handle postMessage transfer correctly (see ADR
  [0005](0005-custom-zero-copy-proto-over-comlink.md)).
- Two MSE codepaths must be maintained and kept equivalent: worker-owned
  SourceBuffer queues (`#appendQueue` in the worker) and the main-thread
  fallback queue in the host do the same job with separate implementations.
- Firefox's fallback keeps remux + full byte copying costs (a per-chunk copy
  is required before transfer, since chunk buffers may share backing storage
  with the LRU cache), so the main thread pays a bandwidth-shaped cost
  instead of a CPU-bound one.
- Debugging moves into a worker isolate: errors must be serialized through
  the `ERROR` message contract rather than thrown, so exceptions in async
  paths must be caught and mapped deliberately.

**Follow-on ADRs**

- Concurrency inside the worker (load/seek epochs) →
  [0004](0004-ranged-seeking-and-deferred-seek.md)
- Which containers the worker accepts and how it reports unsupported input →
  [0003](0003-mse-fmp4-remux-and-unsupported-format.md)
- The message envelope that makes this worker addressable from the host →
  [0005](0005-custom-zero-copy-proto-over-comlink.md)

Support facts recorded here (`MediaSource.canConstructInDedicatedWorker` on
Chromium; no worker-MSE on Firefox, dated 2026-09-08) go stale as browsers
change — re-verify before relying on the fallback path's absence.
