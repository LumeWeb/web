# Run checks

Run these commands from the package directory with pnpm 11.10.0 and Node 24.12.0, matching CI. This test environment does not establish which runtimes support live SDK authorization.

## Development setup

From the repository root, install and build the shared testing dependency:

```sh
pnpm install --frozen-lockfile
pnpm --filter=@lumeweb/tsdown-config build:config
pnpm --filter=@lumeweb/sia-testing build
```

Testing uses its declared SDK 0.1.4, while the access adapter uses SDK 0.2.0. `tests/dependencies.test.ts` checks that each resolves to its own version. The synthetic tests do not pass native SDK objects between those versions.

Browser checks need Playwright's Chromium and Firefox binaries. Archive checks need the system `tar` command on Linux and an npm or pnpm CLI.

## Source checks

These commands do not require access `dist` output:

```sh
pnpm run typecheck
pnpm test
pnpm run test:offline
pnpm run test:browser
pnpm run test:browser --browser=firefox
pnpm run test:browser:build
pnpm run example:react:build
pnpm run lint
pnpm run format:check
```

Node tests load TypeScript source through `tsx`. Browser fixtures load source through Vite. `pnpm test` also typechecks the package-consumer fixtures against source.

Playwright starts the Vite fixture server on `127.0.0.1:4173` and the example's dedicated server on `127.0.0.1:4174`; both ports must be free. The browser fixtures close their contexts before closing mock HTTP endpoints and cleaning up the test run. `test:browser:build` bundles the library fixtures. `example:react:build` bundles the standalone example without starting its mock backend.

Lint checks source types and style, then runs React's hook rules and Stylelint for the example's SCSS. Vite uses Sass to compile that stylesheet. Declaration fixtures contain intentional type errors checked by `test:contracts`. Prettier covers source and consumer templates.

To verify that source checks do not depend on a previous build, move access `dist` out of the package before running them. They must not recreate it. Restore the saved directory afterward, or rebuild it for artifact checks.

## Run the onboarding example

From the package directory, run `pnpm run example:react` and open `http://127.0.0.1:4174/`. Follow the [walkthrough](onboarding.md) for signup, save recovery and saved-key sign-in. Never enter a real recovery phrase.

The example uses a separate dependency cache so its server cannot overwrite the library fixtures' optimized modules. Its synthetic mock starts only in development and closes with the Vite server. Build and preview do not provide that backend.

Run its browser group alone with `pnpm exec playwright test tests/browser/onboarding.spec.ts`. The controlled race fixture covers edits, controller replacement and unmount. Existing-account phrase matching is checked with a controlled adapter, not the shared synthetic protocol. The walkthrough images illustrate the UI; they are not live authorization evidence or screenshot comparison tests.

## Build and artifact checks

```sh
pnpm run build
pnpm run test:contracts
pnpm run test:package
```

`build` runs TypeScript followed by `tsc-alias`, which rewrites internal `@/` imports to relative ESM paths in JavaScript and declarations. Use this command rather than bare emitting `tsc`, which can leave aliases that package consumers cannot resolve.

`test:contracts` rebuilds the package and compiles the fixtures in `tests/types/` against `dist`. Core declarations are checked without DOM or ambient Node types; optional entries are checked with the types they need.

`test:package` rebuilds and packs the package, then checks imports and declarations from an extracted tarball. It starts with optional runtimes absent. Later checks add React, render with ReactDOM without Zustand, then add Zustand for its `useStore`. The phrase-error mapper is also checked without React or RHF. Consumer dependencies are copied from installed packages; the tests do not install them or contact a registry.

The archive tests also check that missing exports and an eager SDK import fail for the expected reason. Subprocesses have timeouts and must report that their assertions ran. Temporary consumers are removed after the checks.

Run archive checks through either package manager:

```sh
npm run test:package
pnpm run test:package
```

## What the checks exercise

| Location                                                                     | Coverage                                                                                       |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `tests/core.test.ts`, `tests/ownership.test.ts`, `tests/credentials.test.ts` | Command preconditions, cancellation, storage ordering, copied key buffers and session disposal |
| `tests/shared.test.ts`, `tests/helpers/shared-adapter.ts`                    | Authorization and application operations through shared synthetic clients                      |
| `tests/sia.test.ts`, `tests/helpers/controlled-sdk.ts`                       | Allocation and disposal with controlled SDK substitutes                                        |
| `tests/offline/`                                                             | SDK 0.2.0 initialization and utilities using a local WASM file in separate Node processes      |
| `tests/browser/`                                                             | Rendered authorization and forms, React/Zustand observation, StrictMode and hydration          |
| `tests/types/`, `tests/package/`                                             | Public types, tarball contents and imports with optional dependencies absent                   |

The offline tests cover SDK-first and adapter-first initialization, failure and retry, default Node resolution and an unavailable native SDK entry. They check that initialization does not invalidate an existing SDK key. They do not contact a live account.

## Coverage limits

The shared auth and browser fixtures use a synthetic protocol, not native Indexd. Controlled SDK substitutes test disposal timing; offline tests run actual SDK initialization and utilities. Live authorization and saved-account reconnect remain untested. See [adapter limitations](adapters.md#current-integration-limits).

The browser and archive suites use React 19.2.7. Server rendering and browser hydration are checked separately. Only the archive checks verify what was actually included in the tarball.
