import { render, screen, waitFor } from "@testing-library/react";
import React, {
  ComponentType,
  createContext,
  forwardRef,
  useContext,
} from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
// Import necessary parts from context-bridge
import {
  registerBridgedContext,
  RemoteContextBridge,
  store,
} from "./context-bridge";
// Import the functions to test
import {
  createBridgeComponent,
  createRemoteComponentLoader,
  DefaultErrorComponent,
  DefaultLoadingComponent,
  defaultRemoteOptions,
} from "./remoteComponentLoader";

// Mock the Framework instance and its methods used by the loader
const mockFrameworkCreateRemoteComponent = vi.fn();
const mockFrameworkLoadRemote = vi.fn();
const mockFrameworkResolvePluginModule = vi.fn();

const mockFramework = {
  _createRemoteComponent: mockFrameworkCreateRemoteComponent,
  _loadRemote: mockFrameworkLoadRemote,
  resolvePluginModule: mockFrameworkResolvePluginModule,
} as any; // Use 'any' for simplicity in the mock

vi.mock("@module-federation/bridge-react", () => ({
  createBridgeComponent: vi
    .fn()
    .mockImplementation(
      <T,>({ rootComponent }: { rootComponent: ComponentType<T> }) => {
        // Return a function that simulates the bridge factory
        return () => ({
          __BRIDGE_FN__: vi.fn(),
          destroy: vi.fn().mockResolvedValue(undefined),
          rawComponent: rootComponent, // The raw component should be the wrapped one
          render: vi.fn().mockResolvedValue(undefined),
        });
      },
    ),
}));

vi.mock("@module-federation/enhanced/runtime", () => ({
  loadRemote: vi.fn(), // Define mock directly in factory
}));

// Helper to clear the context store before each test
const clearStore = () => {
  const ids = store.getRegisteredContextIds();
  ids.forEach((id) => {
    // Note: We don't have a public way to unregister,
    // but we can reset values or rely on test isolation.
    // For simplicity here, we'll just ensure values are reset.
    const ctx = store.getContext(id);
    if (ctx) {
      // Attempt to reset to default value if possible
      try {
        store.setValue(id, (ctx as any)._currentValue);
      } catch (e) {
        // Ignore if _currentValue is not accessible or setting fails
      }
    }
  });
  // A more robust approach might involve clearing the internal maps of the store
  // if they were exposed for testing, but we'll work with the public API.
};

describe("remoteComponentLoader", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    clearStore();

    // Reset mock implementations for framework methods
    mockFrameworkCreateRemoteComponent.mockReset();
    mockFrameworkLoadRemote.mockReset();
    mockFrameworkResolvePluginModule.mockReset();

    // Get the mocked createBridgeComponent from the module
    const { createBridgeComponent: mockedBaseCreateBridgeComponent } =
      vi.mocked(await import("@module-federation/bridge-react"));

    // Get the mocked loadRemote from the module
    const { loadRemote: mockedLoadRemote } = vi.mocked(
      await import("@module-federation/enhanced/runtime"),
    );
  });

  // --- createBridgeComponent Tests ---
  describe("createBridgeComponent", () => {
    it("should return a function that returns a BridgeResult object", () => {
      const MockComponent = () => <div>Mock</div>;
      const bridgeFactory = createBridgeComponent(MockComponent);

      expect(typeof bridgeFactory).toBe("function");

      const bridgeResult = bridgeFactory();
      expect(bridgeResult).toHaveProperty("__BRIDGE_FN__");
      expect(typeof bridgeResult.__BRIDGE_FN__).toBe("function");
      expect(bridgeResult).toHaveProperty("destroy");
      expect(typeof bridgeResult.destroy).toBe("function");
      expect(bridgeResult).toHaveProperty("rawComponent");
      expect(bridgeResult).toHaveProperty("render");
      expect(typeof bridgeResult.render).toBe("function");
    });

    it("should call baseCreateBridgeComponent with the wrapped component", async () => {
      const MockComponent = () => <div>Mock</div>;
      // Get the mocked createBridgeComponent from the module
      const { createBridgeComponent: mockedBaseCreateBridgeComponent } =
        vi.mocked(await import("@module-federation/bridge-react"));

      createBridgeComponent(MockComponent);

      expect(mockedBaseCreateBridgeComponent).toHaveBeenCalledTimes(1);
      const args = mockedBaseCreateBridgeComponent.mock.calls[0][0];
      expect(args).toHaveProperty("rootComponent");
      // The wrapped component uses forwardRef, which results in an object, not a function
      expect(typeof args.rootComponent).toBe("object");
    });

    it("should wrap the component with RemoteContextBridge for registered contexts", async () => {
      const TestContext = createContext<string>("default");
      const contextId = registerBridgedContext(TestContext, "TestContext");
      store.setValue(contextId, "bridged value");

      const MockComponent = () => {
        const value = useContext(TestContext);
        return <div data-testid="mock-component">Context Value: {value}</div>;
      };

      // Create the bridged component factory
      const bridgeFactory = createBridgeComponent(MockComponent);
      // Get the raw component from the mock bridge result
      const WrappedComponent = bridgeFactory().rawComponent;

      // Render the wrapped component within a RemoteContextBridge provider
      // This simulates the remote side receiving the bridged component
      render(
        <RemoteContextBridge contextId={contextId}>
          <WrappedComponent />
        </RemoteContextBridge>,
      );

      // The wrapped component should receive the value from the RemoteContextBridge
      await waitFor(() => {
        expect(screen.getByTestId("mock-component")).toHaveTextContent(
          "Context Value: bridged value",
        );
      });
    });

    it("should forward refs to the wrapped component", () => {
      const MockComponent = forwardRef<HTMLDivElement, { label: string }>(
        ({ label }, ref) => <div ref={ref}>{label}</div>,
      );
      MockComponent.displayName = "MockComponentWithRef";

      const bridgeFactory = createBridgeComponent(MockComponent);
      const WrappedComponent = bridgeFactory().rawComponent;

      const ref = React.createRef<HTMLDivElement>();

      render(<WrappedComponent label="Ref Test" ref={ref} />);

      expect(ref.current).toBeInTheDocument();
      expect(ref.current).toHaveTextContent("Ref Test");
    });

    it("should set a display name on the wrapped component", async () => {
      const MockComponent = () => <div>Mock</div>;
      MockComponent.displayName = "MockComponentForDisplayName";
      const bridgeFactory = createBridgeComponent(MockComponent);
      const WrappedComponent = bridgeFactory().rawComponent;

      expect(WrappedComponent.displayName).toBe(
        "Bridge(MockComponentForDisplayName)",
      );

      const AnonymousComponent = () => <div>Anon</div>;
      const anonBridgeFactory = createBridgeComponent(AnonymousComponent);
      const AnonWrappedComponent = anonBridgeFactory().rawComponent;
      // Vitest/Jest might infer 'Anonymous' or the function name 'AnonymousComponent'
      // Let's check for either possibility or a generic 'Component' if name is not inferred
      expect(AnonWrappedComponent.displayName).toMatch(
        /^Bridge\((Anonymous|AnonymousComponent|Component)\)$/,
      );
    });

    it("should handle components with displayName", () => {
      const MockComponentWithDisplayName = () => <div>Mock</div>;
      MockComponentWithDisplayName.displayName = "CustomDisplayName";

      const bridgeFactory = createBridgeComponent(MockComponentWithDisplayName);
      const WrappedComponent = bridgeFactory().rawComponent;

      expect(WrappedComponent.displayName).toBe("Bridge(CustomDisplayName)");
    });
  });

  // --- Default Components Tests ---
  describe("DefaultErrorComponent", () => {
    it("should render error message and retry button", () => {
      const mockError = new Error("Test default error");
      const mockReset = vi.fn();

      render(
        <DefaultErrorComponent
          error={mockError}
          resetErrorBoundary={mockReset}
        />,
      );

      expect(screen.getByText("Error loading component")).toBeInTheDocument();
      expect(screen.getByText("Test default error")).toBeInTheDocument();
      const retryButton = screen.getByRole("button", { name: "Retry" });
      expect(retryButton).toBeInTheDocument();

      retryButton.click();
      expect(mockReset).toHaveBeenCalledTimes(1);
    });
  });

  describe("DefaultLoadingComponent", () => {
    it("should render loading text", () => {
      render(<DefaultLoadingComponent />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  // --- defaultRemoteOptions Tests ---
  describe("defaultRemoteOptions", () => {
    it("should contain DefaultErrorComponent and DefaultLoadingComponent", () => {
      expect(defaultRemoteOptions.ErrorComponent).toBe(DefaultErrorComponent);
      expect(defaultRemoteOptions.LoadingComponent).toBe(
        DefaultLoadingComponent,
      );
    });
  });

  // --- createRemoteComponentLoader Tests ---
  describe("createRemoteComponentLoader", () => {
    const mockRemoteConfig = {
      componentPath: "./Component",
      pluginId: "test:plugin",
    };
    const MockErrorComponent = ({ error }: { error: Error }) => (
      <div data-testid="error-component">{error.message}</div>
    );
    const MockLoadingComponent = () => (
      <div data-testid="loading-component">Loading...</div>
    );
    const mockRemoteOptions = {
      ErrorComponent: MockErrorComponent,
      LoadingComponent: MockLoadingComponent,
    };

    it("should call framework._createRemoteComponent with correct arguments", () => {
      createRemoteComponentLoader(
        mockRemoteConfig as any,
        mockFramework,
        mockRemoteOptions,
      );

      expect(mockFrameworkCreateRemoteComponent).toHaveBeenCalledTimes(1);
      const args = mockFrameworkCreateRemoteComponent.mock.calls[0][0];

      expect(args).toHaveProperty("fallback");
      expect(typeof args.fallback).toBe("function");

      expect(args).toHaveProperty("loader");
      expect(typeof args.loader).toBe("function");

      expect(args).toHaveProperty("loading");
      // The loading prop should be the React element, not the component type
      expect(React.isValidElement(args.loading)).toBe(true);
      // We can't easily check the *type* of the element here without diving into internals,
      // but we can trust the JSX <options.LoadingComponent /> creates the right element.
    });

    it("should pass the LoadingComponent element to framework._createRemoteComponent", () => {
      createRemoteComponentLoader(
        mockRemoteConfig as any,
        mockFramework,
        mockRemoteOptions,
      );

      const args = mockFrameworkCreateRemoteComponent.mock.calls[0][0];
      render(args.loading);
      expect(screen.getByTestId("loading-component")).toBeInTheDocument();
    });

    it("should pass a fallback function that renders the ErrorComponent", () => {
      createRemoteComponentLoader(
        mockRemoteConfig as any,
        mockFramework,
        mockRemoteOptions,
      );

      const args = mockFrameworkCreateRemoteComponent.mock.calls[0][0];
      const fallbackFn = args.fallback;

      const mockError = new Error("Something went wrong");
      const mockReset = vi.fn();

      // Render the result of the fallback function
      render(fallbackFn({ error: mockError, resetErrorBoundary: mockReset }));

      expect(screen.getByTestId("error-component")).toHaveTextContent(
        "Something went wrong",
      );
      // We don't have a button in MockErrorComponent, so can't test resetErrorBoundary click directly
      // but we can verify it was passed as a prop if needed by inspecting the rendered component props.
    });

    it("should pass a loader function that calls framework.resolvePluginModule and framework._loadRemote", async () => {
      const mockResolvedPath = "resolved/path/to/module";
      const mockLoadedModule = { default: vi.fn() };

      mockFrameworkResolvePluginModule.mockResolvedValue(mockResolvedPath);
      mockFrameworkLoadRemote.mockResolvedValue(mockLoadedModule);

      createRemoteComponentLoader(
        mockRemoteConfig as any,
        mockFramework,
        mockRemoteOptions,
      );

      const args = mockFrameworkCreateRemoteComponent.mock.calls[0][0];
      const loaderFn = args.loader;

      // Execute the loader function
      const result = await loaderFn();

      expect(mockFrameworkResolvePluginModule).toHaveBeenCalledTimes(1);
      expect(mockFrameworkResolvePluginModule).toHaveBeenCalledWith(
        mockRemoteConfig.pluginId,
        mockRemoteConfig.componentPath,
      );

      expect(mockFrameworkLoadRemote).toHaveBeenCalledTimes(1);
      expect(mockFrameworkLoadRemote).toHaveBeenCalledWith(mockResolvedPath);

      expect(result).toBe(mockLoadedModule);
    });

    it("loader function should handle errors from framework.resolvePluginModule", async () => {
      const mockError = new Error("Failed to resolve");
      mockFrameworkResolvePluginModule.mockRejectedValue(mockError);

      createRemoteComponentLoader(
        mockRemoteConfig as any,
        mockFramework,
        mockRemoteOptions,
      );

      const args = mockFrameworkCreateRemoteComponent.mock.calls[0][0];
      const loaderFn = args.loader;

      await expect(loaderFn()).rejects.toThrow("Failed to resolve");

      expect(mockFrameworkResolvePluginModule).toHaveBeenCalledTimes(1);
      expect(mockFrameworkLoadRemote).not.toHaveBeenCalled(); // Load remote should not be called
    });

    it("loader function should handle errors from framework._loadRemote", async () => {
      const mockResolvedPath = "resolved/path/to/module";
      const mockError = new Error("Failed to load");

      mockFrameworkResolvePluginModule.mockResolvedValue(mockResolvedPath);
      mockFrameworkLoadRemote.mockRejectedValue(mockError);

      createRemoteComponentLoader(
        mockRemoteConfig as any,
        mockFramework,
        mockRemoteOptions,
      );

      const args = mockFrameworkCreateRemoteComponent.mock.calls[0][0];
      const loaderFn = args.loader;

      await expect(loaderFn()).rejects.toThrow("Failed to load");

      expect(mockFrameworkResolvePluginModule).toHaveBeenCalledTimes(1);
      expect(mockFrameworkLoadRemote).toHaveBeenCalledTimes(1);
      expect(mockFrameworkLoadRemote).toHaveBeenCalledWith(mockResolvedPath);
    });
  });
});
