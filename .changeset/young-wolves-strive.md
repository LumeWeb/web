---
@lumeweb/docs.pinner.xyz: minor
---

## Features

- build Docker image in CI and remove railpack.toml

## Fixes

- copy patches directory before pnpm install
- install ca-certificates for go install HTTPS
- use multi-stage golang build for pinner-cli
- inline build steps to bypass pnpm runDepsStatusCheck
- add tsdown to devDependencies for npx resolution
- copy static frontend assets to runtime image
