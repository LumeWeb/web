# @lumeweb/portal-dashboard

## 0.2.3

### Patch Changes

- Updated dependencies [217ca20]
  - portal-shared@0.1.1

## 0.2.2

### Patch Changes

- 05e7eed: Dummy version bump for go release

## 0.2.1

### Patch Changes

- 0bcf64f: Billing UI Refactoring

## 0.2.0

### Minor Changes

- 7b4bc58: Ref c406fb3de007cc3bfd15bb77b047b2bc9ada4f4b to 03069e150589559b1c9c13432caa81d0eb0894ae

  ## Refactoring & Enhancements

  - Migrated shared components to new portal-shared library
  - Implemented react-hook-form for form handling
  - Added `useOnFreePlan` hook for subscription logic
  - Enhanced account management and auth flows

  ## New Features

  - Implemented unverified user notifications
  - Enhanced IPFS service capabilities

  ## UI Improvements

  - Updated layout and navigation structure
  - Integrated new shadcn/ui components
  - Improved usage charts and pin dialog

  ## Bug Fixes

  - Corrected payment skeleton display logic
  - Fixed FQDN parsing in API base URL
  - Ensured proper credential handling in login
  - Resolved https prefixing for portal URL

  ## Other Changes

  - Streamlined payment and cancellation processes
  - Implemented conditional rendering for subscriptions
  - Updated dependencies and configurations

## 0.1.0

### Minor Changes

- 6d62e37: implement usage tracking, display, remove mock data, and fix account forms
