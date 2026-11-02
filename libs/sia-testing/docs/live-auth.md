# Existing-server authentication internals

These Node internals authenticate an owned SDK process against an existing server. They do not deploy a server or fund an account. Public managed runs still accept mock backends only; authentication is kept private until resource cleanup and recovery are connected.

## Borrowed authority

A version 1 profile contains an API base URL and application metadata. Its authentication mode is one of:

- `app-key`: reconnect with an existing 32-byte app-key seed.
- `register`: use a recovery phrase after approving an SDK request with an existing connect key.
- `preauthorized`: use a recovery phrase with an existing 32-byte preauthorized-key seed.

The profile also supplies upload encoding and resource limits. Loading it requires explicit transfer and mutation consent for the same normalized API URL. HTTPS is required except for numeric loopback HTTP addresses.

Profiles must be absolute-path, owner-only regular files outside the checkout. The loader rejects final-component symlinks and multiply linked files. It reads at most 16 KiB and returns an opaque handle whose JSON and inspection output omit credentials. The parsed document is an immutable snapshot.

## SDK lifetime

The installed SDK must be version `0.1.4`. Authority reaches the agent over Node IPC rather than command-line arguments. The agent uses a small environment allowlist, with inherited module-loader and native-loader overrides removed. Its stdout and stderr are discarded; RPC failures contain fixed messages and classified codes.

The parent owns the process lifetime. The agent still uses the network and operating-system permissions of the caller. A request deadline or abort stops the process before the request rejects. Shutdown first sends SIGTERM, then SIGKILL if the child remains alive. Failure to confirm exit within the cleanup deadline is reported as uncertain termination.

Registration approval validates the response URL's origin and connection path before sending the connect key as the Basic-auth password. Redirects are rejected. The decision body is explicit, including denial. SDK sign-in and account-readiness polling run inside the execution deadline; an app-ID mismatch fails instead of returning an unrelated account.

The framework does not own or delete the operator's account. Logical-byte limits and SDK progress counters are not hard limits on encrypted network traffic or charges.

## Offline evidence

Tests use synthetic owner-only profiles and owned loopback HTTP listeners. They exercise profile rejection and approval URL restrictions, including redirects. Process tests check that cancellation and channel loss stop children that ignore SIGTERM.

Installed-SDK tests cover all authentication entrypoints and account-readiness polling. Their preauthorization fixture checks the supplied key identity and simulates approval; it does not model Indexd's cryptographic proof validation. A separate installed-SDK case blocks an authentication request and confirms that aborting the owner stops its native process.

No real-server authentication or transfer was run. These checks do not establish endpoint compatibility or upload readiness on an operator's server.
