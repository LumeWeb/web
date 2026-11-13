# Configure live authentication

Node runs authenticate an owned SDK process against an existing server. They do not deploy a server or fund an account. Use a private profile with [the live backend](live-runs.md).

## Borrowed authority

A version 1 profile contains an API base URL and application metadata. Its authentication mode is one of:

- `app-key`: reconnect with an existing 32-byte app-key seed.
- `register`: use a recovery phrase after approving an SDK request with an existing connect key.
- `preauthorized`: use a recovery phrase with an existing 32-byte preauthorized-key seed.

The profile also supplies upload encoding and resource limits. Loading it requires explicit transfer and mutation consent for the same normalized API URL. HTTPS is required except for numeric loopback HTTP addresses.

Profiles must be absolute-path, owner-only regular files outside the checkout. The loader rejects final-component symlinks and multiply linked files. It reads at most 16 KiB and returns an opaque handle whose JSON and inspection output omit credentials. The parsed document is an immutable snapshot.

## Complete profile examples

These examples are synthetic and parse offline. They are not working credentials. Replace the reserved `.invalid` URLs, application fields, and authentication values with your own before requesting a live run. Store the resulting JSON outside your checkout in a private directory (`0700`) and an owner-only file (`0600`). Never commit a recovery phrase or journal.

All fields shown except `limits` are required. `limits` may be omitted or contain a subset; the values below are the parser defaults. Unknown fields are rejected. `app.id` and the key seeds are 32 bytes written as 64 hexadecimal characters. Application text must be nonempty and at most 4096 characters.

### Reconnect with an app key

`appKeyHex` is an existing app-key seed for this application, not a connect key or a recovery phrase.

```json profile=app-key
{
  "version": 1,
  "apiBaseUrl": "https://indexd.example.invalid/",
  "app": {
    "id": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "name": "Document tests",
    "description": "Owned synthetic fixtures",
    "serviceUrl": "https://app.example.invalid/"
  },
  "encoding": {
    "dataShards": 1,
    "parityShards": 0,
    "maxBufferedSlabs": 1
  },
  "limits": {
    "deadlineMs": 120000,
    "cleanupDeadlineMs": 30000,
    "maxObjects": 8,
    "maxShares": 8,
    "maxLogicalUploadBytes": 16777216,
    "maxDecodedDownloadBytes": 33554432,
    "maxObservedShardBytes": 67108864
  },
  "auth": {
    "kind": "app-key",
    "appKeyHex": "0101010101010101010101010101010101010101010101010101010101010101"
  }
}
```

### Register with a connect key

`phrase` is the account recovery phrase. `connectKey` approves the registration request; it is not the app-key seed. The phrase below is deliberately not a valid account recovery phrase. The profile parser checks nonempty text; the SDK validates authentication.

```json profile=register
{
  "version": 1,
  "apiBaseUrl": "https://indexd.example.invalid/",
  "app": {
    "id": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "name": "Document tests",
    "description": "Owned synthetic fixtures",
    "serviceUrl": "https://app.example.invalid/"
  },
  "encoding": {
    "dataShards": 1,
    "parityShards": 0,
    "maxBufferedSlabs": 1
  },
  "limits": {
    "deadlineMs": 120000,
    "cleanupDeadlineMs": 30000,
    "maxObjects": 8,
    "maxShares": 8,
    "maxLogicalUploadBytes": 16777216,
    "maxDecodedDownloadBytes": 33554432,
    "maxObservedShardBytes": 67108864
  },
  "auth": {
    "kind": "register",
    "phrase": "synthetic recovery phrase replace before live use",
    "connectKey": "synthetic-connect-key-replace-before-live-use"
  }
}
```

### Use a preauthorized seed

`preauthorizedKeyHex` is a preauthorized-key seed, not an app key. Registration also needs the account recovery phrase. Replace the synthetic phrase before SDK use. Cleanup reconnects with the acknowledged app key, without consuming a second preauthorization.

```json profile=preauthorized
{
  "version": 1,
  "apiBaseUrl": "https://indexd.example.invalid/",
  "app": {
    "id": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "name": "Document tests",
    "description": "Owned synthetic fixtures",
    "serviceUrl": "https://app.example.invalid/"
  },
  "encoding": {
    "dataShards": 1,
    "parityShards": 0,
    "maxBufferedSlabs": 1
  },
  "limits": {
    "deadlineMs": 120000,
    "cleanupDeadlineMs": 30000,
    "maxObjects": 8,
    "maxShares": 8,
    "maxLogicalUploadBytes": 16777216,
    "maxDecodedDownloadBytes": 33554432,
    "maxObservedShardBytes": 67108864
  },
  "auth": {
    "kind": "preauthorized",
    "phrase": "synthetic recovery phrase replace before live use",
    "preauthorizedKeyHex": "0202020202020202020202020202020202020202020202020202020202020202"
  }
}
```

### Encoding and limits

`dataShards` is an integer from 1 to 255, `parityShards` from 0 to 254, and their sum cannot exceed 255. `maxBufferedSlabs` is from 1 to 8. Encoding has no defaults.

Both deadline fields accept 1 through 120000 milliseconds. Object and share limits accept 0 through 64. `maxLogicalUploadBytes` accepts 0 through 16777216, `maxDecodedDownloadBytes` 0 through 67108864, and `maxObservedShardBytes` 0 through 268435456. All limits are safe integers. Observed shard bytes are progress counters, not a hard financial limit.

Consent must explicitly set `transfers: true` and `mutations: true` and name the same normalized `apiBaseUrl`. The API URL cannot include credentials, a query, or a fragment. The loader adds a trailing slash. For the examples above, consent uses `https://indexd.example.invalid/`; no request to that reserved host is useful.

## SDK lifetime

The installed SDK must be version `0.2.0`. Authority reaches the agent over Node IPC rather than command-line arguments. The agent uses a small environment allowlist, with inherited module-loader and native-loader overrides removed. Its stdout and stderr are discarded; RPC failures contain fixed messages and classified codes.

The parent owns the process lifetime. The agent still uses the network and operating-system permissions of the caller. A request deadline or abort stops the process before the request rejects. Shutdown first sends SIGTERM, then SIGKILL if the child remains alive. Failure to confirm exit within the cleanup deadline is reported as uncertain termination.

Registration approval validates the response URL's origin and connection path before sending the connect key as the Basic-auth password. Redirects are rejected. The decision body is explicit, including denial. SDK sign-in and account-readiness polling run inside the execution deadline; an app-ID mismatch fails instead of returning an unrelated account.

The framework does not own or delete the operator's account. Logical-byte limits and SDK progress counters are not hard limits on encrypted network traffic or charges.

## Offline evidence

Tests use synthetic owner-only profiles and owned loopback HTTP listeners. They exercise profile rejection and approval URL restrictions, including redirects. Process tests check that cancellation and channel loss stop children that ignore SIGTERM.

Installed-SDK tests cover all authentication entrypoints and account-readiness polling. Their preauthorization fixture checks the supplied key identity and simulates approval; it does not model Indexd's cryptographic proof validation. A separate installed-SDK case blocks an authentication request and confirms that aborting the owner stops its native process.

No real-server authentication or transfer was run. These checks do not establish endpoint compatibility or upload readiness on an operator's server.
