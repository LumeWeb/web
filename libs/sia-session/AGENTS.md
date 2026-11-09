# Sia session maintenance

These instructions apply to `libs/sia-session/` and supplement the repository's `AGENTS.md`. This package shares SDK lifetimes; keep account policy and application integration in their owning packages.

## Public contract

- Export consumer APIs only through `src/index.ts` and `src/abort.ts`. Keep native cancellation types out of the root declarations so consumers need neither DOM nor ambient Node types.
- Put shared public SDK interfaces and named callbacks in `src/types.ts`. Keep types used by one owner beside that owner. Explain exported functions and public methods with JSDoc, and keep the README API reference and examples aligned with the exports.
- SDK cleanup differs by platform. The Sia storage 0.2.0 WASM client has `free()`; its native Node client does not. Check the actual client declarations and cleanup contract before writing an adapter or example.
- `createSessionFromClient` captures `free()` with its original receiver. Borrowed types omit `free` and symbol members, but the runtime client remains unchanged. Do not clone SDK objects or treat type omission as a security boundary.
- Keep `SdkSource` unable to replace or close its provider. Callback contexts must not expose `release`; explicit leases own their release authority.
- Preserve error and cancellation identity. Notification failures must not interrupt an accepted transition, replace work errors or strand retention. Observe async notification failures without awaiting them.

## State ownership

| Module                          | Responsibility                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `src/session.ts`                | Current SDK, stable frozen snapshots and permanent closure; captures entries for cleanup barriers.           |
| `src/internal/ownership.ts`     | Weak client and handle identity claims, admission checks around caller getters and captured cleanup methods. |
| `src/internal/entry.ts`         | One SDK's lease count, retirement reason and exactly-once disposal completion.                               |
| `src/internal/wait-for-sdk.ts`  | One pending availability wait and subscription handoff; each attempt owns its acquired lease until transfer. |
| `src/internal/notifications.ts` | Callback failure reporting and disposal notifications, without selecting SDKs or counting leases.            |
| `src/internal/subscriptions.ts` | Active callback guards and unsubscribe ownership, without SDK-specific policy.                               |
| `src/map.ts`                    | Projected values that retain their parent's identity and lease.                                              |
| `src/abort.ts`                  | Public native cancellation linkage and availability-wait wrappers.                                           |

Keep independently owned state together. Avoid passing a shared mutable context between these modules. Reuse named types for nested or repeated callback signatures without creating a general event framework.

## Lifecycle rules

- Concurrent leases are supported. Retirement stops new admission to an old SDK but never frees it while leases remain. Do not replace reference counting with a mutex or add forced cleanup timeouts.
- Commit a replacement before invoking predecessor retirement callbacks. Caller-controlled getters and callbacks can reenter, replace or close the session before the outer call returns.
- Both adoption methods must reject known identity reuse. A rejected unused SDK stays caller-owned; never dispose it as part of rejection.
- Capture a cleanup barrier's entries at invocation. `clear` waits for its removed SDK; `drain` captures already retired pending entries; `close` captures all pending entries and returns a stable promise afterward.
- Remove completed entries from pending cleanup before calling external disposal or error hooks. A reentrant drain must not collect an already completed failure.
- Stop subscriptions before invoking provider unsubscribe. Captured emission arrays and synchronous registration callbacks must not deliver after stop. Attempt independent cleanups even if one provider throws.
- Availability-wait attempts retain ownership until successful handoff. A failed currentness check or unsubscribe must attempt lease release. Caller cancellation listeners must detach even if another unsubscribe throws.
- Aborting or disposing a cancellation linkage does not release a lease. Retain the SDK until native work and its dependent resources have finished.

## Verification

Run from the repository root:

```sh
pnpm --filter @lumeweb/sia-session typecheck
pnpm --filter @lumeweb/sia-session test
pnpm --filter @lumeweb/sia-session lint
pnpm --filter @lumeweb/sia-session format:check
pnpm --filter @lumeweb/sia-session test:contracts
pnpm --filter @lumeweb/sia-session test:package
```

Use `pnpm --filter @lumeweb/sia-session format` to format package files. Run source checks before build-based checks; source tests and type checking must work without `dist/`. CI follows that order in `.github/workflows/sia-session.yml`.

Add a failing regression before fixing a reproducible lifecycle defect. Cover reentrant ordering and throwing supplied methods when they affect cleanup. For type-only refactors, check emitted contracts and preserve runtime output. Do not weaken tests or patch installed dependencies to obtain passing results.

`tests/types/core.ts` checks emitted root declarations without platform globals. `tests/package/` checks packed ESM imports and runtime behavior outside the checkout with npm and pnpm. Keep archive tests independent of workspace source imports. These tests provide synthetic evidence, not proof of live SDK or browser behavior.

Check README examples against emitted types when editing them. Do not connect live accounts, create billable resources or publish the package as part of documentation verification.
