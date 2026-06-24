import {
  createNamespacedId,
  type NavigationItem,
} from "@lumeweb/portal-framework-core";

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Import the hook *after* the mocks are defined
import { useMenuItems } from "./useMenuItems";

const CORE_NS = "core";
const core = (name: string) => createNamespacedId(CORE_NS, name);

// Mock the zustand store
const mockStoreState = {
  addMenuItem: vi.fn(),
  menuItems: [] as NavigationItem[],
  removeMenuItem: vi.fn(),
  // Add other state/actions as needed by the hook's selectors
};

// Create a mock store object with a setState method for testing
const mockAppStore = {
  destroy: vi.fn(), // Mock destroy
  getState: () => mockStoreState,
  setState: (newState: Partial<typeof mockStoreState>) => {
    Object.assign(mockStoreState, newState);
  },
  subscribe: vi.fn(), // Mock subscribe as it's required by useStore
};

vi.mock("@/store/appStore", () => {
  return {
    // Mock useAppStore to use our external mock store
    useAppStore: vi.fn((selector) => selector(mockAppStore.getState())),
    // Export the mock store itself if needed for direct manipulation (less common)
    // appStore: mockAppStore,
  };
});

describe("useMenuItems", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock store state before each test
    mockAppStore.setState({
      addMenuItem: vi.fn(), // Reset mock functions too
      menuItems: [],
      removeMenuItem: vi.fn(),
    });
  });

  it("should return the menuItems array from the store", () => {
    const initialMenuItems: NavigationItem[] = [
      { id: core("dashboard"), label: "Dashboard" },
    ];
    mockAppStore.setState({ menuItems: initialMenuItems });

    const { result } = renderHook(() => useMenuItems());

    expect(result.current.menuItems).toBe(initialMenuItems);
  });

  it("should return the addMenuItem function from the store mock", () => {
    const { result } = renderHook(() => useMenuItems());

    // Expect the function returned by the hook to be the mock function we set
    expect(result.current.addMenuItem).toBe(mockStoreState.addMenuItem);
  });

  it("should return the removeMenuItem function from the store mock", () => {
    // The mockRemoveMenuItem is defined outside and exported from the mock factory
    const { result } = renderHook(() => useMenuItems());
    // Expect the function returned by the hook to be the mock function we set
    expect(result.current.removeMenuItem).toBe(mockStoreState.removeMenuItem);
  });
});
