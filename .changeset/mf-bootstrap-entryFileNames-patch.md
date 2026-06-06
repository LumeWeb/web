---
"@lumeweb/portal-app-shell": patch
"@lumeweb/portal-plugin-abuse": patch
"@lumeweb/portal-plugin-abuse-report": patch
"@lumeweb/portal-plugin-admin": patch
"@lumeweb/portal-plugin-billing": patch
"@lumeweb/portal-plugin-core": patch
"@lumeweb/portal-plugin-dashboard": patch
"@lumeweb/portal-plugin-ipfs": patch
"@lumeweb/portal-plugin-lbry": patch
"@lumeweb/portal-plugin-quota": patch
---

Patch @module-federation/vite to respect entryFileNames directory for bootstrap file output. Fixes doubled path bug (static/js/static/js/) when bootstrap is emitted to a subdirectory.
