---
@lumeweb/tsdown-config: minor
---

## Features

- migrate to vite 8 with tunnel plugins and build tooling overhaul
- properly exclude all test files from build config
- remove CJS output and fix tsconfig paths
- remove unused cjsDir param and remove stale require exports from package.jsons
- replace bare src/ imports with @/ alias and upgrade tsdown external to deps.neverBundle
- replace external with deps.neverBundle in own config, remove dead CJS build from portal-generators
- exclude non-code files from build entry patterns
