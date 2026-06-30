## 0.1.4 (2026-06-30)

### Features

#### Features

- add Sia storage management plugin

## 0.1.3 (2026-06-06)

### Fixes

- Rebuild @module-federation/vite patch. The previous version accidentally reverted upstream's initPromise deferral for import:false shared modules, causing loadShare errors (react/compiler-runtime, react/jsx-runtime) in Go-embedded builds where zero-latency serving triggered the race condition.

## 0.1.2 (2026-06-06)

### Fixes

- Patch @module-federation/vite to respect entryFileNames directory for bootstrap file output. Fixes doubled path bug (static/js/static/js/) when bootstrap is emitted to a subdirectory.

## 0.1.1 (2026-06-06)

### Fixes

#### Fixes

- add @lumeweb/analytics devDependency

## 0.1.0 (2026-05-26)

### Breaking Changes

#### Features

- add dashboard widget, useQuota hook, and Refine capability

## 0.2.0 (2026-05-26)

### Breaking Changes

#### Features

- add dashboard widget, useQuota hook, and Refine capability

## 0.1.0 (2026-05-26)

### Breaking Changes

#### Features

- add dashboard widget, useQuota hook, and Refine capability
