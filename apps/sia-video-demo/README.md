# Sia video demo

## Account access

The demo uses `@lumeweb/sia-app-access` for account approval, recovery phrase checks, registration, and saved-key reconnect. The account controller uses `@lumeweb/sia-app-access/sia` to own its lazy SDK connections and sessions. The auth store keeps its existing persisted app-key field, indexer setting, and sharing-key route; sharing links still open the player without account approval. The controller owns account SDK sessions until logout or an indexer change.

The player gets its native stream service from `src/lib/demoStreamService.ts`. That module reads the live account key and the separate sharing key when video needs them; startup has no auth configuration call. Video creates and owns its own SDKs. A saved account key is not used for playback until access has an active session.

## Browser playback E2E without Sia services

Run `pnpm --filter @lumeweb/sia-video-demo test:e2e:mock` from the repository root after installing Playwright Chromium and Firefox. It builds the shared dependencies and runs the production demo UI and packaged media pipeline.

Each test owns a managed mock run and a private browser context. Listing metadata and worker playback bytes come from the same backend, which checks the sharing seed supplied by the UI and encrypted worker envelope. No live Sia endpoint or account is used. The tests exercise shared-row selection and the visible seek control, requiring real decoded frames. Deselecting a row or closing a share must cancel its matching request receipt, and the UI must recover when the object lookup fails once.

The suite selects worker-only playback through the demo's developer controls. Native tests return local MP4 URLs after managed-reader authorization; they check stream release and worker fallback when native setup fails or is unavailable. SDK streaming service workers remain blocked. A rejecting browser proxy blocks non-loopback HTTP requests without forwarding them. This covers the demo UI and worker playback, not real host transport or SDK streaming-service-worker compatibility.

`test:e2e:mock:collect` lists the cases without opening a browser or starting a listener. `test:e2e:mock:build` builds the mock-backed demo into `dist-playback` after the library and testing package have been built. Failure output includes media state and the mock server's request history.

## Packed consumer checks

After building `sia-testing` and the shared tsdown config, run
`node scripts/check-consumers.mjs` from `libs/sia-testing`. It packs both
libraries offline, then type-checks, lints and builds the library and demo
playback pages against the packed library. It collects their Chromium and
Firefox cases without starting a browser or service and checks the packed
worker setup entry.

Mock playback does not establish real-SDK compatibility. The library's separate
[read-only SDK check](../../libs/sia-video-source/tests/contract/README.md)
requires pre-provisioned objects and explicit endpoint and transfer approval.
