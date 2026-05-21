---
@lumeweb/portal-sdk: minor
---

## Features

- add Websites and IPNS API support
- migrate to vite 8 with tunnel plugins and build tooling overhaul
- add gateway-agnostic billing plugin
- fix YAML syntax errors in account swagger.yaml
- remove baseUrl from all tsconfigs
- implement 2FA flows and login
- implement account deletion functionality
- implement portal framework with module federation, Refine integration, and abuse management
- add auto-login option after email verification
- implement bootup and page loading screens with animations
- add operations API, polling utilities, and comprehensive test suite
- add query builder integration and update tests
- update task pipelines
- lock file
- need to pass withCredentials to all account requests
- pass buildOptions to login to ensure withCredentials is set
- improve response handling and error parsing in AccountApi
- recalculate elapsed time after fetch to account for network latency
- correctly serialize array filters with indexed keys
- correct operation list response handling and csv formatter
