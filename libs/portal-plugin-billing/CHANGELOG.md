## 0.1.1 (2026-06-06)

### Fixes

- Patch @module-federation/vite to respect entryFileNames directory for bootstrap file output. Fixes doubled path bug (static/js/static/js/) when bootstrap is emitted to a subdirectory.

## 0.1.0 (2026-06-05)

### Breaking Changes

- Initial release of the billing plugin with subscription management and Stripe integration

### Fixes

- Add missing Go module files (go.mod and handler.go) for portal-plugin-billing
