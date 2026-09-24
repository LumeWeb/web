# @lumeweb/sia-video-source

A video.js v10 custom media element that plays video stored on the
[Sia network](https://sia.tech). Sia storage is not reachable with plain HTTP
`fetch`/`video.src`: bytes come from `@siafoundation/sia-storage` (Rust→WASM,
RHP4 over WebTransport) via `Sdk.download(object, { offset, length }) →
ReadableStream`. This package bridges those bytes into MSE and exposes the
result as a standard media element implementing the v10 host contract
(`MediaEngineHost` + `MediaErrorCapability`), the same way the packaged
`HlsJsMedia`/`ShakaMedia` classes do.

The library has three jobs:

1. read exact byte ranges from Sia;
2. let mediabunny inspect and copy supported tracks into CMAF/fMP4;
3. append those bytes to MediaSource, either inside the worker or through the
   main-thread fallback.

It does not parse MP4 boxes, parse EBML, classify containers from byte
signatures, build a seek index, select producers, or run mux.js. mediabunny
owns format recognition and CMAF serialization; the package only adapts the
Sia transport to mediabunny's source contract and hands the produced bytes to
MSE append plumbing.

> **video.js v10 status.** This library is written against the published
> video.js v10 beta — `@videojs/media`, `@videojs/react` `10.0.0-beta.32` —
> which does exist on npm (contrary to earlier expectations). The real v10
> beta host contract is `attach(target)` / `detach()` / `destroy()`
> (`MediaEngineHost`) rather than the `attachEngine`-style names sketched in
> early plans; this follows the actual shipped reference implementations.

## Architecture

The finished byte path:

```text
video.js host
  -> worker protocol
  -> SessionCoordinator
  -> SiaByteSource
  -> mediabunny CustomSource
  -> one mediabunny Input
  -> one mediabunny Conversion (forced packet copy, CMAF output)
  -> AppendSink
  -> MseAppendPipe
  -> SourceBuffer
```

One load runs through ONE mediabunny pipeline: the same `Input` instance owns
metadata discovery and conversion, so the object's bytes are downloaded once
and the conversion reuses the discovered tracks. `Conversion.init()` runs
during load inspection — before the load is accepted — with
`copy: { mode: 'forced' }` and a CMAF `Output`. Whether the conversion is
valid and utilises the chosen video + audio tracks is checked before the load
is accepted, so an object a forced copy cannot support is rejected up front
with a stable reason instead of failing at playback start. Converted bytes
reach the `AppendSink` as init then media units (ftyp+moov is the init append,
each moof+mdat pair is one self-contained media segment), and end-of-stream is
requested once the conversion finishes executing.

- **Worker-MSE (primary).** `MediaSource.canConstructInDedicatedWorker ===
  true` (Chrome 108+, Edge, Safari 18+) is gate-checked statically, never via
  try/catch. Each accepted load gets a fresh worker `MediaSource`; the worker
  transfers its `MediaSourceHandle` as a `HANDLE` protocol message and the
  host sets `video.srcObject = handle`.
- **Main-thread MSE fallback (Firefox and other runtimes without worker
  MSE).** The worker only fetches and converts, posting fMP4 units as
  transferable `CHUNK` messages; the host builds its own `MediaSource`,
  appends them through an `MseAppendPipe`, and wires it with
  `URL.createObjectURL()`.
- **Supported inputs.** mediabunny recognizes everything in its `ALL_FORMATS`
  list, but an object is playable only when a forced copy into CMAF succeeds
  AND the result is decodable by this browser's MSE (`mseSupported`). Both a
  video and an audio track are currently required; a load with either missing
  is rejected (`video-track-missing` / `audio-track-missing`), as are codecs
  the MSE rejects (`audio-codec-unsupported`, `video-codec-unknown`,
  `mime-unsupported`) and tracks a forced copy cannot place in CMAF
  (`copy-unavailable`).
- **Seek.** Seeking is buffered-timeline seeking only. The host forwards the
  element's `seeking` event as `SEEK { time }`, and the session mirrors the
  position to MSE, which re-anchors over the media it has buffered. There is
  no package-owned byte index and no seek-time→byte-offset mapping; playback
  streams forward from the accepted load, and a seek into not-yet-buffered
  timeline waits for more media.
- **Cancellation.** The `SessionCoordinator` owns one per-load
  `AbortController`. Superseding the source (`SOURCE` while a load is
  in-flight) or `DETACH`/`DESTROY` aborts that controller first — failing
  every in-flight `ByteSource` read — then disposes the load's playback
  (cancelling the mediabunny conversion and disposing its `Input`, which
  cancels the transport source), aborts the sink, and, in worker mode, tears
  the worker `MediaSource`/`SourceBuffer` down.
- **Errors** follow the v10 error feature contract. The worker reports
  `{ kind: 'unsupported' | 'decode' | 'network', context }`; the host maps
  that to `MediaError` codes 4 / 3 / 2 (unknown kinds → custom 100), exposes
  it via the `error` getter, dispatches `error` events, and clears it
  (dispatching `emptied`) when the source changes. Skin `ErrorDialog`s pick it
  up without extra wiring. Unsupported loads are rejected with a stable reason
  code during inspection, before any streaming starts.

Out of scope by design: transcoding (a codec is accepted only when a forced
copy into CMAF succeeds and this browser's MSE supports the resulting MIME —
no combination beyond that is promised), DRM, live streams.

## Usage

### React

```tsx
import { Player } from '@videojs/react';
import { SiaVideo } from '@lumeweb/sia-video-source/react';

// sdk registration/range config handled by the player app; the wrapper below
// uses the worker's default SDK flow driven by connection config.
<Player>
  <SiaVideo src={pinnedObjectKey} controls />
</Player>
```

### Vanilla

```js
import { SiaVideoSource } from '@lumeweb/sia-video-source';

// Attach to your own <video> (or use the react wrapper with <Player>)
const sia = new SiaVideoSource({ createWorker: () => customWorker });
sia.attach(document.querySelector('video'));
sia.src = pinnedObjectHexKey;
```

### Video.js v10 recovery state

The host announces playback recovery through the typed `sia-recovery-change`
DOM event. A minimal custom Video.js v10 **player feature**
(`@lumeweb/sia-video-source` root) mirrors that event into the player store so
any store consumer — non-React or React — reads the same recovery facts.
Generic playback state (paused/started/waiting/… and errors) stays owned by the
packaged video.js features; this feature only surfaces the Sia recovery window.

```ts
// Non-React Video.js: combine the feature into a player store and read the
// selected slice. No React or React bindings are required for this entrypoint.
import { combine, createStore } from '@videojs/store';
import { siaRecoveryFeature, selectSiaRecovery } from '@lumeweb/sia-video-source';

const store = createStore()(combine(siaRecoveryFeature));
const detach = store.attach({ media: siaMedia, container: elem.parentElement });
const { active, reason, resumeSeconds, wantsPlay } = selectSiaRecovery(store.state) ?? {};
detach();
```

The root feature depends only on the non-React video.js peer packages
(`@videojs/core`, `@videojs/store`, `@videojs/media`); a non-React consumer
does not need React or the React bindings installed.

```tsx
// React: add the feature to the player and use the hook. One feature drives
// both consumers — no separate controller or duplicated store.
import { createPlayer } from '@videojs/react';
import { SiaVideo, useSiaRecovery } from '@lumeweb/sia-video-source/react';
import { siaRecoveryFeature } from '@lumeweb/sia-video-source';

const { Player } = createPlayer({ features: [siaRecoveryFeature] });

function RecoveryBadge() {
  const recovery = useSiaRecovery(); // { active, reason?, resumeSeconds?, wantsPlay? } | undefined
  return recovery?.active ? <span>recovering ({recovery.reason})</span> : null;
}

<Player>
  <SiaVideo src={pinnedObjectKey} />
  <RecoveryBadge />
</Player>
```

State carries no transient `reason`/`resumeSeconds`/`wantsPlay` while inactive:
the host's `active: false` close detail clears them, and detach/reattach resets
the slice to its inert initial state, so a stale window can never leak across
sources or players.

### Video.js v10 load acceptance

The host also announces when the worker pipeline **accepts** a source through
the typed `sia-load-change` DOM event, mirrored into the player store by the
`siaLoadFeature` player feature — the same store/selector mechanism as
recovery, but boolean-only and separate from it. `accepted: true` means the
current request's `SOURCE_OK` opened the load; it deliberately carries no
`SOURCE_OK.info` metadata, progress, retries, counters, or broad phase, and it
does **not** mean the load is playable/ready. `accepted: false` is the inert
state and the reset at every load boundary (fresh source/load,
`reloadConfiguration`/reattach replay, recovery restart, detach/destroy), so
an accepted load can never leak across sources or players.

```ts
// Non-React Video.js: same combine/selector pattern as recovery.
import { combine, createStore } from '@videojs/store';
import { siaLoadFeature, selectSiaLoad } from '@lumeweb/sia-video-source';

const store = createStore()(combine(siaLoadFeature));
const detach = store.attach({ media: siaMedia, container: elem.parentElement });
const { accepted } = selectSiaLoad(store.state) ?? {};
if (accepted) { /* the current load was accepted by the worker pipeline */ }
detach();
```

Like recovery, the root feature depends only on the non-React video.js peer
packages (`@videojs/core`, `@videojs/store`, `@videojs/media`), and React
consumers read the exact same slice through `useSiaLoad()`:

```tsx
import { createPlayer } from '@videojs/react';
import { SiaVideo, useSiaLoad } from '@lumeweb/sia-video-source/react';
import { siaLoadFeature } from '@lumeweb/sia-video-source';

const { Player } = createPlayer({ features: [siaLoadFeature] });

function LoadGate() {
  const load = useSiaLoad(); // { accepted } | undefined
  return load?.accepted ? <span>source accepted</span> : null;
}

<Player>
  <SiaVideo src={pinnedObjectKey} />
  <LoadGate />
</Player>
```

The same natural `SiaVideoSource` consumers can of course subscribe to the raw
`sia-load-change` DOM event on the element or host.

### The shared `siaFeatures` tuple

Both Sia features are also published as one annotated **mutable** tuple
(`siaFeatures: SiaFeatures` = `[siaRecoveryFeature, siaLoadFeature]`), mirroring
the packaged `videoFeatures` pattern. Pass it to either consumption API and you
get both slices in one store — no separate vanilla/React systems:

```ts
// Non-React Video.js: combine the tuple into a player store.
import { combine, createStore } from '@videojs/store';
import { siaFeatures } from '@lumeweb/sia-video-source';

const store = createStore()(combine(...siaFeatures));
```

```tsx
// React: the same tuple drives createPlayer directly, or composes with the
// packaged video features. The React hooks and selectors read the same store.
import { createPlayer } from '@videojs/react';
import { videoFeatures } from '@videojs/core/dom';
import { SiaVideo, useSiaRecovery, useSiaLoad } from '@lumeweb/sia-video-source/react';
import { siaFeatures } from '@lumeweb/sia-video-source';

const { Player } = createPlayer({ features: siaFeatures });
// or: createPlayer({ features: [...videoFeatures, ...siaFeatures] });

function SiaStatus() {
  const recovery = useSiaRecovery(); // { active, reason?, resumeSeconds?, wantsPlay? } | undefined
  const load = useSiaLoad(); // { accepted } | undefined
  return recovery?.active ? <span>recovering ({recovery.reason})</span> : load?.accepted ? <span>source accepted</span> : null;
}

<Player>
  <SiaVideo src={pinnedObjectKey} />
  <SiaStatus />
</Player>
```

`SiaFeatures` must stay an explicitly typed mutable tuple (not `as const`):
React `createPlayer` requires mutable feature arrays (`Features extends
AnyPlayerFeature[]`), rejecting a readonly literal with TS2769; `combine(...)`
accepts either. The individual `siaRecoveryFeature`/`siaLoadFeature` exports
remain available unchanged for override/custom composition, and the tuple only
depends on the non-React video.js peer packages — importing it from the root
never pulls in `@videojs/react`.

### The worker

The engine runs in a dedicated worker; its entry is exported so the app's
bundler — not this package — emits and loads the final asset:

```js
new Worker(new URL('@lumeweb/sia-video-source/worker', import.meta.url), { type: 'module' })
```

This is what the default `SiaVideoSource` factory does (resolved relatively
against the dist output); custom pipelines can pass their own worker via
`createWorker`.

WASM glue: the Sia SDK loads its binary with
`new URL('sia_storage_wasm_bg.wasm', import.meta.url)` internally. The package
stays external in this library's build (no bundling), so the glue keeps working
as long as app bundlers leave it external or process `.wasm` assets
themselves.

### Worker SDK registration

By default the worker builds the SDK from two handshake steps, running
`Builder.connected(...)` inside the worker:

1. `HELLO` carries the connection metadata (`indexerUrl`, app metadata). The
   reply publishes the worker's raw X25519 public key.
2. The host encrypts the 32-byte `AppKey` seed to that public key
   (X25519 ECDH + HKDF + AES-GCM) and sends it as an `APP_KEY` ciphertext
   envelope. The plaintext seed never crosses the postMessage channel and is
   not retained on the main thread after the envelope is sent — pass it
   through the `getAppKeySeed` supplier option (or the React `SiaVideo`
   `getAppKeySeed` prop), never as a stored value.

The worker keeps its X25519 private key and the decrypted seeds inside the
worker isolate; no protocol message extracts either one. Apps that own
registration elsewhere can inject a resolved SDK instead:

```js
const core = new SiaVideoWorkerCore({ createSdk: (config, seed) => sdk });
// or via worker messages when using the default factory
```

**Keyless playback (sharing keys).** A share-URL `src` streams without any app
key when a sharing-key seed is supplied through `getSharingKeySeed` (or the
React `getSharingKeySeed` prop). The seed is a read-only, expirable, revocable
credential handed out by the account owner; the worker connects with
`SharedSdk.connect(indexerUrl, seed)` and routes the share URL through
`SharedSdk.object(objectKey)` — downloads are paid for by the key's owner.
When **both** seeds are supplied, routing is by source kind: plain pinned
object keys resolve through the app-key SDK, share URLs through the
sharing-key SDK (share URLs never silently degrade to app-key resolution).
Neither SDK connects eagerly — each connects lazily on its route's first
resolution, so a dual-seed app playing only one source kind pays no
connection/WASM-object cost for the unused credential; an unregistered key
surfaces on that route's first resolution instead of at connect time. With
only an app key, share URLs fall back to `Sdk.objectFromShareUrl` as before. The sharing seed travels
exactly like the app-key seed: one `APP_KEY` envelope tagged `keyType:
'sharing'` (default `'app'` for the original handshake), never plaintext,
never in `workerConfig`; each `HELLO` additionally carries `appSeed` /
`sharingSeed` presence booleans (metadata only) so the worker scrubs a seed
slot whose provider the app removed. See ADR
[0008](decisions/0008-share-link-streaming-via-sharedsdk.md).

## Re-applying configuration (reload)

Configuration that the host only reads at handshake time — `workerConfig`
(presence/indexerUrl identity), `workerMse`, swapped seed suppliers, the HELLO
`log` threshold — is otherwise inert until the next attach. `SiaVideoSource`
exposes an explicit in-place reload for exactly that:

```ts
source.workerConfig = { ...source.workerConfig, indexerUrl: 'https://new.example' };
source.reloadConfiguration(); // re-handshakes against the CURRENT config
```

`reloadConfiguration()` re-runs the same flow a re-attach performs — a fresh
`HELLO` (current `workerConfig` + seed-presence flags), the current seed
suppliers re-read into fresh encrypted `APP_KEY` envelopes, an `ATTACH`, and the
current `src` replayed with its preserved play/pause intent — on the SAME
worker and element (no remount, no new worker). The rebuilt load starts fresh
(buffered state / stored error / recovery observation reset, playhead back to
0) while a genuinely playing element's playback choice survives.

The reload is always-forced and idempotent, and it is concurrency-safe: each
handshake carries a generation, and `HELLO_OK` echoes the `HELLO`'s requestId,
so an older async supplier/encryption chain (or an in-flight `HELLO_OK`) can
never apply after a newer reload, detach, or destroy — a stale chain drops its
envelope instead of winning the wire. Calling it on a host that was never
attached, is currently detached, or was destroyed is a no-op.

### React

```tsx
<SiaVideo
  reloadKey={mode}             // changes → exactly one in-place reload
  sia={{ indexerUrl, ... }}
  getAppKeySeed={fetchSeed}
/>
```

The `<SiaVideo>` wrapper reloads automatically, after the element has attached
and props have been assigned, whenever the structural HELLO inputs change:
`reloadKey`, worker-config presence/`indexerUrl`, `workerMse`, and seed-supplier
**presence** booleans. The first render never double-HELLOs (the mount attach
already handshakes with the initial props), and only value facts are compared —
never supplier function refs (inline arrows change every render), never nested
app metadata, never the logger identity. Any other prop (e.g. `src`, `mimeType`,
`preload`) applies without a handshake.

## Logging

Logging is pluggable through a small dependency-free `Logger` interface:
`createConsoleLogger`, `nullLogger`, or a wrapped third-party logger. Pass one
to `new SiaVideoSource({ logger })` or the React wrapper's `logger` prop. The
default is a built-in console logger that emits `info` in development builds
and `warn` in production. Re-level at runtime by installing a fresh logger or
wrapping the current one.

Worker milestones reach the host logger only when it opts in via the HELLO
`log` threshold (derived from the logger's level by `logThresholdFor`; a
muted host omits it and the worker posts nothing). Events are a coarse
catalog: `sdk.built`, `object.resolved`, `read.window-*`, `bytes.read`,
`session.*`, `stream.*` — scalar details only, capped at 256 messages per
connection, and forwarded onto `logger.child('worker')`.

Use `loglevel` as the sink by wrapping your own instance:

```ts
import log from 'loglevel';
import { wrapLoglevel } from '@lumeweb/sia-video-source';

const source = new SiaVideoSource({ logger: wrapLoglevel(log.getLogger('sia')) });
```

LogTape has no library dependency; adapt its logger with a tiny sink-shim that
conforms to the `Logger` interface:

```ts
import { getLogger } from '@logtape/logtape';
import type { Logger } from '@lumeweb/sia-video-source';

function logTapeLogger(category: string): Logger {
  const tape = getLogger(['sia', category]);
  return {
    child: (scope) => logTapeLogger(`${category}.${scope}`),
    debug: (msg, fields) => tape.debug(msg, fields),
    error: (msg, fields) => tape.error(msg, fields),
    info: (msg, fields) => tape.info(msg, fields),
    level: 'debug',
    trace: (msg, fields) => tape.debug(msg, fields),
    warn: (msg, fields) => tape.warning(msg, fields),
  };
}

const source = new SiaVideoSource({ logger: logTapeLogger('main') });
```

Logs never contain seeds, decrypted key material, or share URLs. A share URL
embeds its decryption key, so share-URL playback shows up only as the
`share: true` boolean in `object.resolved` details.

## Development

```bash
pnpm --filter @lumeweb/sia-video-source build
pnpm --filter @lumeweb/sia-video-source test          # node-mode unit tests
pnpm --filter @lumeweb/sia-video-source test:browser  # browser-mode (playwright/chromium)
pnpm --filter @lumeweb/sia-video-source lint
```

### Status / verification gaps

- Unit tests cover the protocol, error mapping, the media conversion
  readiness path, append-sink/MSE pipe plumbing, and the load lifecycle. A
  live end-to-end playback pass (upload a real object, play it back, seek
  over the buffered timeline) still needs to be run manually against a Sia
  testbed — the transport requires real hosts.
- Firefox/Safari cross-browser passes not yet executed; the main-thread MSE
  fallback is implemented behind the same `SOURCE_OK`/`CHUNK` protocol.
