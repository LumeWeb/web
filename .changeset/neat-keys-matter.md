---
@lumeweb/portal-framework-auth: minor
---

## Features

- useRedirectIfAuthenticated hook, fix ?to= param forwarding, add onboarding refineConfig capability
- add VITE_PORTAL_BRAND env var for brand configurability

## Fixes

- sanitize redirect URL in useRedirectIfAuthenticated to prevent open redirect
