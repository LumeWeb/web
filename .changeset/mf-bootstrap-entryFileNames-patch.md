---
@lumeweb/portal-app-shell: patch
@lumeweb/portal-plugin-abuse: patch
@lumeweb/portal-plugin-abuse-report: patch
@lumeweb/portal-plugin-admin: patch
@lumeweb/portal-plugin-billing: patch
@lumeweb/portal-plugin-core: patch
@lumeweb/portal-plugin-dashboard: patch
@lumeweb/portal-plugin-ipfs: patch
@lumeweb/portal-plugin-lbry: patch
@lumeweb/portal-plugin-quota: patch
---

Rebuild @module-federation/vite patch. The previous version accidentally reverted upstream's initPromise deferral for import:false shared modules, causing loadShare errors (react/compiler-runtime, react/jsx-runtime) in Go-embedded builds where zero-latency serving triggered the race condition.
