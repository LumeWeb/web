import { vi } from "vitest";

Object.defineProperty(window, "posthog", {
  writable: true,
  value: undefined,
});
