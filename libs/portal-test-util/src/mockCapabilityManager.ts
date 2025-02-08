import type { BaseCapability, Framework } from "@lumeweb/portal-framework-core";

import { CapabilityManager } from "@lumeweb/portal-framework-core";
import { vi } from "vitest";

export const createMockCapabilityManager = () => {
  const mockInstance = {
    // Private fields (simulated)
    "#capabilities": new Map<string, BaseCapability>(),
    "#capabilityToPlugin": new Map<string, string>(),
    "#deferredPromises": new Map<
      string,
      {
        promise: Promise<void>;
        reject: (reason?: any) => void;
        resolve: () => void;
      }
    >(),
    "#initialized": new Set<string>(),
    // Private methods (simulated)
    "#resolveDependencyOrder": vi
      .fn()
      .mockImplementation((dependencyGraph: Map<string, string[]>) => {
        return Array.from(dependencyGraph.keys()).map((id) => ({
          destroy: vi.fn(),
          id,
          initialize: vi.fn(),
        }));
      }),

    "#typeIndex": new Map<string, string[]>(),

    "#typeRegistrationOrder": [] as string[],
    "destroyAll": vi.fn().mockResolvedValue(new Map()),
    // Framework reference
    "framework": undefined as unknown as Framework,
    "get": vi.fn(),
    "getAllOfType": vi.fn().mockResolvedValue([]),
    // Public methods
    "initializeAll": vi.fn().mockResolvedValue(new Map()),

    "register": vi.fn(),
  };

  // Setup mock get() to return capabilities from the mock store
  mockInstance.get.mockImplementation(async (id: string) => {
    const cap = mockInstance["#capabilities"].get(id);
    if (!cap) return undefined;
    if (mockInstance["#initialized"].has(id)) return cap;

    const deferred = mockInstance["#deferredPromises"].get(id);
    if (!deferred) return undefined;

    // eslint-disable-next-line no-useless-catch
    try {
      await deferred.promise;
      return mockInstance["#capabilities"].get(id);
    } catch (error) {
      throw error;
    }
  });

  // Setup mock register() to update internal state
  mockInstance.register.mockImplementation(
    (capability: BaseCapability, pluginId: string) => {
      mockInstance["#capabilities"].set(capability.id, capability);
      mockInstance["#capabilityToPlugin"].set(capability.id, pluginId);

      if (!mockInstance["#typeIndex"].has(capability.type)) {
        mockInstance["#typeIndex"].set(capability.type, []);
        mockInstance["#typeRegistrationOrder"].push(capability.type);
      }
      mockInstance["#typeIndex"].get(capability.type)!.push(capability.id);
    },
  );

  return mockInstance as unknown as CapabilityManager & {
    // Expose private fields for testing
    "#capabilities": Map<string, BaseCapability>;
    "#capabilityToPlugin": Map<string, string>;
    "#deferredPromises": Map<
      string,
      {
        promise: Promise<void>;
        reject: (reason?: any) => void;
        resolve: () => void;
      }
    >;
    "#initialized": Set<string>;
    "#resolveDependencyOrder": jest.Mock;
    "#typeIndex": Map<string, string[]>;
    "#typeRegistrationOrder": string[];
  };
};

export type MockCapabilityManager = ReturnType<
  typeof createMockCapabilityManager
>;
