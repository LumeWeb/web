# @lumeweb/sia-video-source

A video.js v10 custom media element that plays video stored on the
[Sia network](https://sia.tech). Sia storage is not reachable with plain HTTP
`fetch`/`video.src`: bytes come from `@siafoundation/sia-storage` (Rust→WASM,
RHP4 over WebTransport) via `Sdk.download(object, { offset, length }) →
ReadableStream`. This package bridges those bytes into MSE inside a dedicated
Web Worker and exposes the result as a standard media element implementing the
v10 host contract (`MediaEngineHost` + `MediaErrorCapability`), the same way
the packaged `HlsJsMedia`/`ShakaMedia` classes do.

> **video.js v10 status.** This library is written against the published
> video.js v10 beta — `@videojs/media`, `@videojs/react` `10.0.0-beta.32` —
> which does exist on npm (contrary to earlier expectations). The real v10
> beta host contract is `attach(target)` / `detach()` / `destroy()`
> (`MediaEngineHost`) rather than the `attachEngine`-style names sketched in
> early plans; this follows the actual shipped reference implementations.

## Architecture

```
[Worker]  initSia() → Sdk.download(object, { offset, length }) → ReadableStream
          → container probe (4 KiB head) → remux to fMP4 (mux.js for MPEG-TS,
          passthrough for MP4) → worker-side MediaSource + SourceBuffer
          → transfer MediaSourceHandle + progress/error messages
[Host]    SiaVideoSource extends HTMLVideoElementHost
          attach() → HELLO/ATTACH handshake → video.srcObject = msHandle
```

- **Worker-MSE (primary).** `MediaSource.canConstructInDedicatedWorker === true`
  (Chrome 108+, Edge, Safari 18+ is gate-checked statically, never via
  try/catch. The worker constructs `MediaSource`, transfers its
  `MediaSourceHandle`, and the host sets `video.srcObject = handle`.
- **Main-thread MSE fallback (Firefox).** The worker only reads/parses/remuxes
  and posts fMP4 data as transferable `CHUNK` messages; the host builds its own
  `MediaSource`, appends through SourceBuffers, and wires it with
  `URL.createObjectURL()`.
- **Seek** is a ranged read: the host relays the element's `seeking` event as
  `SEEK { time }`; the worker maps time → byte offset (throughput-estimated)
  with the locally cached `PinnedObject.slabs()` map (zero indexer roundtrips),
  cancels the in-flight stream, and issues a fresh
  `Sdk.download(object, { offset, length })`. A small exact-window LRU chunk
  cache (`ranged-reader.ts`) re-serves recent ranges without network I/O.
- **Errors** follow the v10 error feature contract. The worker reports
  `{ kind: 'unsupported' | 'decode' | 'network', context }`; the host maps that
  to `MediaError` codes 4 / 3 / 2 (unknown kinds → custom 100), exposes it via
  the `error` getter, dispatches `error` events, and clears it (dispatching
  `emptied`) when the source changes. Skin `ErrorDialog`s pick it up without
  extra wiring. Unknown containers are rejected right after the 4 KiB probe —
  before any streaming starts.

Out of scope by design: transcoding (codecs must be MSE-decodable: H.264/AV1 +
AAC/Opus), DRM, live streams.

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

- Unit tests cover protocol, error mapping, and container sniffing. A live
  end-to-end playback pass (upload a fixture with `Sdk.upload`, play it back,
  seek over pooled WebTransport sessions) still needs to be run manually
  against a Sia testbed — the transport requires real hosts.
- Firefox/Safari cross-browser passes not yet executed; the main-thread MSE
  fallback is implemented behind the same `SOURCE_OK`/`CHUNK` protocol.
