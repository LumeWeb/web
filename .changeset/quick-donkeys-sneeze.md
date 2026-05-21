---
@lumeweb/portal-plugin-abuse-report: minor
---

## Features

- migrate to vite 8 with tunnel plugins and build tooling overhaul
- remove baseUrl from all tsconfigs
- bump @uppy/screen-capture and @uppy/webcam to resolve peer dep warnings
- replace bare src/ imports with @/ alias and upgrade tsdown external to deps.neverBundle
- implement portal framework with module federation, Refine integration, and abuse management
- formatting
- update case status checks to use lowercase values
- access view doesn't need to be nested in ReportLayout since we are using nested routes
