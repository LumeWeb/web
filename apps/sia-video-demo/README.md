# Sia video demo

## Browser playback E2E without Sia services

Run `pnpm --filter @lumeweb/sia-video-demo test:e2e:mock` from the repository root after installing Playwright Chromium and Firefox. It builds the shared dependencies and runs the production demo UI and packaged media pipeline.

Each test owns an HTTP payload mock. The Node SDK creates encrypted listing metadata against that local model; the playback worker uses `createRemoteMockSdk` for bytes from the committed MP4 fixture. No live Sia endpoint or account is used. The tests exercise shared-row selection and the visible seek control, requiring real decoded frames. Deselecting a row or closing a share must cancel the held server request, and the UI must recover when the object lookup fails once.

The suite selects worker-only playback through the demo's developer controls and blocks SDK streaming service workers. A rejecting browser proxy blocks non-loopback HTTP requests without forwarding them. This covers the demo UI and worker playback, not real host transport or SDK streaming-service-worker compatibility.

`test:e2e:mock:collect` lists the cases without opening a browser or starting a listener. `test:e2e:mock:build` builds the mock-backed demo into `dist-playback` after the library and testing package have been built. Failure output includes media state and the mock server's request history.

## Manual real-service picker E2E

`tests/e2e/page.ts` calls the production `createSharedObjectsClient` and
`listSharedObjects` functions. It uploads metadata with the JSON filename
`"  demo\u0000  clip.mp4  "`, shares the object, then lists real SDK summaries
with a page size of one. The live spec expects one picker row named
`demo clip.mp4`, size 3, and the uploaded object ID. It checks the progressive
first page and the empty terminal page, including offsets and row counts.
It does not replace SDK summaries with fixtures or test video playback.

The page owns its SDK, objects, sharing key and listing client. The Node spec
uses `readE2EService` and `withDisposableAccount` from the public
`@lumeweb/sia-testing/e2e/node` entry. The registration binding waits for durable
account recording before the funding wait. Browser cleanup finishes before the
account callback returns, including failure paths.

Run `test:e2e:collect` to list the spec without a server, or `test:e2e:build` to
build its page using the SDK Vite plugin. `test:e2e:live` is a manual command:

```sh
sia-testing-e2e --cwd "$PWD" -- playwright test --config playwright.e2e.config.ts
```

Follow the Node 24/Linux/Python, explicit service/storage, consent and host SPKI
requirements in `@lumeweb/sia-testing`'s README. The executable owns the lease
through browser/account cleanup and postflight. Separate operator authorization
is required for a live run; no CI task runs this command.

After building `sia-testing` and the shared tsdown config, its
`node scripts/check-consumers.mjs` command packs both libraries offline, checks
the copied consumer imports and types, lints and builds both pages, and safely
collects both legacy specs. It also type-checks and builds the mock-backed demo
against the packed library, then collects its browser cases. It uses cached
dependencies without installation. Those checks do not establish a live pass.
