import type {
  BaseCapability,
  FrameworkFeature,
  Plugin,
} from "@lumeweb/portal-framework-core";

import { vi } from "vitest";

export const createMockPlugin = (
  id: string,
  overrides: Partial<Plugin> = {},
): Plugin => ({
  destroy: vi.fn().mockResolvedValue(undefined),
  id: `test:${id}`,
  initialize: vi.fn().mockResolvedValue(undefined), // Ensure mocks return promises
  ...overrides,
});

export const createMockFeature = (
  id: string,
  overrides: Partial<FrameworkFeature> = {},
): FrameworkFeature => ({
  destroy: vi.fn(),
  id: `test:${id}`,
  initialize: vi.fn(),
  ...overrides,
});

export const createMockSdkCapability = (
  overrides?: Partial<BaseCapability>,
): BaseCapability => ({
  destroy: vi.fn().mockResolvedValue(undefined),
  getSdk: vi.fn(),
  id: "core:sdk",
  initialize: vi.fn().mockResolvedValue(undefined),
  status: "inactive",
  type: "core:sdk",
  ...overrides,
});

export const MOCK_PLUGINS = {
  basic: createMockPlugin("basic"),
  withCapabilities: createMockPlugin("with-capabilities", {
    capabilities: [createMockSdkCapability()],
  }),
  withDependencies: (deps: string[]) =>
    createMockPlugin("with-deps", {
      dependencies: deps.map((id) => ({ id: `test:${id}` })),
    }),
  withFeatures: createMockPlugin("with-features", {
    features: [createMockFeature("feature1"), createMockFeature("feature2")],
  }),
  withRoutes: createMockPlugin("with-routes", {
    routes: [
      {
        component: "TestComponent",
        path: "/test",
      },
    ],
  }),
};
