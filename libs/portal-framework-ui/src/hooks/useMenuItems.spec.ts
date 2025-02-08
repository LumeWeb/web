import type { NavigationItem } from "@lumeweb/portal-framework-core";

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Import the hook *after* the mocks are defined
import { useMenuItems } from "./useMenuItems";

// Mock the zustand store
const mockStoreState = {
  menuItems: [] as NavigationItem[],
  addMenuItem: vi.fn(),
  removeMenuItem: vi.fn(),
  // Add other state/actions as needed by the hook's selectors
};

// Create a mock store object with a setState method for testing
const mockAppStore = {
  getState: () => mockStoreState,
  setState: (newState: Partial<typeof mockStoreState>) => {
    Object.assign(mockStoreState, newState);
  },
  subscribe: vi.fn(), // Mock subscribe as it's required by useStore
  destroy: vi.fn(), // Mock destroy
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
    const initialMenuItems = [{ id: "dashboard", label: "Dashboard" }];
    const updatedMenuItems = [{ id: "settings", label: "Settings" }];
    // Update the mock state before rendering the hook
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

  it("should return a getMenuItems function that returns the current menuItems from the latest render", () => {
    const initialMenuItems = [{ id: "dashboard", label: "Dashboard" }]; // Initial state for the first render
    const stateAfterUpdate = [{ id: "settings", label: "Settings" }]; // State we will set later

    const { result } = renderHook(() => useMenuItems());
    // The hook captures the state at the time of its render.
    // Initially, the mock state is empty [] as set in beforeEach.
    expect(result.current.getMenuItems()).toEqual([]); // Assuming initial mock state is []

    // Set initial state
    mockAppStore.setState({ menuItems: initialMenuItems });

    // Calling getMenuItems *again* from the same hook instance should still return the value from the *first* render
    expect(result.current.getMenuItems()).toEqual([]); // Still [] because the hook hasn't re-rendered

    // Now getMenuItems should reflect the updated state
    // To get the updated state, we need to re-render the hook or use a selector that triggers updates.
    // The current implementation of getMenuItems returns the state captured at the time of the hook's render.
    // Let's re-render to capture the new state.
    const { result: resultAfterStateChange } = renderHook(() => useMenuItems());

    // After re-rendering, the hook captures the new state, and getMenuItems should return it
    expect(resultAfterStateChange.current.getMenuItems()).toEqual(
      initialMenuItems,
    );

    // Let's test another state change and re-render
    mockAppStore.setState({ menuItems: stateAfterUpdate });
    const { result: resultAfterSecondChange } = renderHook(() =>
      useMenuItems(),
    );
    expect(resultAfterSecondChange.current.getMenuItems()).toEqual(
      stateAfterUpdate,
    );
  });

  // Note: Testing reactive updates of `menuItems` itself (the array reference)
  // would require a more sophisticated mock that simulates Zustand's subscription
  // and triggers updates, or using `@testing-library/react-hooks`'s `rerender`
  // with a mock that changes its return value. The current test for `getMenuItems`
  // tests that the function returns the value from the *last render*, which is correct
  // behavior for the hook's implementation.
});
