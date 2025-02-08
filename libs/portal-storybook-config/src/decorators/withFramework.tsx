// Assuming this is the path to your core framework package
import { Framework } from "@lumeweb/portal-framework-core";
import React from "react";
// Import the mock provider directly from the framework core package
import { MockFrameworkProvider } from "@lumeweb/portal-framework-core";

const MockWidget = () => <div className="p-4 border rounded">Mock Widget</div>;

// Create mock framework instance
const mockFramework = new Framework(
  {} as any, // mock capability manager
  {} as any, // mock plugin manager
  "storybook",
);

// Mock framework methods
mockFramework.getWidgetRegistrations = (areaId: string) => {
  if (areaId === "dashboard") {
    return [
      { pluginId: "core:widgets", componentName: "Widget1" },
      { pluginId: "core:widgets", componentName: "Widget2" },
    ];
  }
  return [];
};

mockFramework._createRemoteComponent = () => MockWidget;

export const withFramework = (Story: React.ComponentType) => (
  // Use the MockFrameworkProvider instead of FrameworkProvider
  <MockFrameworkProvider
    appName="storybook"
    framework={mockFramework} // Pass the mock framework instance
  >
    <div className="p-4">
      <Story />
    </div>
  </MockFrameworkProvider>
);
