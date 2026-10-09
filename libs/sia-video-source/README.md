# @lumeweb/sia-video-source

`@lumeweb/sia-video-source` is a video.js v10 media host for video stored on Sia. It reads ranged bytes through the Sia SDK, uses mediabunny to recognize and convert media to CMAF, and feeds Media Source Extensions (MSE). A dedicated worker owns the SDK and conversion work. On runtimes without worker MSE, the worker sends segments to the host for main-thread MSE.

The package exports a vanilla host from `.`, a React wrapper from `./react`, and worker setup helpers from `./worker`. Design history is in [`decisions/`](decisions/), with ADR 0011 describing backend policy and native providers.

## Install

```sh
pnpm add @lumeweb/sia-video-source
# or
npm install @lumeweb/sia-video-source
```

The package requires these video.js v10 beta peers at `10.0.0-beta.32`:

- `@videojs/core`
- `@videojs/media`
- `@videojs/spf`
- `@videojs/store`

`react` 18 or 19 and `@videojs/react` `10.0.0-beta.32` are required for the React entry. `@videojs/react` is optional when using the vanilla entry.

## First integration

The worker uses `WorkerConfig` for indexer and app metadata. The app-key supplier returns the 32-byte seed on demand; pass a supplier, never the seed value. The worker receives it only in an encrypted `APP_KEY` envelope.

```ts
import { SiaVideoSource } from "@lumeweb/sia-video-source";

const source = new SiaVideoSource({
  workerConfig: { indexerUrl, app },
  getAppKeySeed: () => appSdk.appKey().seed(),
});
source.attach(videoElement);
source.src = objectKey; // a 64-character object key or a Sia share URL
```

`SiaVideoSource` creates a module worker using the package's `./worker.js` entry. Set `mimeType` when the application knows the declared type, and set `preload` or `autoplay` through the media host contract. A share URL supplies object identity and decryption material, but an app-key connection still pays for ordinary downloads unless a sharing-key supplier is used.

### React

Render `SiaVideo` inside a video.js v10 `Player` or use it as a standalone video element. The `sia` prop is `WorkerConfig`.

```tsx
import { SiaVideo } from "@lumeweb/sia-video-source/react";

<SiaVideo src={objectKey} sia={{ indexerUrl, app }} getAppKeySeed={() => appSdk.appKey().seed()} />;
```

`SiaVideo` also accepts `mimeType`, `logger`, `onTransportTelemetry`, `getSharingKeySeed`, and `reloadKey`. Seed suppliers are called for a worker handshake and their returned buffers are scrubbed. `reloadKey` triggers one in-place configuration reload when its value changes.

## Worker setup

Most bundlers support the default worker factory. To construct the worker yourself, use the worker subpath:

```ts
const worker = new Worker(new URL("@lumeweb/sia-video-source/worker", import.meta.url), { type: "module" });
const source = new SiaVideoSource({
  createWorker: () => worker,
  workerConfig: { indexerUrl, app },
  getAppKeySeed,
});
```

The default factory resolves `./worker.js` relative to the built package entry. The worker entry auto-installs its message listener when evaluated in a dedicated worker. For custom composition, `./worker` exports `installSiaVideoSourceWorker`, `createDefaultWorkerComposition`, `SiaVideoWorkerOptions`, `SiaVideoSdk`, `WorkerCompositionHost`, and `createSiaTransportPolicy`.

`SiaVideoWorkerOptions.createSdk(config, appKeySeed, sharingSeed)` injects an SDK factory. `createCompositionRoot` replaces the default worker composition when an app owns the complete worker runtime. The package still validates the typed protocol and does not install or manage a Service Worker.

## Backend policy and native providers

`backend` accepts `"auto"`, `"media-worker"`, and `"service-worker"`; `"auto"` is the default.

| Policy           | Behavior                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| `media-worker`   | Uses the package worker, Sia SDK, mediabunny conversion, and MSE.                                             |
| `service-worker` | Requires an app-owned `SiaNativeStreamProvider`; failures are reported.                                       |
| `auto`           | Uses a native provider when available, then falls back to the media worker once per attached source instance. |

The package never registers or controls the app's Service Worker. A provider reports availability and returns a stream URL. Its `release()` method is idempotent. Whole-file `Blob` results are rejected.

```ts
import { createSiaNativeStreamProvider, SiaVideoSource } from "@lumeweb/sia-video-source";

const nativeStreamProvider = createSiaNativeStreamProvider(service);

const source = new SiaVideoSource({
  backend: "auto",
  nativeStreamProvider,
  onTransportTelemetry: console.log,
});
```

`createSiaNativeStreamProvider` takes a service with `isAvailable(signal)`, `resolve(src, signal)`, and `session(source, signal)` methods and builds the provider from it, so the common case needs no adapter boilerplate. It also accepts the `SiaNativeStreamProviderDependencies` callback object (`capability`, `resolveSource`, `createStreamSession`) for integrations that wire the three callbacks by hand.

The provider owns SDK setup, authorization, and Service Worker scope. The host owns backend selection, cancellation, assigning the returned URL, and releasing the stream. Native loads expose `sia-source-info-change` with `{ kind: "native" }` and no `info`; worker loads expose `{ kind: "worker", info }`.

For keyless share playback, supply `getSharingKeySeed`. The sharing key is read-only and scoped by the key owner. A share URL routes through `SharedSdk` when that supplier is present. With both suppliers, object keys use the app-key SDK and share URLs use the sharing-key SDK.

## How media is handled

```text
Sia SDK ranged reads feed the worker, which produces mediabunny CMAF output for MSE
                                             |                 |
                                  worker MediaSource       host MediaSource
```

The worker path accepts media that mediabunny can recognize and convert to CMAF with tracks and codecs supported by the browser's MSE implementation. The package does not parse MP4 boxes itself or use mux.js. Native provider loads bypass this conversion path.

Worker MSE is selected from runtime capability detection. `workerMse: "main"` forces the host fallback; the default `"auto"` uses worker MSE where available. Managed Media Source requires the host element preparation used by the package. Runtimes with no supported MSE surface report a `device` failure.

## Player features

The root entry exports three default features in `siaFeatures`:

| Feature            | State                | Selector              | React hook         |
| ------------------ | -------------------- | --------------------- | ------------------ |
| Recovery           | `SiaRecoveryState`   | `selectSiaRecovery`   | `useSiaRecovery`   |
| Load acceptance    | `SiaLoadState`       | `selectSiaLoad`       | `useSiaLoad`       |
| Source information | `SiaSourceInfoState` | `selectSiaSourceInfo` | `useSiaSourceInfo` |

Compose the tuple with the video.js store or player:

```ts
import { combine } from "@videojs/store";
import { siaFeatures } from "@lumeweb/sia-video-source";

const features = combine(...siaFeatures);
```

`combine` and `createPlayer({ features: siaFeatures })` accept the same tuple. The optional `siaProgressFeature` derives reader counters from worker milestones; it is not in `siaFeatures` and requires a debug-level logger. React consumers can use `useSiaProgress` from `@lumeweb/sia-video-source/react`.

The host also emits `sia-recovery-change`, `sia-load-change`, `sia-source-info-change`, and `sia-worker-milestone-change`.

## Lifecycle and configuration

- `attach(element)` starts the worker session and sends the handshake. The current configuration and source are used for the session.
- `detach()` aborts active work, releases backend resources, and removes the media attachment. The host can be attached again.
- `destroy()` is terminal. It tears down the worker and backend resources.
- Assigning `src` replaces the current load. The host drops the stored error and starts a new request.
- `reloadConfiguration()` re-runs the worker handshake against the current worker config and seed suppliers without replacing the media element. Use it after a connection identity or credential provider changes while attached.

`workerConfig`, `workerMse`, and seed presence are handshake inputs. `src`, `mimeType`, and media attributes apply to loads. The host uses request IDs and generation checks to discard late work from replaced loads.

## Telemetry and logging

`onTransportTelemetry` receives `{ status, bytesDownloaded }`. `status` is `connecting`, `downloading`, or `idle`. The callback is observational; exceptions from it do not change playback. Telemetry covers native and media-worker transports.

The `Logger` interface supports `trace`, `debug`, `info`, `warn`, `error`, child scopes, and a level filter. The package exports `createConsoleLogger`, `nullLogger`, and `wrapLoglevel`. Worker milestones are opt-in through the logger threshold, forwarded under `logger.child("worker")`, and capped at 256 messages per connection. Logs contain no seed, decrypted key, or share URL; share playback is represented by `share: true`.

## Errors and troubleshooting

Worker failures map to `MediaError` codes as follows:

| Worker kind   | MediaError code | Meaning                                                    |
| ------------- | --------------: | ---------------------------------------------------------- |
| `device`      |               4 | The runtime has no supported MSE surface.                  |
| `unsupported` |               4 | The source or codec cannot reach browser MSE.              |
| `decode`      |               3 | The browser rejected appended media.                       |
| `network`     |               2 | Sia transport or ranged reading failed.                    |
| `quota`       |               3 | Source buffer quota could not be cleared.                  |
| `unavailable` |            none | A seek target was unavailable; the session remains usable. |

- If the app-key handshake fails, check `workerConfig`, the supplier, and the SDK registration. A share URL alone does not pay for app-key playback.
- If a share URL is rejected, preserve its query and fragment and check that the sharing key is attached to the object. Use `getSharingKeySeed` for keyless playback.
- If Safari reports a device error, use iOS 17.1 or newer or a recent desktop browser. Safari support depends on its Managed Media Source implementation.
- If playback reports unsupported media, confirm that the source has browser-supported video and audio tracks and that the declared MIME is not being used as proof of codec support.
- If many reads fail with WebTransport session exhaustion, keep the default shared read budget or provide a lower transport policy concurrency.

## Ownership and limits

The app owns SDK login, app and sharing key suppliers, worker construction when customized, native provider setup, and any Service Worker. The package owns worker lifecycle, protocol validation, backend choice, cancellation, conversion, MSE setup, and provider release.

Known limits include a 30-second MSE back buffer, a default SDK read concurrency of 4, a 256-message worker log cap per connection, and the browser's pending WebTransport session limits. Seeking uses ranged windows and a buffered timeline; the package does not provide a byte index. Native provider loads do not publish worker source facts.

## Development

Run commands from the repository root or use the package filter:

```sh
pnpm --filter @lumeweb/sia-video-source build
pnpm --filter @lumeweb/sia-video-source lint
pnpm --filter @lumeweb/sia-video-source test
pnpm --filter @lumeweb/sia-video-source test:browser
SIA_TEST_ENV=node pnpm --filter @lumeweb/sia-video-source test
```

`test` uses browser mode by default in the Vitest configuration and runs Chromium and Firefox. `SIA_TEST_ENV=node` selects the Node environment. The browser suite has Firefox coverage; Safari requires a separate device or browser run.

Source ownership is split between `src/sia-video-source.ts` for the host, `src/session/` for worker coordination, `src/media/` and `src/sink/` for media flow, `src/worker.ts` and `src/worker-runtime.ts` for the worker entry, and `src/react/` for the wrapper. Add design decisions as numbered append-only files under `decisions/`; the next number after 0011 is 0012. Verify public examples against the package exports and types before changing this README.
