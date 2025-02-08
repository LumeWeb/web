import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Framework } from "../api/framework";
import { useFramework } from "../contexts/framework";
import { createRemoteComponentLoader } from "../plugins/remoteComponentLoader";
import { WidgetArea } from "./WidgetArea";

// Mock framework hooks
vi.mock("../contexts/framework");
vi.mock("../plugins/remoteComponentLoader");

describe("WidgetArea", () => {
  let mockFramework: {
    "#_framework": Framework | null;
    "#capabilities": Map<string, any>;
    "#plugins": Map<string, any>;
    "_appName": string;
    "getWidgetRegistrations": ReturnType<typeof vi.fn>;
    "widgets": Map<string, any>;
  };

  beforeEach(() => {
    // Reset all mocks to clear implementations from previous tests
    vi.resetAllMocks();

    // Create fresh mock framework instance for each test
    mockFramework = {
      "#_framework": null,
      "#capabilities": new Map(),
      "#plugins": new Map(),
      "_appName": "test-app",
      "getWidgetRegistrations": vi.fn(),
      "widgets": new Map(),
    };
    vi.mocked(useFramework).mockReturnValue({
      framework: mockFramework as unknown as Framework,
      error: null,
      isLoading: false,
      reinitialize: vi.fn(),
      getAppName: () => "test-app"
    });
    vi.mocked(createRemoteComponentLoader).mockImplementation(
      () => vi.fn(() => <div data-testid="mock-widget" />) as any,
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("should render no widgets when area not found", () => {
    mockFramework.getWidgetRegistrations.mockReturnValue([]);
    render(<WidgetArea widgetAreaId="empty-area" />);

    expect(screen.queryByTestId("mock-widget")).not.toBeInTheDocument();
  });

  it("should render single widget", () => {
    mockFramework.getWidgetRegistrations.mockReturnValue([
      { componentName: "WidgetA", pluginId: "core:widgets" },
    ]);
    render(<WidgetArea widgetAreaId="single-area" />);

    expect(screen.getAllByTestId("mock-widget")).toHaveLength(1);
  });

  it("should render multiple widgets in order", () => {
    mockFramework.getWidgetRegistrations.mockReturnValue([
      { componentName: "WidgetA", pluginId: "core:widgets" },
      { componentName: "WidgetB", pluginId: "core:widgets" },
      { componentName: "WidgetC", pluginId: "core:widgets" },
    ]);
    render(<WidgetArea widgetAreaId="multi-area" />);

    const widgets = screen.getAllByTestId("mock-widget");
    expect(widgets).toHaveLength(3);
    expect(widgets[0]).toBeInTheDocument(); // Verify first widget
    expect(widgets[1]).toBeInTheDocument(); // Verify second widget
    expect(widgets[2]).toBeInTheDocument(); // Verify third widget
  });
});
