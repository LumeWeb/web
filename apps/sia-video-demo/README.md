# Sia video demo

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
collects both specs. It uses cached dependencies without installation. Those
checks do not establish a live pass.
