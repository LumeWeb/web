import { describe, expect, it, vi } from "vitest";

import { getPluginInfo } from "./getPluginInfo";

describe("getPluginInfo", () => {
  it("should extract plugin ID", () => {
    const mockModule = {
      default: () => ({
        destroy: vi.fn(),
        id: "core:plugin",
        initialize: vi.fn(),
      }),
    };

    expect(getPluginInfo(mockModule as any)).toEqual({
      id: "core:plugin",
    });
  });

  it("should throw on missing ID", () => {
    const invalidModule = {
      default: () => ({}),
    };

    expect(() => getPluginInfo(invalidModule as any)).toThrow(
      "Plugin module must provide id",
    );
  });
});
