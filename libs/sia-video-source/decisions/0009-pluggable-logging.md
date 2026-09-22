# 0009 — pluggable logging for the Sia video source

## Status

Accepted (2026-09-22; implemented in `libs/sia-video-source`)

## Context

`libs/sia-video-source` is a browser-only media element whose real work runs in
a dedicated worker isolate. Up to now the library produced no diagnostics at
all: failures surfaced only as video.js `MediaError` codes, and there was no
way for an app to see why a load stalled, which SDK connected, or how a window
read progressed. The consumer surface is a remote callback registry (video.js
v10 media contracts), not a general-purpose log channel, so diagnostics could
not ride the element's event path.

The library is also dependency-averse by design: `src/log/logger.ts` must stay
zero-dependency because it runs in both the host bundle and worker bundles a
wide range of apps bundle themselves, and it must never throw or touch
browser-missing globals. Any chosen shape has to serve three distinct
consumers at once:

- **The default user** who wants reasonable output with zero configuration.
- **The embedding app** that already owns a logging stack (loglevel, LogTape,
  winston/pino, or a plain console) and wants the library's lines to flow into
  that stack.
- **The worker** isolate, which cannot share a logger object across the wire
  — milestone facts must be posted as protocol messages and rendered host-side.

## Decision

Adopt a tiny, dependency-free internal `Logger` interface as the only logging
surface every internal call site speaks, plus a default console-backed implementation,
and keep third-party loggers (loglevel/LogTape) out of `dependencies` as
optional adapters. Worker milestones cross the wire as coarse `LOG` protocol
messages gated by the HELLO log threshold, capped per connection.

### 1. `Logger` interface + default console logger

`src/log/logger.ts` defines `Logger` (trace/debug/info/warn/error, a `child`
scope, and a `level` filter), `LOG_LEVELS` in severity order, `logLevelRank`
(the single `>=` gate), a `nullLogger`, and `createConsoleLogger`. The console
logger defaults to `'info'` in development builds and `'warn'` in production
(`process.env.NODE_ENV` statically replaced by bundlers; browsers have no
`process`, so the check is optional-chained and can never throw). Every call
site routes through a `Logger` — a host can pass `new SiaVideoSource({ logger })`
(or the React wrapper's `logger` prop), re-level at runtime by installing a
fresh logger, or drop to `nullLogger` for silence.

### 2. Optional adapters, not dependencies

`src/log/loglevel.ts` ships a `wrapLoglevel` adapter that shapes any
loglevel-style logger (or a plain `console`) into `Logger`, forwarding lines
untouched. `loglevel` is **not** added to `dependencies` — the adapter depends
only on the structural `LoglevelLike` shape, so integrators who don't use
loglevel never load it, and those who do wrap their own instance (never a
module-global singleton the library forces on them). The same user-supplied
sink-shim approach is documented for LogTape (a ~10-line adapter implementing
`Logger` over `getLogger`). The dependency list stays at its current
size, and integrators who want loglevel or LogTape wire their own sink.

### 3. Worker milestone LOG wire channel

No logger object can cross to the worker, so `src/protocol.ts` revives the
old debug-event hook as `WorkerToMainMessageType.LOG` (`'LOG'`): a coarse
milestone name (catalogued in `WORKER_LOG_EVENT_NAMES`, advisory never a wire
constraint — `sdk.built`, `object.resolved`, `read.window-*`, `bytes.read`,
`session.*`, `stream.*`), a `level` from the four wire severities (`trace` is
deliberately excluded to keep the wire cheap), and scalar-only `detail`.
Forwarding is opt-in: the host HELLO carries a `log` threshold derived by
`logThresholdFor` from its logger's level, and an absent threshold means the
worker posts nothing — a muted host keeps the wire byte-identical to before.
The composition's `emitLog` gates every milestone against the live threshold
and a per-sink `MAX_WORKER_LOG_MESSAGES = 256` cap, so a pathologically
failing source can never flood the postMessage channel. The host renders each
received `LOG` onto
`logger.child('worker')` via `forwardWorkerLog`. Credential discipline is part
of the channel's contract: logs never carry seeds, decrypted key material, or
share URLs (which embed their decryption key); share-URL playback appears only
as the boolean `share: true` detail on `object.resolved`.

## Consequences

**Easier**

- Zero-config defaults give every app useful output, and embedding apps merge
  library lines into their existing stack through a ~5-line adapter.
- Call sites stay uniform (`Logger` everywhere), so the worker isolate and the
  host share one vocabulary even though their transport differs.
- Rejected alternatives stay out of the tree: winston/pino are Node-first and
  heavyweight for a browser worker bundle (formatting, transports, streams)
  and would need their own worker-facing transport anyway; forcing a hard
  `loglevel` dependency would make the library pick an integrator's logging
  stack for them and drag in global-singleton semantics. The structural
  `LoglevelLike` shape captures the parts of loglevel worth standardizing on
  without the dependency.
- The HELLO-gated, capped, scalar-only wire keeps worker-to-main logging
  bounded and credentials-safe by construction.

**Harder**

- The worker can only forward what it is told to (threshold + cap), so deep
  worker-side debugging beyond the milestone catalog needs a future,
  explicitly opted-in per-event wire channel instead of an open firehose.
- Two decisions must stay in sync: the host `Logger` level and the HELLO wire
  threshold, so `logThresholdFor` must stay a pure, bucketed mapping.
