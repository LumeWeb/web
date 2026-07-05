
## 0.6.6 (2026-07-05)

### Features

#### Features

- add split-mode Dockerfile and update vocs to 2.3.0

### Fixes

- handle missing command categories in CLI ref generator

## 0.6.5 (2026-06-30)

### Features

#### Features

- build Docker image in CI and remove railpack.toml

### Fixes

- copy patches directory before pnpm install
- install ca-certificates for go install HTTPS
- use multi-stage golang build for pinner-cli
- inline build steps to bypass pnpm runDepsStatusCheck
- add tsdown to devDependencies for npx resolution
- copy static frontend assets to runtime image

## 0.6.4 (2026-06-23)

### Fixes

#### Fixes

- correct Windows install command syntax in quickstart

## 0.6.3 (2026-06-22)

### Fixes

#### Fixes

- propagate PATH export to parent shell
- propagate script exit code through eval

## 0.6.2 (2026-05-21)

### Features

#### Features

- add docs.pinner.xyz documentation site
- migrate to vite 8 with tunnel plugins and build tooling overhaul
- typo
- domain typo
- remove baseUrl from all tsconfigs

## 0.6.1 (2026-05-21)

### Features

#### Features

- add docs.pinner.xyz documentation site
- migrate to vite 8 with tunnel plugins and build tooling overhaul
- typo
- domain typo
- remove baseUrl from all tsconfigs
