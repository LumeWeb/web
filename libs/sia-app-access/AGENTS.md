# Sia access

Keep credential bytes and recovery phrases out of snapshots and diagnostics. Store reads transfer owned buffers. A write must copy any retained bytes before its promise settles, including rejection. The memory store keeps async methods so copy errors reject instead of throwing before a promise is returned; its local lint exception applies only to `src/credentials.ts`.

Public finite values use string enums with stable serialized values and declaration order. Keep named readonly interfaces, session generics and command-local effects. Do not turn a type contract into a placeholder runtime implementation.

Keep transition admission in `src/access-machine.ts`. Release completed command scopes and settle their promises before completion publication. Cancelled closures cannot publish over a replacement command. Retirement denies new session work immediately but delays disposal until admitted borrowers settle. Preserve application-work failures unchanged, including non-Error values.

Use `@/` for tests-to-source imports. Package examples use public exports. Emitted contract checks import `dist` and compile without DOM or ambient Node types. Source checks must work without `dist`; only artifact checks build it. Use `pnpm run build` so aliases are rewritten with the emitted import extensions.

Reuse public `@lumeweb/sia-testing` APIs for synthetic auth and application work. Keep controlled adapters for boundaries those fixtures do not model, including late native completion and existing-key phrase matching. The test-only async/receiver lint exceptions cover Promise-shaped doubles and deliberate method identity probes. Do not import private testing modules or add another auth protocol.

Keep root imports independent of optional runtimes. Verify the actual npm and pnpm archives in isolated consumers when exports or packing change. Keep reference plans, reports and private paths out of product files. Do not add a documentation checker or Markdown parser.
