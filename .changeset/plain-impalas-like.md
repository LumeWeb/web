---
@lumeweb/portal-framework-core: minor
---

## Features

- modularize Vite plugin with schema validation and full test coverage
- replace custom plugin with local flag and preserve local plugins in upstream merge
- add unstorage-based query param persistence with plugin-owned config
- add VITE_PORTAL_BRAND env var for brand configurability

## Fixes

- address PR review bugs with regression tests
- coerce VITE_PORTAL_DOMAIN_IS_ROOT to boolean for zod schema
- prevent query param persistence failure from aborting initialization
