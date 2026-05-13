import { vi } from "vitest";

const mockPostHog = {
  capture: vi.fn(),
  identify: vi.fn(),
  register_for_session: vi.fn(),
};

Object.defineProperty(window, "posthog", {
  value: mockPostHog,
  writable: true,
  configurable: true,
});

export { mockPostHog };
