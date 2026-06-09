## 0.1.5 (2026-06-09)

### Fixes

#### Fixes

- extract src-lib for cross-plugin consumption

## 0.1.2 (2026-06-06)

### Fixes

- Rebuild @module-federation/vite patch. The previous version accidentally reverted upstream's initPromise deferral for import:false shared modules, causing loadShare errors (react/compiler-runtime, react/jsx-runtime) in Go-embedded builds where zero-latency serving triggered the race condition.

## 0.1.1 (2026-06-06)

### Fixes

- Patch @module-federation/vite to respect entryFileNames directory for bootstrap file output. Fixes doubled path bug (static/js/static/js/) when bootstrap is emitted to a subdirectory.

## 0.1.0 (2026-06-05)

### Breaking Changes

- Initial release of the billing plugin with subscription management and Stripe integration

### Fixes

- Add missing Go module files (go.mod and handler.go) for portal-plugin-billing
