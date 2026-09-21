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

The worker keeps its X25519 private key and the decrypted seed inside the
worker isolate; no protocol message extracts either one. Apps that own
registration elsewhere can inject a resolved SDK instead:

```js
const core = new SiaVideoWorkerCore({ createSdk: (config, seed) => sdk });
// or via worker messages when using the default factory
```

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
