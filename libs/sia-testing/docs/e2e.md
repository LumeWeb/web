# Running cluster E2E tests

Maintainer instructions for the source checkout. Use an already running disposable loopback cluster; the runners create and delete accounts and objects, but never start, mine, restart or stop the cluster.

## Prerequisites

Use Node.js 24 and Linux with Python 3, flock, subreaper and pidfd support. The Node entrypoints load TypeScript support modules through Node's native type stripping. Install the workspace dependencies before running tests.

The current preflight requires 30 hostd, one Indexd and no renterd, with all hosts upload-ready and no failed scans. The chain must be synced, match the configured height and have a tip younger than three hours. The host-volume filesystem must have at least 9.5 GiB available.

Recipient summaries need the Indexd compatibility patch in `maintainers/sia-testing/indexd-shared-object-summaries.patch`. Apply it to a clean cluster source checkout at `b2a67d62140d1b01e16177fedbaf51cc13ac4e89` before building; the tested service fork is `14b75cd5ed1ce4e73e52c6bc1a172635769e8799`. Stock Indexd summary responses are incompatible with SDK 0.1.4. This patch is not applied by the test runner.

## Environment

Supply credentials privately, not through checked-in files. All participating writers must use the runners' shared `/tmp/sia-testing-exclusive-cluster.lock`.

| Variable | Value |
| --- | --- |
| `SIA_TEST_ALLOW_MUTATION` | `1` to permit disposable resource changes |
| `SIA_TEST_INDEXD_URL`, `SIA_TEST_ADMIN_URL` | Loopback app/admin URLs without embedded credentials |
| `SIA_TEST_ADMIN_PASSWORD` | Admin password |
| `SIA_TEST_CLUSTER_PID`, `SIA_TEST_CLUSTER_UID`, `SIA_TEST_CLUSTER_START_TICKS` | Cluster process PID, UID and Linux start ticks |
| `SIA_TEST_CLUSTER_BINARY`, `SIA_TEST_CLUSTER_SHA256`, `SIA_TEST_CLUSTER_STATE` | Canonical binary path, lowercase SHA-256 and exact `-dir` path |
| `SIA_TEST_CLUSTER_URL`, `SIA_TEST_CHAIN_HEIGHT` | Loopback cluster API origin and expected height |
| `SIA_TEST_STORAGE_PATH` | Filesystem path holding host volumes |
| `SIA_TEST_CLUSTER_LOG` | Debug log for payload RPC observations |

HTTPS share-URL cases require a normally trusted HTTPS app listener; they are skipped on HTTP.

## Commands

Run from `libs/sia-testing`:

| Command | Scenarios |
| --- | --- |
| `pnpm test:real:native` | Native payloads, file paths and metadata |
| `pnpm test:real:native-token-expiry` | Fresh-process native routing control |
| `pnpm test:real:host-fixtures` | Controlled host metadata changes |

For native token deadlines, add `--scenario=key-expiry` or `--scenario=revocation` and set `SIA_NATIVE_TOKEN_ALLOW_FUNDED=1`.

Controlled host cases also need `psql`, `SIA_TEST_ALLOW_HOST_FIXTURES=1` and a private loopback PostgreSQL URL in `SIA_TEST_HOST_FIXTURE_DATABASE`. The database's complete 30-host key set must match the admin API and country DE must initially be absent. Run sequentially. Before changing rows, tests persist their original values and the selected service/database identity in a private recovery record. The record remains until restoration has been read back and verified. A retained record is intent, not proof that SQL committed. After forced termination, hold the shared mutation lock and verify the recorded service/database identity and complete host key set. Inspect the exact saved rows, restore only where needed, and read back before removing the record. Do not replay saved row IDs against a restarted or replaced database.

## Failed runs

Cleanup deletes acknowledged run-owned resources only. Uncertain registration or cleanup leaves private records under `/tmp/sia-native-cutoff-run-*`; failed ordinary suites retain diagnostics under `/tmp/sia-e2e-run-*`. Review those exact records before manual cleanup. Do not discover and delete other resources or assume account deletion reclaimed host sectors.

Child output is private and capped at 8 MiB. Do not publish raw logs, traces or recovery credentials; CI uploads only suite outcomes. Do not terminate the guardian to release a busy lock: it retains exclusion while owned descendants remain.

## Consumer executable and account API

Installed consumers use `sia-testing-e2e --cwd <absolute directory> -- <executable> [arguments...]` and `@lumeweb/sia-testing/e2e/node`; the package README includes the complete environment and ownership example. The source suite selector and native token checker share the delivered internal guardian, provisioning and recovery code. Checkout-private probe pages and observation helpers are not consumer APIs.

Record each acknowledged account key with `recordAccountKey` before funding waits. Close all consumer SDK resources inside the callback, before Node resource deletion. Cleanup attempts each independent phase, but a failed durable pre-delete write prevents that resource's DELETE and retains recovery data. Later eligible phases still run, and errors remain aggregated.
