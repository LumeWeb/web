---
@lumeweb/pinner: patch
---

## Fixes

- implement API key exchange for JWT auth
- clear exchangePromise on failure, await portalSdk init
- make portalSdk init lazily retryable
- await #ensurePortalSdkReady in waitForOperation
- derive account endpoint from pinner endpoint
- preserve port/path in account endpoint derivation
