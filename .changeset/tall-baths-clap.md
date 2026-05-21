---
@lumeweb/pinner: minor
---

## Features

- add Websites and IPNS API support
- add SSL status monitoring for websites with watch functionality
- migrate to vite 8 with tunnel plugins and build tooling overhaul
- sync IpnsClient and WebsitesClient with server swagger
- update default endpoint and gateway URLs
- remove baseUrl from all tsconfigs
- replace bare src/ imports with @/ alias and upgrade tsdown external to deps.neverBundle
- implement core pinning and upload library
- enhance SSRF protection with comprehensive IP validation
- correct operation list response handling and csv formatter
- make setDriverFactory actually work
