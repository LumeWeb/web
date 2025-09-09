import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock external dependencies first
// Use factory functions to avoid issues with global mocks and default/named exports
vi.mock("@lumeweb/portal-framework-core", async (importActual) => {
  const actual =
    await importActual<typeof import("@lumeweb/portal-framework-core")>();
  return {
    ...actual,
    createNamespacedId: vi.fn((ns, name) => `${ns}:${name}`), // Keep actual logic for ID creation
    createRemoteComponentLoader: vi.fn(),
    ErrorDisplay: vi.fn(({ error, onRetry }) => (
      <div data-testid="mock-error-display">
        Error: {error instanceof Error ? error.message : "Unknown Error"}
        {onRetry && <button onClick={onRetry}>Retry</button>}
      </div>
    )),
    FrameworkProvider: vi.fn(({ children }) => (
      <div data-testid="mock-framework-provider">{children}</div>
    )),
    // Mock the internal LoadingSpinner component
    // Note: This component is defined *within* AppComponent.tsx, so mocking it here won't work directly.
    // We will mock the useFrameworkLoading/useAppStore hooks to control the rendering path instead.
    // LoadingSpinner: vi.fn(() => <div data-testid="mock-loading-spinner">Loading...</div>),
    RouteErrorBoundary: vi.fn(({ children }) => (
      <div data-testid="mock-route-error-boundary">{children}</div>
    )),
    RouteErrorBoundaryFallback: vi.fn(({ error }) => (
      <div data-testid="mock-route-error-boundary-fallback">
        Route Error:{" "}
        {error instanceof Error ? error.message : "Unknown Route Error"}
      </div>
    )),
    useFramework: vi.fn(),
    useFrameworkLoading: vi.fn(),
  };
});

vi.mock("@lumeweb/portal-framework-ui-core", async (importActual) => {
  const actual =
    await importActual<typeof import("@lumeweb/portal-framework-ui-core")>();
  return {
    ...actual,
    Toaster: vi.fn(() => <div data-testid="mock-toaster" />),
  };
});

vi.mock("@refinedev/core", async (importActual) => {
  const actual = await importActual<typeof import("@refinedev/core")>();
  return {
    ...actual,
    Refine: vi.fn(({ children }) => (
      <div data-testid="mock-refine">{children}</div>
    )),
  };
});

vi.mock("@refinedev/react-router", async (importActual) => {
  const actual = await importActual<typeof import("@refinedev/react-router")>();
  return {
    ...actual,
    default: vi.fn(() => ({ name: "mock-router-provider" })), // Mock the default export
  };
});

vi.mock("react-router", async (importActual) => {
  const actual = await importActual<typeof import("react-router")>();
  return {
    ...actual,
    createBrowserRouter: vi.fn((routes) => ({
      // Add a dummy navigate function if needed by Refine or other components
      navigate: vi.fn(),
      // Mock router object
      routes,
      // Add other necessary router properties if tests require them
    })),
    createRoutesFromElements: vi.fn((elements) => elements), // Simply return the elements for inspection
    Route: vi.fn(({ children, element, errorElement, index, path }) => (
      // Simple representation of a Route element for testing structure
      <div data-index={index} data-path={path} data-testid="mock-route">
        {element}
        {errorElement && (
          <div data-testid="mock-route-error-element">{errorElement}</div>
        )}
        {children}
      </div>
    )),
    RouterProvider: vi.fn(({ router }) => (
      <div data-testid="mock-router-provider-component">
        {/* Render a representation of the routes */}
        {router?.routes && Array.isArray(router.routes)
          ? router.routes.map((route: any, i: number) => (
              <div data-testid="rendered-route" key={i}>
                {route}
              </div>
            ))
          : null}
      </div>
    )),
  };
});

vi.mock("../dialog", async (importActual) => {
  const actual = await importActual<typeof import("../dialog")>();
  return {
    ...actual,
    DialogProvider: vi.fn(({ children }) => (
      <div data-testid="mock-dialog-provider">{children}</div>
    )),
    DialogRenderer: vi.fn(() => <div data-testid="mock-dialog-renderer" />),
  };
});

vi.mock("../actions", () => ({
  registerAllActionItems: vi.fn(),
}));

vi.mock("../form", () => ({
  registerAllFormComponents: vi.fn(),
}));

vi.mock("@/store/appStore", () => ({
  useAppStore: vi.fn(),
}));

// Import the component under test AFTER mocks
import { AppComponent } from "./AppComponent";

// Mock the internal LoadingSpinner component by replacing its definition
// This is a bit hacky but necessary because it's defined inside the module.
// A better approach might be to extract it or control rendering via hooks.
// For now, we'll rely on controlling the hooks (useFrameworkLoading, useAppStore)
// to ensure the correct rendering path (loading, error, success).
// We can add a simple mock implementation here if needed for clarity,
// but the primary test will check for the *absence* of other content
// and the *presence* of a loading indicator (which we can simulate
// by checking for specific text or a data-testid if the real component
// had one, or simply by checking the state of the hooks).

// Let's create a simple mock for the internal LoadingSpinner
const MockLoadingSpinner = () => (
  <div data-testid="mock-loading-spinner">Loading...</div>
);

// We need to find a way to replace the internal LoadingSpinner.
// Since it's not exported, direct mocking is hard.
// We'll rely on the hooks to control the flow and check for the *absence*
// of the main app content when loading is true.

describe("AppComponent", () => {
  const mockUseFrameworkLoading = vi.mocked(
    require("@lumeweb/portal-framework-core").useFrameworkLoading,
  );
  const mockUseFramework = vi.mocked(
    require("@lumeweb/portal-framework-core").useFramework,
  );
  const mockErrorDisplay = vi.mocked(
    require("@lumeweb/portal-framework-core").ErrorDisplay,
  );
  const mockRefine = vi.mocked(require("@refinedev/core").Refine);
  const mockRouterProvider = vi.mocked(require("react-router").RouterProvider);
  const mockDialogProvider = vi.mocked(require("../dialog").DialogProvider);
  const mockDialogRenderer = vi.mocked(require("../dialog").DialogRenderer);
  const mockToaster = vi.mocked(
    require("@lumeweb/portal-framework-ui-core").Toaster,
  );
  const mockUseAppStore = vi.mocked(require("@/store/appStore").useAppStore);
  const mockCreateRemoteComponentLoader = vi.mocked(
    require("@lumeweb/portal-framework-core").createRemoteComponentLoader,
  );
  const mockRegisterAllFormComponents = vi.mocked(
    require("../form").registerAllFormComponents,
  );
  const mockRegisterAllActionItems = vi.mocked(
    require("../actions").registerAllActionItems,
  );
  const mockCreateRoutesFromElements = vi.mocked(
    require("react-router").createRoutesFromElements,
  );
  const mockCreateBrowserRouter = vi.mocked(
    require("react-router").createBrowserRouter,
  );
  const mockRoute = vi.mocked(require("react-router").Route);
  const mockRouteErrorBoundaryFallback = vi.mocked(
    require("@lumeweb/portal-framework-core").RouteErrorBoundaryFallback,
  );

  // Mock app store state and actions
  const mockAppStoreState = {
    addMenuItems: vi.fn(),
    error: null,
    isLoading: false,
    pluginConfigs: [],
    routes: null, // Start with null to simulate initial state
    setError: vi.fn(),
    setIsLoading: vi.fn(),
    setPluginConfigs: vi.fn(),
    setRoutes: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseFrameworkLoading.mockReturnValue({
      error: null,
      isLoading: false,
    });
    mockUseFramework.mockReturnValue({
      getCapabilitiesByType: vi.fn(),
      getFeature: vi.fn(),
      // Add other necessary framework methods if called by AppComponent
    } as any); // Cast to any to avoid complex type mocking
    mockUseAppStore.mockReturnValue(mockAppStoreState);

    // Mock the internal LoadingSpinner by checking for its presence based on hook state
    // We can't directly mock the internal component, so we'll check the rendering flow.
    // When isLoading or isFrameworkLoading is true, the component should render *only* the loading state.
    // We'll achieve this by checking that the main app structure (Refine, RouterProvider, etc.) is NOT rendered.
  });

  afterEach(() => {
    // No specific cleanup needed for RTL afterEach by default, but good practice to have.
  });

  it("should render FrameworkProvider with default app name", () => {
    render(<AppComponent />);
    expect(screen.getByTestId("mock-framework-provider")).toBeInTheDocument();
    // Check if FrameworkProvider was called with the correct props
    expect(
      require("@lumeweb/portal-framework-core").FrameworkProvider,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        appName: "app",
      }),
      expect.anything(),
    );
  });

  it("should render FrameworkProvider with custom app name", () => {
    render(<AppComponent name="my-custom-app" />);
    expect(
      require("@lumeweb/portal-framework-core").FrameworkProvider,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        appName: "my-custom-app",
      }),
      expect.anything(),
    );
  });

  it("should show loading state when framework is loading", () => {
    mockUseFrameworkLoading.mockReturnValue({
      error: null,
      isLoading: true,
    });
    render(<AppComponent />);

    // Check that the main app content is NOT rendered
    expect(screen.queryByTestId("mock-refine")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("mock-router-provider-component"),
    ).not.toBeInTheDocument();
    // We can't directly assert the internal LoadingSpinner, but we assert the absence of the main content.
    // If the component renders *only* the loading state when hooks indicate loading, this test passes.
  });

  it("should show loading state when app data is loading", () => {
    mockUseFrameworkLoading.mockReturnValue({
      error: null,
      isLoading: false,
    });
    mockUseAppStore.mockReturnValue({
      ...mockAppStoreState,
      isLoading: true,
      routes: [], // Ensure routes is not null to pass the initial null check
    });
    render(<AppComponent />);

    // Check that the main app content is NOT rendered
    expect(screen.queryByTestId("mock-refine")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("mock-router-provider-component"),
    ).not.toBeInTheDocument();
  });

  it("should show framework error display when framework initialization fails", () => {
    const frameworkError = new Error("Framework init failed");
    mockUseFrameworkLoading.mockReturnValue({
      error: frameworkError,
      isLoading: false,
    });
    render(<AppComponent />);

    expect(mockErrorDisplay).toHaveBeenCalledWith(
      expect.objectContaining({
        error: frameworkError,
        onRetry: expect.any(Function), // Expect retry function
      }),
      expect.anything(),
    );
    expect(screen.getByTestId("mock-error-display")).toBeInTheDocument();
    expect(screen.getByText(/Framework init failed/)).toBeInTheDocument();
  });

  it("should show app data error display when data loading fails (if features enabled)", async () => {
    const appError = new Error("App data load failed");
    mockUseFrameworkLoading.mockReturnValue({
      error: null,
      isLoading: false,
    });
    // Simulate the effect hook setting the error
    mockUseAppStore.mockImplementation(() => ({
      ...mockAppStoreState,
      error: appError,
      isLoading: false,
      routes: [], // Ensure routes is not null to pass the initial null check
    }));

    render(<AppComponent loadNavigation={true} loadRoutes={true} />);

    // Wait for the effect to potentially run and update state (though mocked here)
    // In a real scenario, the effect would trigger the state update.
    // With the mock, we just check if the component renders based on the mocked state.
    expect(mockErrorDisplay).toHaveBeenCalledWith(
      expect.objectContaining({
        error: appError,
        onRetry: expect.any(Function), // Expect retry function
      }),
      expect.anything(),
    );
    expect(screen.getByTestId("mock-error-display")).toBeInTheDocument();
    expect(screen.getByText(/App data load failed/)).toBeInTheDocument();
  });

  it("should NOT show app data error display when data loading fails if features disabled", async () => {
    const appError = new Error("App data load failed");
    mockUseFrameworkLoading.mockReturnValue({
      error: null,
      isLoading: false,
    });
    // Simulate the effect hook setting the error
    mockUseAppStore.mockImplementation(() => ({
      ...mockAppStoreState,
      error: appError,
      isLoading: false,
      routes: [], // Ensure routes is not null to pass the initial null check
    }));

    render(<AppComponent loadNavigation={false} loadRoutes={false} />);

    // ErrorDisplay should not be called or rendered
    expect(mockErrorDisplay).not.toHaveBeenCalled();
    expect(screen.queryByTestId("mock-error-display")).not.toBeInTheDocument();
    // The main app content should still not render because routes is empty/null initially
    expect(screen.queryByTestId("mock-refine")).not.toBeInTheDocument();
  });

  it("should render main app structure after successful loading", async () => {
    mockUseFrameworkLoading.mockReturnValue({
      error: null,
      isLoading: false,
    });
    // Simulate successful data loading
    mockUseAppStore.mockImplementation(() => ({
      ...mockAppStoreState,
      error: null,
      isLoading: false,
      pluginConfigs: [{ dataProvider: {} }], // Provide mock configs
      routes: [{ component: "HomePage", id: "home", path: "/" }], // Provide mock routes
    }));
    // Mock the framework instance returned by useFramework
    const mockFrameworkInstance = {
      getCapabilitiesByType: vi.fn().mockResolvedValue([]),
      getFeature: vi.fn().mockResolvedValue({
        getNavigation: vi.fn().mockResolvedValue([]),
        getRoutes: vi.fn().mockResolvedValue([]),
      }),
    };
    mockUseFramework.mockReturnValue(mockFrameworkInstance as any);

    // Mock the component loader to return a simple component
    const MockLoadedComponent = () => <div data-testid="loaded-component" />;
    mockCreateRemoteComponentLoader.mockReturnValue(MockLoadedComponent);

    render(<AppComponent />);

    // Wait for the component to process the routes and render
    await waitFor(() => {
      expect(screen.getByTestId("mock-refine")).toBeInTheDocument();
      expect(
        screen.getByTestId("mock-router-provider-component"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("mock-dialog-provider")).toBeInTheDocument();
      expect(screen.getByTestId("mock-dialog-renderer")).toBeInTheDocument();
      expect(screen.getByTestId("mock-toaster")).toBeInTheDocument();
    });

    // Verify Refine was called with combined configs
    expect(mockRefine).toHaveBeenCalledWith(
      expect.objectContaining({
        dataProvider: expect.any(Object), // From pluginConfigs
        options: expect.any(Object),
        routerProvider: expect.any(Object),
      }),
      expect.anything(),
    );

    // Verify router setup was attempted
    expect(mockCreateRoutesFromElements).toHaveBeenCalled();
    expect(mockCreateBrowserRouter).toHaveBeenCalled();
    expect(mockRouterProvider).toHaveBeenCalled();

    // Verify the mock route component was used
    expect(mockRoute).toHaveBeenCalled();
    expect(screen.getByTestId("loaded-component")).toBeInTheDocument();
  });

  it("should call registerAllFormComponents and registerAllActionItems on module load", () => {
    // These mocks are called when the module is imported, so we just check if they were called.
    expect(mockRegisterAllFormComponents).toHaveBeenCalledTimes(1);
    expect(mockRegisterAllActionItems).toHaveBeenCalledTimes(1);
  });

  it("should call framework methods to load data when loadNavigation and loadRoutes are true", async () => {
    mockUseFrameworkLoading.mockReturnValue({
      error: null,
      isLoading: false,
    });
    // Mock the framework instance returned by useFramework
    const mockFrameworkInstance = {
      getCapabilitiesByType: vi.fn().mockResolvedValue([]),
      getFeature: vi.fn().mockResolvedValue({
        getNavigation: vi.fn().mockResolvedValue([]),
        getRoutes: vi.fn().mockResolvedValue([]),
      }),
    };
    mockUseFramework.mockReturnValue(mockFrameworkInstance as any);

    // Mock app store actions to track calls
    const mockSetIsLoading = vi.fn();
    const mockSetError = vi.fn();
    const mockSetRoutes = vi.fn();
    const mockAddMenuItems = vi.fn();
    const mockSetPluginConfigs = vi.fn();

    mockUseAppStore.mockImplementation(() => ({
      ...mockAppStoreState,
      addMenuItems: mockAddMenuItems,
      setError: mockSetError,
      setIsLoading: mockSetIsLoading,
      setPluginConfigs: mockSetPluginConfigs,
      setRoutes: mockSetRoutes,
    }));

    render(<AppComponent loadNavigation={true} loadRoutes={true} />);

    // Wait for the effect hook to potentially run (though mocks control the flow)
    // Check if framework methods were called
    await waitFor(() => {
      expect(mockFrameworkInstance.getFeature).toHaveBeenCalledWith(
        "core:navigation",
      );
      expect(mockFrameworkInstance.getCapabilitiesByType).toHaveBeenCalledWith(
        "core:refine-config",
      );
    });

    // Check if app store actions were called
    expect(mockSetIsLoading).toHaveBeenCalledWith(true); // Start loading
    // Expect subsequent calls for setting data and ending loading
    // The exact number of calls depends on the mock promises resolving
    await waitFor(() => {
      expect(mockSetRoutes).toHaveBeenCalled();
      expect(mockAddMenuItems).toHaveBeenCalled();
      expect(mockSetPluginConfigs).toHaveBeenCalled();
      expect(mockSetIsLoading).toHaveBeenCalledWith(false); // End loading
    });
    expect(mockSetError).not.toHaveBeenCalled(); // No error
  });

  it("should NOT call framework methods to load data when loadNavigation and loadRoutes are false", async () => {
    mockUseFrameworkLoading.mockReturnValue({
      error: null,
      isLoading: false,
    });
    // Mock the framework instance returned by useFramework
    const mockFrameworkInstance = {
      getCapabilitiesByType: vi.fn().mockResolvedValue([]),
      getFeature: vi.fn().mockResolvedValue(undefined), // Return undefined if feature not loaded
    };
    mockUseFramework.mockReturnValue(mockFrameworkInstance as any);

    // Mock app store actions
    const mockSetIsLoading = vi.fn();
    const mockSetError = vi.fn();
    const mockSetRoutes = vi.fn();
    const mockAddMenuItems = vi.fn();
    const mockSetPluginConfigs = vi.fn();

    mockUseAppStore.mockImplementation(() => ({
      ...mockAppStoreState,
      addMenuItems: mockAddMenuItems,
      setError: mockSetError,
      setIsLoading: mockSetIsLoading,
      setPluginConfigs: mockSetPluginConfigs,
      setRoutes: mockSetRoutes,
    }));

    render(<AppComponent loadNavigation={false} loadRoutes={false} />);

    // Wait for the effect hook to potentially run
    await waitFor(() => {
      // Framework methods should NOT be called
      expect(mockFrameworkInstance.getFeature).not.toHaveBeenCalled();
      expect(
        mockFrameworkInstance.getCapabilitiesByType,
      ).not.toHaveBeenCalled();
    });

    // App store actions should still be called to set initial state (e.g., routes to [])
    expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    await waitFor(() => {
      expect(mockSetRoutes).toHaveBeenCalledWith([]); // Should set empty routes
      expect(mockAddMenuItems).toHaveBeenCalledWith([]); // Should add empty navigation
      expect(mockSetPluginConfigs).toHaveBeenCalledWith([]); // Should set empty configs
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
    expect(mockSetError).not.toHaveBeenCalled();
  });

  it("should render RouteErrorBoundaryFallback when createRemoteComponentLoader fails for a route", async () => {
    mockUseFrameworkLoading.mockReturnValue({
      error: null,
      isLoading: false,
    });
    // Simulate successful data loading but component loading failure
    mockUseAppStore.mockImplementation(() => ({
      ...mockAppStoreState,
      error: null,
      isLoading: false,
      pluginConfigs: [],
      routes: [{ component: "BadComponent", id: "fail-route", path: "/fail" }], // Provide a route
    }));
    const mockFrameworkInstance = {
      getCapabilitiesByType: vi.fn().mockResolvedValue([]),
      getFeature: vi.fn().mockResolvedValue({
        getNavigation: vi.fn().mockResolvedValue([]),
        getRoutes: vi.fn().mockResolvedValue([]),
      }),
    };
    mockUseFramework.mockReturnValue(mockFrameworkInstance as any);

    // Mock the component loader to throw an error or return null/undefined
    mockCreateRemoteComponentLoader.mockImplementation(() => {
      // Simulate failure by returning null or throwing
      // Returning null will trigger the fallback logic in AppComponent
      return null;
    });

    render(<AppComponent />);

    // Wait for the component to process the routes and render
    await waitFor(() => {
      // Verify createRemoteComponentLoader was called
      expect(mockCreateRemoteComponentLoader).toHaveBeenCalledWith(
        expect.objectContaining({
          componentPath: "BadComponent",
          pluginId: "core:fallback", // Check default pluginId if not provided
        }),
        mockFrameworkInstance,
        expect.any(Object), // defaultRemoteOptions
      );

      // Verify RouteErrorBoundaryFallback was used for the route element
      expect(mockRoute).toHaveBeenCalledWith(
        expect.objectContaining({
          element: expect.objectContaining({
            props: expect.objectContaining({
              error: expect.any(Error), // Expect an Error object
            }),
            // Check if the element is the fallback component
            type: mockRouteErrorBoundaryFallback,
          }),
          path: "/fail",
        }),
        expect.anything(),
      );
      // Check the error message passed to the fallback
      const fallbackProps = mockRouteErrorBoundaryFallback.mock.calls.find(
        (call) =>
          (call[0].error as Error).message.includes(
            "Failed to load element for route fail-route",
          ),
      )?.[0];
      expect(fallbackProps).toBeDefined();
      expect((fallbackProps?.error as Error).message).toContain(
        "Failed to load element for route fail-route",
      );
    });
  });

  it("should render RouteErrorBoundaryFallback when getLazyComponent returns null/undefined", async () => {
    mockUseFrameworkLoading.mockReturnValue({
      error: null,
      isLoading: false,
    });
    // Simulate successful data loading but component loading failure
    mockUseAppStore.mockImplementation(() => ({
      ...mockAppStoreState,
      error: null,
      isLoading: false,
      pluginConfigs: [],
      routes: [{ component: "BadComponent", id: "fail-route", path: "/fail" }], // Provide a route
    }));
    const mockFrameworkInstance = {
      getCapabilitiesByType: vi.fn().mockResolvedValue([]),
      getFeature: vi.fn().mockResolvedValue({
        getNavigation: vi.fn().mockResolvedValue([]),
        getRoutes: vi.fn().mockResolvedValue([]),
      }),
    };
    mockUseFramework.mockReturnValue(mockFrameworkInstance as any);

    // Mock the component loader to return null
    mockCreateRemoteComponentLoader.mockReturnValue(null);

    render(<AppComponent />);

    await waitFor(() => {
      // Verify RouteErrorBoundaryFallback was used for the route element
      expect(mockRoute).toHaveBeenCalledWith(
        expect.objectContaining({
          element: expect.objectContaining({
            props: expect.objectContaining({
              error: expect.any(Error), // Expect an Error object
            }),
            type: mockRouteErrorBoundaryFallback,
          }),
          path: "/fail",
        }),
        expect.anything(),
      );
      // Check the error message passed to the fallback
      const fallbackProps = mockRouteErrorBoundaryFallback.mock.calls.find(
        (call) =>
          (call[0].error as Error).message.includes(
            "Failed to load element for route fail-route",
          ),
      )?.[0];
      expect(fallbackProps).toBeDefined();
      expect((fallbackProps?.error as Error).message).toContain(
        "Failed to load element for route fail-route",
      );
    });
  });

  it("should render RouteErrorBoundaryFallback for child routes when component loading fails", async () => {
    mockUseFrameworkLoading.mockReturnValue({
      error: null,
      isLoading: false,
    });
    // Simulate successful data loading but component loading failure for a child route
    mockUseAppStore.mockImplementation(() => ({
      ...mockAppStoreState,
      error: null,
      isLoading: false,
      pluginConfigs: [],
      routes: [
        {
          children: [
            {
              component: "BadChildComponent",
              id: "fail-child-route",
              path: "child",
            },
          ],
          component: "ParentComponent",
          id: "parent-route",
          path: "/parent",
        },
      ],
    }));
    const mockFrameworkInstance = {
      getCapabilitiesByType: vi.fn().mockResolvedValue([]),
      getFeature: vi.fn().mockResolvedValue({
        getNavigation: vi.fn().mockResolvedValue([]),
        getRoutes: vi.fn().mockResolvedValue([]),
      }),
    };
    mockUseFramework.mockReturnValue(mockFrameworkInstance as any);

    // Mock the component loader: succeed for parent, fail for child
    mockCreateRemoteComponentLoader.mockImplementation(({ componentPath }) => {
      if (componentPath === "ParentComponent") {
        return () => <div data-testid="parent-component" />;
      }
      // Simulate failure for child
      return null;
    });

    render(<AppComponent />);

    await waitFor(() => {
      // Verify createRemoteComponentLoader was called for both parent and child
      expect(mockCreateRemoteComponentLoader).toHaveBeenCalledWith(
        expect.objectContaining({ componentPath: "ParentComponent" }),
        expect.any(Object),
        expect.any(Object),
      );
      expect(mockCreateRemoteComponentLoader).toHaveBeenCalledWith(
        expect.objectContaining({ componentPath: "BadChildComponent" }),
        expect.any(Object),
        expect.any(Object),
      );

      // Verify the parent route is rendered with its component
      expect(screen.getByTestId("parent-component")).toBeInTheDocument();

      // Verify the child route element is the fallback component
      expect(mockRoute).toHaveBeenCalledWith(
        expect.objectContaining({
          element: expect.objectContaining({
            props: expect.objectContaining({
              error: expect.any(Error), // Expect an Error object
            }),
            type: mockRouteErrorBoundaryFallback,
          }),
          path: "child",
        }),
        expect.anything(),
      );

      // Check the error message passed to the child fallback
      const fallbackProps = mockRouteErrorBoundaryFallback.mock.calls.find(
        (call) =>
          (call[0].error as Error).message.includes(
            "Failed to load element for child route fail-child-route",
          ),
      )?.[0];
      expect(fallbackProps).toBeDefined();
      expect((fallbackProps?.error as Error).message).toContain(
        "Failed to load element for child route fail-child-route",
      );
    });
  });

  it("should render null if routes is null after loading", () => {
    mockUseFrameworkLoading.mockReturnValue({
      error: null,
      isLoading: false,
    });
    // Simulate data loading completing but routes remaining null (shouldn't happen in practice, but test the condition)
    mockUseAppStore.mockImplementation(() => ({
      ...mockAppStoreState,
      error: null,
      isLoading: false,
      pluginConfigs: [],
      routes: null, // Routes are still null
    }));

    const { container } = render(<AppComponent />);

    // The component should render null if routes is null
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId("mock-refine")).not.toBeInTheDocument();
  });

  it("should render Refine and RouterProvider even with empty routes array", async () => {
    mockUseFrameworkLoading.mockReturnValue({
      error: null,
      isLoading: false,
    });
    // Simulate successful data loading with an empty routes array
    mockUseAppStore.mockImplementation(() => ({
      ...mockAppStoreState,
      error: null,
      isLoading: false,
      pluginConfigs: [],
      routes: [], // Empty routes array
    }));
    const mockFrameworkInstance = {
      getCapabilitiesByType: vi.fn().mockResolvedValue([]),
      getFeature: vi.fn().mockResolvedValue({
        getNavigation: vi.fn().mockResolvedValue([]),
        getRoutes: vi.fn().mockResolvedValue([]),
      }),
    };
    mockUseFramework.mockReturnValue(mockFrameworkInstance as any);

    render(<AppComponent />);

    await waitFor(() => {
      // Refine and RouterProvider should still be rendered
      expect(screen.getByTestId("mock-refine")).toBeInTheDocument();
      expect(
        screen.getByTestId("mock-router-provider-component"),
      ).toBeInTheDocument();
      // No routes should be rendered inside RouterProvider
      expect(screen.queryByTestId("rendered-route")).not.toBeInTheDocument();
    });
  });
});
