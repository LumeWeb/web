---
@lumeweb/portal-framework-ui: minor
---

## Features

- migrate to vite 8 with tunnel plugins and build tooling overhaul
- lazy-load Editor component with Suspense boundary
- add gateway-agnostic billing plugin
- typo
- remove baseUrl from all tsconfigs
- replace bare src/ imports with @/ alias and upgrade tsdown external to deps.neverBundle
- replace external with deps.neverBundle in all tsdown configs, remove dead CJS builds, add type:module to portal-generators
- implement portal framework with module federation, Refine integration, and abuse management
- add form grouping functionality
- implement remember me functionality and various UI enhancements
- add autocomplete support to forms and fields
- implement bootup and page loading screens with animations
- fix import
- formatting
- add return type
- correct link handling in collapsible menu
- adjust sidebar widths
- correct invalid import in autocomplete rules
- add explicit JSX.Element return type to Loading component
- improve footer environment type guards and handle undefined form context
- widen toolbar renderer types to accept ExtendedToolbarItem
- prevent layout shift and memoize hidden columns Set
- move mobile column hiding logic to top level and update toolbar renderer
- expand coreSupported breakpoints to include all ComponentSize values
- add return type to `useMobileDetection` hook
- simplify RefineTable context and update property access
- add default values to required label parameters
