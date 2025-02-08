import {
  act,
  cleanup,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Builder } from "../api/builder";

import { Framework } from "../api/framework";
import {
  initializeFramework,
  shouldInitialize,
} from "../util/framework-initializer";
import {
  FrameworkProvider,
  useFramework,
  useFrameworkLoading,
} from "./framework";

// Mock the framework initialization module
vi.mock("../util/framework-initializer", () => ({
  initializeFramework: vi.fn(),
  shouldInitialize: vi.fn(),
}));

// Mock environment variables
vi.mock("../env", () => ({
  env: {
    VITE_PORTAL_DOMAIN: "example.com",
  },
}));

describe("FrameworkProvider", () => {
  const mockFramework = { appName: "test-app" } as unknown as Framework;

  beforeEach(() => {
    vi.mocked(initializeFramework).mockReset();
    vi.mocked(shouldInitialize).mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
  });

  it("should initialize framework and provide context", async () => {
    vi.mocked(initializeFramework).mockResolvedValue({
      builder: {} as any,
      framework: mockFramework,
      success: true,
    });

    const TestConsumer = () => {
      const { framework, isLoading } = useFramework();
      const { getAppName } = useFramework();

      return (
        <div>
          <div data-testid="status">{isLoading ? "Loading" : "Ready"}</div>
          <div data-testid="appName">{getAppName()}</div>
        </div>
      );
    };

    render(
      <FrameworkProvider appName="test-app" configure={(builder) => builder}>
        <TestConsumer />
      </FrameworkProvider>,
    );

    // Use findBy queries which wait for elements to appear
    expect(await screen.findByTestId("status")).toHaveTextContent("Ready");
    expect(await screen.findByTestId("appName")).toHaveTextContent("test-app");
  });

  it("should handle initialization errors", async () => {
    const testError = new Error("Initialization failed");
    vi.mocked(initializeFramework).mockRejectedValue(testError);

    const TestConsumer = () => {
      const { error } = useFrameworkLoading();
      return <div data-testid="status">{error ? "Error" : "Loading"}</div>;
    };

    render(
      <FrameworkProvider appName="test-app" configure={(builder) => builder}>
        <TestConsumer />
      </FrameworkProvider>,
    );

    // Use findBy which waits for the element to appear
    expect(await screen.findByTestId("status")).toHaveTextContent("Error");
  });

  it("should support reinitialization", async () => {
    const mockInit = vi
      .mocked(initializeFramework)
      .mockRejectedValueOnce(new Error("First error"))
      .mockResolvedValueOnce({
        builder: {} as any,
        framework: mockFramework,
        success: true,
      });

    const TestConsumer = () => {
      const { error, isLoading, reinitialize } = useFrameworkLoading();
      return (
        <>
          <div data-testid="status">
            {isLoading ? "Loading" : error ? "Error" : "Ready"}
          </div>
          <button onClick={reinitialize}>Retry</button>
        </>
      );
    };

    const mockBuilder = {
      // Add other required Builder properties
      "#framework": undefined,
      "#operations": [],
      "_appName": "test-app",
      "build": vi.fn().mockResolvedValue(mockFramework),
      "configure": vi.fn(),
      "framework": Promise.resolve(mockFramework),
      "getCapabilityManager": vi.fn(),
      "getPluginManager": vi.fn(),
      "initialize": vi.fn(),
    } as unknown as Builder;

    render(
      <FrameworkProvider appName="test-app" configure={() => mockBuilder}>
        <TestConsumer />
      </FrameworkProvider>,
    );

    // Initial error state
    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("Error");
    });

    // Trigger reinitialize
    await act(async () => {
      await userEvent.click(screen.getByText("Retry"));
    });

    await waitFor(() => {
      expect(mockInit).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId("status")).toHaveTextContent("Ready");
    });
  });
});

describe("useFramework", () => {
  it("should throw if used outside provider", () => {
    expect(() => {
      renderHook(() => useFramework());
    }).toThrow("useFramework must be used within a FrameworkProvider");
  });

  it("should return framework when used within provider", () => {
    const mockFramework = { appName: "test-app" } as unknown as Framework;
    const { result } = renderHook(() => useFramework(), {
      wrapper: ({ children }) => (
        <FrameworkProvider appName="test-app" configure={(builder) => builder}>
          {children}
        </FrameworkProvider>
      ),
    });

    expect(result.current).toBeDefined();
  });
});

describe("useFrameworkLoading", () => {
  it("should throw if used outside provider", () => {
    expect(() => {
      renderHook(() => useFrameworkLoading());
    }).toThrow("useFrameworkLoading must be used within a FrameworkProvider");
  });

  it("should return loading state", async () => {
    const mockFramework = { appName: "test-app" } as unknown as Framework;
    vi.mocked(initializeFramework).mockResolvedValue({
      builder: {} as any,
      framework: mockFramework,
      success: true,
    });

    const { result } = renderHook(() => useFrameworkLoading(), {
      wrapper: ({ children }) => (
        <FrameworkProvider appName="test-app" configure={(builder) => builder}>
          {children}
        </FrameworkProvider>
      ),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
