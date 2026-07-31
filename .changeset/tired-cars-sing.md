---
@lumeweb/lbry-sdk: minor
---

## Features

- browser-based LBRY wallet SDK with Go-WASM

## Fixes

- Kody code review — 6 bugs (high/medium)
- WebSocket bigint parsing + claimType range validation (1-3)
- claimType validation enforces integer-only with Number.isInteger
- remove tsx config-loader, add .ts extension to import
- wire full build pipeline in turbo
- remove dead wasm-exec export and fix tsdown config loading
- copy wasm assets to dist via tsdown copy option
- copy wasm assets to dist/esm/wasm/wasm/ to match loader path
- flatten wasm asset path — no nested wasm/wasm/
