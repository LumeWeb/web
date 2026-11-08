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

Forms and input errors belong to the application. Observing a controller does not authorize access or dispose it.

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

Browser tests start Vite on port 4173; that port must be free. They use shared synthetic Sia fixtures for approval and application operations. Existing-account phrase matching is tested with a controlled adapter, not the shared synthetic protocol. These checks do not verify live Sia authorization.
