---
@lumeweb/portal-framework-core: minor
---

## Features

- add ignore flag for excluding plugins from /api/meta
- add navigation type tests
- add values field to BrandConfig schema
- make favicon configurable via brand.faviconUrl
- add loadingMessages to brand schema
- add section and description fields to NavigationItem type
- export NavigationBadge and FeatureDependency types

## Fixes

- kill stale dev processes and remove hardcoded billing devPort
- patch @module-federation/vite for deferred shared exports
- resolve TypeScript errors and StrictMode double-init in framework.tsx
- defer to framework ErrorDisplay on boot failure
- add @types/react to devDependencies and rename step-control spec to .tsx
- respect minifyMangle config option and move calendar icon declarations to module scope
- remove dead stripNonCriticalPreloadsPlugin
