---
@lumeweb/portal-framework-ui: minor
---

## Features

- navigation system refactor with N-level nesting
- cascading flyout nav, sidebar auto-resize, tooltips, and theme switcher
- add section grouping, header suppression, and description tooltips to navigation

## Fixes

- merge refine options instead of overwriting
- export AppActions and AppState for dts generation
- add @types/react to devDependencies and rename step-control spec to .tsx
- sync framework.meta to appStore so usePluginMeta works
- wire usePortalUrl into GeneralLayout to populate meta store
- restore portalUrl env default, framework sync, and stable action refs
- address Kody review findings
