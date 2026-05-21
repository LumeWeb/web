---
@lumeweb/portal-framework-ui-core: minor
---

## Features

- migrate to vite 8 with tunnel plugins and build tooling overhaul
- add cookie consent banner
- remove baseUrl from all tsconfigs
- suppress Sheet close button flicker on cookie banner
- replace external with deps.neverBundle in all tsdown configs, remove dead CJS builds, add type:module to portal-generators
- use format object for per-format ESM/CJS config output
- add analytics
- implement portal framework with module federation, Refine integration, and abuse management
- refactor portal app shell and core libraries for improved module federation and configuration
- implement bootup and page loading screens with animations
- only allow space and enter to toggle the password visibility
- add explicit type annotations to UI component primitives
- correct VisuallyHidden component implementation
