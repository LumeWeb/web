# Sia application access

Framework-free Sia authorization and session lifetime for application-owned interfaces. Supply an adapter for your backend; the controller keeps credential saving separate from registration and retains sessions through admitted work.

The package is private. Use it through the workspace or a local archive.

## Create access for an application

```ts
import { createSiaAccess, type SiaAccessAdapter } from "@lumeweb/sia-app-access";

export function applicationAccess<Session>(adapter: SiaAccessAdapter<Session>) {
  return createSiaAccess({
    adapter,
    application: {
      appId: "a".repeat(64),
      name: "My app",
      description: "Application storage",
      serviceUrl: "https://app.example/",
    },
    indexerUrl: "https://indexer.example/",
  });
}
```

Create the controller once in application bootstrap. Read [getting started](docs/getting-started.md) for account choices and session work. [The API reference](docs/api.md) lists command outcomes and cancellation effects; [credential ownership](docs/credentials.md) covers custom stores and save recovery.

For SDK 0.2.0, import `createSiaAdapter` from `@lumeweb/sia-app-access/sia` and supply it as the adapter. Read [adapters](docs/adapters.md) for setup and resource ownership. The SDK peer is optional; root imports and adapter construction do not load it.

Use the optional React 19 [observation hooks and context](docs/react.md), or read the same controller through a [readonly store](docs/stores.md). React observation uses `useSyncExternalStore` without requiring Zustand. The application retains controller lifetime.

Approval, phrase and save-recovery [tasks](docs/react.md#task-hooks) bind actions to the committed live interaction. Forms and input errors belong to the application; the optional `/react-hook-form` entry only maps phrase-correction outcomes to caller-supplied field messages. Observing a controller does not authorize access or dispose it.

See the [documentation index](docs/README.md) and [test coverage](docs/testing.md).

## Development

From the repository root, build the workspace testing dependency before checking this package:

```sh
pnpm --filter=@lumeweb/tsdown-config build:config
pnpm --filter=@lumeweb/sia-testing build
```

From this package directory:

```sh
pnpm run typecheck
pnpm test
pnpm run test:offline
pnpm run lint
pnpm run format:check
pnpm run test:browser:build
pnpm run test:browser
pnpm run test:browser --browser=firefox
pnpm run test:contracts
pnpm run test:package
npm run test:package
```

Typecheck, source tests and browser fixtures use access source without a prebuild. Artifact checks use the canonical TypeScript and `tsc-alias` build. Archive consumers run outside the workspace.

Browser tests start Vite on port 4173; that port must be free. They use shared synthetic Sia fixtures for approval and application operations. Existing-account phrase matching is tested with a controlled adapter, not the shared synthetic protocol. Offline SDK tests run initialization scenarios in separate processes, including a missing Node facade and recovery after asset failure. These checks do not verify live Sia authorization, saved-account reconnect or worker execution.
