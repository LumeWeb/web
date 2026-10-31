# Running guarded consumer E2E tests

Use an already running disposable loopback cluster. The account helper creates and deletes accounts and keys; the executable never starts, mines, restarts or stops the cluster.

## Prerequisites

Use Node.js 24 and Linux with Python 3, flock, subreaper and pidfd support. Source entrypoints load TypeScript support modules through Node's native type stripping.

The current preflight requires 30 hostd, one Indexd and no renterd, with all hosts upload-ready and no failed scans. The chain must be synced, match the configured height and have a tip younger than three hours. The host-volume filesystem must have at least 9.5 GiB available.

Set the explicit service, storage and process-identity environment values described in the [package README](../README.md#guarded-consumer-e2e-tests). Keep admin credentials in Node, never in browser pages or checked-in files. All participating writers must use `/tmp/sia-testing-exclusive-cluster.lock`.

## Consumer command and account API

Installed consumers run `sia-testing-e2e --cwd <absolute directory> -- <executable> [arguments...]`. The equivalent source entrypoint is `node src/e2e/cli.ts` from `libs/sia-testing`. Help needs no deployment settings or consent.

The public `@lumeweb/sia-testing/e2e/node` entry provides `readE2EService` and `withDisposableAccount`. It does not configure SDK assets, browser certificates or a test runner. The README includes the account approval and registration example.

Record each acknowledged account key with `recordAccountKey` before funding waits. Close all consumer SDK resources inside the callback, before Node resource deletion. Cleanup attempts each independent phase, but a failed durable pre-delete write prevents that resource's DELETE and retains recovery data. Later eligible phases still run, and errors remain aggregated.

## Failed runs

Cleanup deletes acknowledged run-owned resources only. Uncertain registration or cleanup leaves private records under `/tmp/sia-native-cutoff-run-*`; failed commands retain diagnostics under `/tmp/sia-e2e-run-*`. Review those exact records before manual cleanup. Do not discover and delete other resources or assume account deletion reclaimed host sectors.

Child output is private and capped at 8 MiB. Do not publish raw logs, traces or recovery credentials. Do not terminate the guardian to release a busy lock: it retains exclusion while owned descendants remain.
