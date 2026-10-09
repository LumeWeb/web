# Sia video source package

This package adapts Sia ranged reads to the video.js v10 media contract. The worker owns SDK reads and mediabunny conversion. The host owns the media element, protocol session, backend selection, and main-thread MSE fallback.

## Entry points and ownership

- `src/index.ts` is the root public entry. Keep host, feature, protocol, and shared type exports aligned with the package API.
- `src/react/index.tsx` owns `SiaVideo` and the React hooks. Seed values must stay behind supplier functions and must not enter props used as state.
- `src/worker.ts` and `src/worker-runtime.ts` own worker installation and composition options. `src/session/` owns handshake, request identity, load, and stream coordination.
- `src/protocol.ts` owns the wire unions, guards, request IDs, protocol version, and worker log catalog. `src/media/`, `src/sink/`, and `src/transport/` own conversion, MSE sinks, and transport policy.
- `decisions/` contains append-only ADRs. The next new ADR is 0012. Use scope or supersession notes when a later backend or implementation changes an earlier decision.

Do not move SDK credentials into `WorkerConfig`, React state, logs, or plaintext messages. App and sharing seeds travel in encrypted `APP_KEY` envelopes. Keep source-info kinds as `worker` with `SourceInfo` or `native` without `info`. Backend policy remains `auto`, `media-worker`, or `service-worker`; the auto native fallback is once per attached source instance. The package does not install a Service Worker. Mediabunny owns format recognition and CMAF conversion; do not document mux.js or a package-local container probe.

## Validation

Run from the repository root:

```sh
pnpm --filter @lumeweb/sia-video-source build
pnpm --filter @lumeweb/sia-video-source lint
pnpm --filter @lumeweb/sia-video-source test
pnpm --filter @lumeweb/sia-video-source test:browser
SIA_TEST_ENV=node pnpm --filter @lumeweb/sia-video-source test
```

Vitest uses browser mode by default in this package configuration and runs Chromium and Firefox. `SIA_TEST_ENV=node` selects Node mode. Check both modes when changing worker, MSE, protocol, or lifecycle code. Do not claim a green suite without recording any known baseline failures.

## Public docs discipline

README examples must match `src/index.ts`, `src/react/index.tsx`, `src/worker.ts`, and the declared package exports. Verify names, argument counts, peer versions, backend behavior, error mappings, and test commands against code before editing prose. Keep the README consumer-facing; put implementation rationale in ADRs or code comments. Apply the root writing rules and the de-AI skill: use plain words, no em dashes, and no filler claims.
