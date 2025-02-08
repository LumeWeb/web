// Import the mocked useUIStore hook
import { useUIStore as mockedUseUIStore } from "@/store/uiStore";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Import the hook we are actually testing from the source file
// Import useThemeIdAndSetter and useTheme
import { useTheme, useThemeIdAndSetter } from "./useTheme";

// Mock dependencies
// Mock the actual store module (@/store/uiStore)
// The factory function runs during mock resolution, before test execution.
// It should define the *mocked exports* of the module.
vi.mock("@/store/uiStore", () => {
  // Define the mutable state and the mock function *inside* the factory
  let mockUIStoreState = { theme: "default" };
  const mockSetTheme = vi.fn((theme: string) => {
    mockUIStoreState.theme = theme; // Update internal state
  });

  // Inside the factory: Define the mock implementation of the hook.
  const useUIStoreSpy = vi.fn((selector) => {
    // This function is called by the hook under test (useThemeIdAndSetter)
    // It accesses the *current* state from the mockUIStoreState defined *within* the factory
    // and applies the selector function passed by the hook.
    // Also include the setter in the state object for the selector
    return selector({ ...mockUIStoreState, setTheme: mockSetTheme });
  });

  return {
    // Export the mocked hook with the name it's expected to have
    useUIStore: useUIStoreSpy,
    // Export helper functions for tests to manage the internal state and spies
    __resetMockUIStoreState: (newState: { theme: string }) => {
      mockUIStoreState = newState;
    },
    __getMockUIStoreState: () => mockUIStoreState,
    __clearMockSetThemeSpy: () => {
      mockSetTheme.mockClear();
    },
    __mockSetTheme: mockSetTheme, // Export the spy itself for assertions
  };
});

// Import the mocked functions and state helpers *after* the vi.mock call
import {
  useUIStore as mockedUseUIStore,
  __resetMockUIStoreState,
  __getMockUIStoreState,
  __clearMockSetThemeSpy,
  __mockSetTheme,
} from "@/store/uiStore";

// Mock usePluginMeta as it's used by the other hook (useTheme) in the same file
// This is necessary because Vitest evaluates the entire module when importing.
vi.mock("./usePluginMeta", () => {
  // Define the mock function inside the factory
  const mockUsePluginMeta = vi.fn();
  return {
    usePluginMeta: mockUsePluginMeta,
    // Export the mock function reference for assertions
    __mockUsePluginMeta: mockUsePluginMeta,
  };
});

// Import the mocked function reference after the vi.mock call
import { usePluginMeta as mockedUsePluginMeta, __mockUsePluginMeta as mockUsePluginMeta } from "./usePluginMeta";


// Mock the theme utility function
vi.mock("../utils/theme", () => {
  // Declare the mock function inside the factory
  const mockGetThemeById = vi.fn();
  return {
    getThemeById: mockGetThemeById,
    applyThemeStyles: vi.fn(), // Mock applyThemeStyles as it's used by withTheme (not tested here)
    // Export the mock function reference if needed for assertions outside the factory
    __mockGetThemeById: mockGetThemeById,
  };
});

// Import the mocked function reference after the vi.mock call
import { __mockGetThemeById as mockGetThemeById } from "../utils/theme";


describe("useThemeIdAndSetter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock state using the exported helper function
    __resetMockUIStoreState({ theme: "default" });
    // Reset the spy using the exported helper function
    __clearMockSetThemeSpy();
    vi.mocked(mockedUseUIStore).mockClear();
  });

  it("should return the current theme ID from the UI store", () => {
    // Arrange: Modify the mock state using the exported helper function
    __resetMockUIStoreState({ theme: "dark" });

    // Call the hook under test
    const { result } = renderHook(() => useThemeIdAndSetter());

    // result.current will now be { theme: string, setTheme: Function }
    expect(result.current.theme).toBe("dark");
    // Verify that the underlying useUIStore hook was called
    expect(mockedUseUIStore).toHaveBeenCalled();
  });

  it("should return the setTheme function from the UI store", () => {
    // Call the hook under test
    const { result } = renderHook(() => useThemeIdAndSetter());

    // result.current will now be { theme: string, setTheme: Function }
    // Expect the function returned by the hook to be the mock function we set inside the factory
    expect(result.current.setTheme).toBe(__mockSetTheme);
    // Verify that the underlying useUIStore hook was called
    expect(mockedUseUIStore).toHaveBeenCalled();
  });

  it("should allow updating the theme via the returned setTheme function", () => {
    // Call the hook under test
    const { result } = renderHook(() => useThemeIdAndSetter());

    // result.current will now be { theme: string, setTheme: Function }
    result.current.setTheme("custom");

    // Verify that the mock setTheme function was called with the correct argument
    expect(__mockSetTheme).toHaveBeenCalledWith("custom");
    // Verify the internal state was updated
    expect(__getMockUIStoreState().theme).toBe("custom");
  });
});

describe("useTheme", () => {
  const mockThemes = [
    { id: "default", name: "Default", default: true },
    { id: "dark", name: "Dark" },
    { id: "custom", name: "Custom" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state and dependencies
    __resetMockUIStoreState({ theme: "default" }); // Reset UI store theme
    __clearMockSetThemeSpy(); // Clear the spy
    mockUsePluginMeta.mockReset();
    mockGetThemeById.mockReset();

    // Default mock implementations
    mockUsePluginMeta.mockReturnValue(mockThemes);
    // Default getThemeById to return the theme matching the ID
    mockGetThemeById.mockImplementation((themes, id) => themes.find(t => t.id === id));
  });

  it("should return the selected theme based on store state and available themes", () => {
    __resetMockUIStoreState({ theme: "dark" }); // Set selected theme in store

    const { result } = renderHook(() => useTheme());

    expect(mockedUseUIStore).toHaveBeenCalled(); // useThemeIdAndSetter is called internally
    expect(mockUsePluginMeta).toHaveBeenCalledWith("dashboard", "themes");
    expect(mockGetThemeById).toHaveBeenCalledWith(mockThemes, "dark");
    expect(result.current).toEqual({ id: "dark", name: "Dark" });
  });

  it("should return the default theme if the selected theme is not found", () => {
    __resetMockUIStoreState({ theme: "non-existent" }); // Selected theme not in mockThemes
    mockGetThemeById.mockReturnValue(undefined); // Simulate getThemeById not finding it

    const { result } = renderHook(() => useTheme());

    expect(mockGetThemeById).toHaveBeenCalledWith(mockThemes, "non-existent");
    // It should fallback to finding the default theme
    expect(result.current).toEqual({ id: "default", name: "Default", default: true });
  });

  it("should return the first theme if selected and default themes are not found", () => {
    __resetMockUIStoreState({ theme: "non-existent" });
    mockGetThemeById.mockReturnValue(undefined);
    // Remove default flag from mockThemes for this test
    const themesWithoutDefault = mockThemes.map(t => ({ ...t, default: undefined }));
    mockUsePluginMeta.mockReturnValue(themesWithoutDefault);

    const { result } = renderHook(() => useTheme());

    expect(mockGetThemeById).toHaveBeenCalledWith(themesWithoutDefault, "non-existent");
    // It should fallback to the first theme in the list
    expect(result.current).toEqual(themesWithoutDefault[0]); // Should be the 'default' theme object without the default flag
  });

  it("should return undefined if no themes are available", () => {
    mockUsePluginMeta.mockReturnValue(undefined); // No themes available

    const { result } = renderHook(() => useTheme());

    expect(mockUsePluginMeta).toHaveBeenCalledWith("dashboard", "themes");
    expect(result.current).toBeUndefined();
    expect(mockGetThemeById).not.toHaveBeenCalled(); // Should not try to find themes if none available
  });

  it("should return undefined if themes array is empty", () => {
    mockUsePluginMeta.mockReturnValue([]); // Empty themes array

    const { result } = renderHook(() => useTheme());

    expect(mockUsePluginMeta).toHaveBeenCalledWith("dashboard", "themes");
    expect(result.current).toBeUndefined();
    expect(mockGetThemeById).not.toHaveBeenCalled(); // Should not try to find themes if array is empty
  });
});

// Note: Testing the `withTheme` HoC would require separate tests,
// potentially using `@testing-library/react`'s `render` and mocking
// DOM manipulation or testing the CSS output directly.
