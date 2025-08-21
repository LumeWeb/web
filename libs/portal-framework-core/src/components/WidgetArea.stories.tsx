import type { Meta, StoryObj } from "@storybook/react";

import React from "react";

import { Framework } from "../api/framework";
import { MockFrameworkProvider } from "../testing/MockFrameworkProvider";
import { WidgetArea } from "./WidgetArea";

const MockWidget = () => <div className="p-4 border rounded">Mock Widget</div>;

// Create mock framework instance (similar to withFramework decorator)
const mockFramework = {
  _createRemoteComponent: () => {
    const MockWidget = () => (
      <div className="p-4 border rounded">Mock Widget</div>
    );
    return () => MockWidget;
  },
  appName: "storybook",
  getWidgetRegistrations: (areaId: string) => {
    if (areaId === "dashboard") {
      return [
        { componentName: "Widget1", pluginId: "core:widgets" },
        { componentName: "Widget2", pluginId: "core:widgets" },
      ];
    }
    return [];
  },
} as unknown as Framework;

const meta: Meta<typeof WidgetArea> = {
  component: WidgetArea,
  // Add render function for Docs page
  render: (args) => (
    <MockFrameworkProvider appName="storybook" framework={mockFramework}>
      <WidgetArea {...args} />
    </MockFrameworkProvider>
  ),
  tags: ["autodocs"],
  title: "Components/WidgetArea",
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithWidgets: Story = {
  args: {
    id: "dashboard",
  },
};

export const Empty: Story = {
  args: {
    id: "empty-area",
  },
};
