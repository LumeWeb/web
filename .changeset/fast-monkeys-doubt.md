---
@lumeweb/portal-plugin-dashboard: minor
---

## Features

- migrate to vite 8 with tunnel plugins and build tooling overhaul
- add gateway-agnostic billing plugin
- typo
- remove baseUrl from all tsconfigs
- remove unused cjsDir param and remove stale require exports from package.jsons
- replace bare src/ imports with @/ alias and upgrade tsdown external to deps.neverBundle
- add pnpm overrides for module-federation typescript peer, add @lumeweb/analytics to dashboard deps
- add missing @lumeweb/analytics and other shared federation deps to all vite-built packages
- implement portal framework with module federation, Refine integration, and abuse management
- refactor portal app shell and core libraries for improved module federation and configuration
- implement remember me functionality and various UI enhancements
- add auto-login option after email verification
- implement bootup and page loading screens with animations
- add visibility hook and simplify widget definition
- replace file with stream to enable large file uploads
- add folder upload detection and conditional UI based on service support
- formatting
- need to import routes for plugin registration
- add missing auth capabilities
- typo on OTPGenerateResponse
- safely handle CID object format in operations UI, as future proofing
