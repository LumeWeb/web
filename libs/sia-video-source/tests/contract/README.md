# Read-only real-SDK compatibility check

This manual check uses SDK 0.1.4 and its streaming service worker through the public video-library streaming service. It checks known HTTP range bytes and decodes video before and after a seek. A valid sharing credential must read its shared fixture but receive HTTP 401, 403 or 404 when requesting the separate private app fixture.

No account is created or deleted. The check does not upload, pin or change sharing permissions. Downloads can incur charges: the app key and sharing key must belong to an explicitly approved, pre-provisioned test account.

## Fixtures

Use Node 24 on a POSIX host and an installed Playwright Chromium. Store a JSON file outside every checkout of this repository. The file must be owned by the current user, readable only by that user and at most 16384 bytes. Direct symlinks and files in the current worktree or its shared repository directory are rejected. Use mode `0600` or `0400`.

The following schema example needs real values before it can pass validation:

```json
{
  "version": 1,
  "indexerUrl": "https://indexer.example.invalid/api/",
  "userKeyHex": "<64 lowercase hex characters>",
  "sharingKeyHex": "<64 lowercase hex characters>",
  "timeoutMs": 120000,
  "maxTransferBytes": 16777216,
  "app": {
    "objectId": "<64 lowercase hex characters>",
    "sizeBytes": 131072,
    "rangeOffset": 2,
    "rangeBytes": [2, 3, 4],
    "seekSeconds": 1
  },
  "shared": {
    "objectId": "<different 64 lowercase hex characters>",
    "sizeBytes": 262144,
    "rangeOffset": 2,
    "rangeBytes": [5, 6, 7],
    "seekSeconds": 1
  }
}
```

Both objects must be browser-decodable MP4 videos with finite duration longer than their seek target. The app fixture must be readable with the registered app key and must not be shared with the configured sharing key. The shared fixture must be readable with that sharing key. Supply independently known range bytes and the actual object size; the sample byte lists are placeholders.

The HTTPS endpoint may have a path prefix but must have no credentials, query or fragment. Each object is limited to 4194304 bytes. Expected ranges contain 1 to 4096 bytes within the object. The combined transfer allowance must cover both object sizes and cannot exceed 33554432 bytes. The global Playwright timeout cannot exceed 120000 ms; the page also aborts its operations at that deadline.

The allowance counts SDK-reported decoded bytes across stream URLs, including repeated ranges. Crossing it aborts the run; progress delivery and in-flight work can overshoot it. It is not a cap on encrypted host traffic or charges. Browser context teardown stops the owned SDK streaming worker.

## Offline checks

From the repository root:

```sh
pnpm --filter @lumeweb/sia-video-source test:e2e:sdk:offline
pnpm --filter @lumeweb/sia-video-source test:e2e:sdk:build
pnpm --filter @lumeweb/sia-video-source exec tsc --noEmit -p tsconfig.contract.json
```

The offline tests exercise fixture validation and the real Playwright collection command with synthetic inputs. Collection is observed through an owned loopback TCP listener and must open no SDK connection. The build emits the page, WASM and SDK streaming worker without needing a fixture file.

## Manual execution

After obtaining approval for the endpoint, fixtures and transfer costs:

```sh
export SIA_VIDEO_CONTRACT_FILE=/private/path/video-contract.json
export SIA_VIDEO_CONTRACT_APPROVED_ORIGIN=https://indexer.example.invalid
export SIA_VIDEO_CONTRACT_RUN=1
pnpm --filter @lumeweb/sia-video-source test:e2e:sdk:collect
pnpm --filter @lumeweb/sia-video-source test:e2e:sdk
```

`APPROVED_ORIGIN` must exactly match the endpoint's origin, without its path or a trailing slash. Collection requires the same approval inputs but starts no browser or SDK connection. Execution serves a fresh consumer page at `127.0.0.1:4194`; it does not reuse another server. Retries are disabled.

Do not enable `DEBUG` or `PWDEBUG`; the approval check rejects them. Credentials enter the page as in-memory evaluation arguments and stay out of its URL and DOM. Browser-side failures return a fixed phase label rather than SDK error text. Traces, video and screenshots are disabled; temporary runner output is private, outside the repository and removed on normal process exit. Do not attach private inputs or browser debug logs to a PR.

The live command is separate from `readE2EService` and its loopback-only runner. It is not part of routine mock playback coverage and must not run in CI with real credentials.
