---
"@lumeweb/portal-dashboard": minor
---

## Features

- Relocated shared code from portal-dashboard to new portal-shared library
- Moved components, hooks, utilities, and types to libs/portal-shared/src
- Updated import paths across portal-dashboard to use new shared library
- Refactored app store into baseStore and dashboardStore
- Removed duplicate files and consolidated shared logic
- Updated tsconfig paths to include new shared library
- initial iteration of subscriptions
- initial file manager support
- implement social login functionality
- implement 2FA flows and login
- implement API keys support
- implement account deletion functionality
- implement usage tracking and display
- add settings and cron pages, refactor shared components
- add missing reset password route
- only prefix https if portalUrl is set but not starting with a proto
- bad parsing of FQDN in getApiBaseUrl, need to better handle subdomains
- adjust condition for payment skeleton display
- new layout for billing
- using tabs for different parts of the billing
