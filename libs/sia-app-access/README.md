# Sia application access

Scoped credential storage and framework-free TypeScript contracts for Sia access adapters. The package is private and does not include a controller implementation.

## Store credentials in memory

```ts
import { createMemoryCredentialStore } from "@lumeweb/sia-app-access";

const credentials = createMemoryCredentialStore();
const scope = {
  appId: "a".repeat(64),
  indexerUrl: "https://indexer.example/",
};
const key = new Uint8Array(32).fill(1);
await credentials.write(scope, key);
key.fill(0);

const restored = await credentials.read(scope);
if (restored?.[0] !== 1) throw new Error("Expected the stored copy");
restored.fill(0);
await credentials.remove(scope);
```

Each store owns its records. Writes retain copies and reads return copies; removing one scope leaves other records intact. Read [credential ownership](docs/credentials.md) before implementing a persistent store.

The root entry also exports access states, command results and adapter interfaces. Import contracts such as `SiaAccessAdapter<Session>` with `import type`. Runtime constants use string enums; for example, `AccessOutcome.Ready` is `"ready"`.

## Development

Run these commands from this package directory:

```sh
pnpm run typecheck
pnpm test
pnpm run lint
pnpm run format:check
pnpm run test:contracts
pnpm run test:package
```

Typecheck and source tests do not require a build. Contract and archive checks build the package with TypeScript and rewrite emitted import paths with `tsc-alias`. Run `npm run test:package` as well to check npm's archive output.
