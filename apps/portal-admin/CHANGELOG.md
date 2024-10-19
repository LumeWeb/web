# @lumeweb/portal-admin

## 0.1.0

### Minor Changes

- 7b4bc58: Ref ddb37bf808de4270b005b673c036a606e9153778 to ed35d099021414590f31e267b4f8baa8c9425111

  ## Features

  - Added settings page with JSON editor and table view (WIP, editing not fully implemented)
  - Added cron jobs management page
  - Implemented new utility functions for time formatting

  ## Refactoring

  - Refactored shared components and hooks for improved reusability
  - Moved email verification and login-related components to shared library
  - Refactored GeneralLayout to support optional upload form
  - Updated GeneralLayout and navigation structure
  - Enhanced portal-admin app setup with new routes and configurations

  ## New Hooks

  - Added useLoginUrl, useRegisterUrl, and useResetPasswordUrl hooks
  - Moved account subdomain logic to shared hooks

  ## Major Changes

  BREAKING CHANGE: Relocated shared code from portal-dashboard to new portal-shared library

  - Moved components, hooks, utilities, and types to libs/portal-shared/src
  - Updated import paths across portal-dashboard to use new shared library
  - Refactored app store into baseStore and dashboardStore
  - Removed duplicate files and consolidated shared logic
  - Updated tsconfig paths to include new shared library

  ## Work in Progress

  - Settings editor functionality is not yet complete
  - Editing in the settings page is not fully implemented

  Note: This update focuses on portal admin changes, including new features, refactoring efforts, and the creation of a shared library for better code organization and reusability.
