# 0002: own the streaming engine in a dedicated web worker

## Status

Accepted (2026-09-08; implemented in `libs/sia-video-source`)

Scope note: this decision covers the package-owned media-worker engine. ADR
[0011](0011-backend-policy-and-native-stream-provider.md) defines the boundary
for an app-owned native stream provider. The package does not install or own a
Service Worker.

## Context

Sia playback needs the `@siafoundation/sia-storage` WASM SDK, ranged reads,
format recognition, conversion, and MSE coordination. These tasks need a
long-lived owner that can be stopped with one media element. A Service Worker
has browser-managed lifetime and a shared scope, while the package needs one
session per attached host. The main thread would also share SDK and conversion
work with rendering.

## Decision

A dedicated Web Worker owns the media-worker session. The public worker entry is
`@lumeweb/sia-video-source/worker`, implemented by `src/worker.ts` and
`src/worker-runtime.ts`. Session coordination lives in `src/session/`, ranged
transport in `src/ranged-reader.ts` and `src/transport/`, and media conversion
uses mediabunny through the media pipeline.

The worker owns SDK construction, ranged reads, source inspection, CMAF output,
and worker MSE when the runtime supports it. The host owns the v10 media
contract and uses a main-thread MSE sink when the worker reports `mode: "main"`.
The default worker is created from `new URL("./worker.js", import.meta.url)`;
applications may inject `createWorker` or a complete `createCompositionRoot`.

A package worker is not a Service Worker. Native URL playback is available only
through the app-owned provider described by ADR 0011.

## Consequences

The main thread avoids SDK and conversion work on the media-worker path. Worker
MSE moves append work out of the host where capability detection permits it.
The host still handles protocol messages, fallback MSE, and the video.js v10
contract.

The worker boundary makes every control and data operation asynchronous. Both
worker MSE and main-thread MSE remain supported paths, and failures must cross
the typed error protocol. Request identity prevents replaced loads from
appending stale data.

## Related ADRs

- Media contract: [0001](0001-custom-media-contracts.md)
- Conversion policy: [0003](0003-mse-fmp4-remux-and-unsupported-format.md)
- Ranged reads and deferred seeks: [0004](0004-ranged-seeking-and-deferred-seek.md)
- Worker wire protocol: [0005](0005-custom-zero-copy-proto-over-comlink.md)
- Native provider boundary: [0011](0011-backend-policy-and-native-stream-provider.md)
