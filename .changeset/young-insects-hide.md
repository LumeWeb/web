---
@lumeweb/portal-generators: minor
---

## Features

- migrate to vite 8 with tunnel plugins and build tooling overhaul
- remove baseUrl from all tsconfigs
- remove unused cjsDir param and remove stale require exports from package.jsons
- replace external with deps.neverBundle in own config, remove dead CJS build from portal-generators
- replace external with deps.neverBundle in all tsdown configs, remove dead CJS builds, add type:module to portal-generators
- add portal-generators package with scaffolding templates
