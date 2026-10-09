# 0011: separate backend policy from app-owned native stream playback

## Status

Accepted (implemented in `libs/sia-video-source`)

## Context

The package has two playback paths with different owners. The media-worker path
runs the Sia SDK, source inspection, media conversion, and MSE plumbing through
the package worker. Some applications already own a native Sia stream service,
which can expose an authorized stream URL to an HTML media element. The package
must support that path without moving the app's SDK or service-worker
lifecycle into the library.

A native stream cannot provide the facts produced by the media-worker load
pipeline. The package therefore must not claim container, duration, track
codec, MSE-mode, or MSE-MIME facts for a native load. Its transport callback
also needs a small, backend-neutral shape so applications can observe progress
without coupling to worker messages.

## Decision

`SiaVideoSource.backend` accepts `auto`, `media-worker`, and `service-worker`,
with `auto` as the default.

- `media-worker` uses the package's dedicated worker and the existing SDK,
  inspection, conversion, and MSE path.
- `service-worker` requires an app-supplied `SiaNativeStreamProvider`. The
  provider reports availability and opens a stream URL for a source. The host
  assigns that URL to the attached media element, aborts an in-flight open when
  the source or lifecycle changes, and calls the returned stream's idempotent
  `release()` method. The package does not install or control a Service Worker.
- `auto` asks the provider whether it is available. An unavailable provider or
  a native acquisition failure selects the media-worker path once per attached
  source instance. The forced `service-worker` policy reports the failure instead of
  selecting another backend.

The provider owns Sia SDK setup, service-worker scope, URL authorization, and
source resolution. Its `open` callback may receive a MIME type, a name, an
abort signal, and transport callbacks, but it must return a stream URL rather
than a whole-file `Blob`.

The `sia-source-info-change` feature discriminates the active load by backend.
A media-worker `SOURCE_OK` publishes `kind: 'worker'` with `SourceInfo`; native
URL attachment publishes `kind: 'native'` without `info`, because the native
provider, not the package load pipeline, owns source interpretation.
`onTransportTelemetry` reports only `connecting`, `downloading`, or `idle` and
cumulative bytes for the active transport load. Telemetry callback exceptions
are ignored so observation cannot change playback.

The app-key and sharing-key handshake options apply to the media-worker SDK.
Native providers receive the source and open options through their own adapter.

## Consequences

**Easier**

- An application can select a native stream path without shipping a second SDK
  instance inside this package's worker.
- `auto` preserves the package worker as a fallback when native playback is
  unavailable or fails during acquisition.
- Source facts and telemetry describe only what the active backend can prove.

**Harder**

- Consumers must provide and maintain a native provider when they select the
  native path.
- Native loads do not expose the media-worker `SourceInfo` facts, so consumers
  that need container or track details must obtain them from their provider.
- Two backend lifecycles must release resources correctly when a source,
  attachment, or backend policy changes.

## Relation to earlier ADRs

[0002](0002-worker-owner-streaming-engine.md) remains the decision for the
media-worker streaming engine. Its rejection of a package-owned Service
Worker is not a rejection of an app-owned provider that returns a native URL.
[0003](0003-mse-fmp4-remux-and-unsupported-format.md) remains the media-worker
conversion policy; native playback bypasses that conversion path.
[0006](0006-app-key-handshake-to-worker.md) remains the credential handoff for
the media-worker SDK; native providers own their credential flow.
