import type { Meta, StoryObj } from "@storybook/react";

import { GridWidgetArea } from "libs/portal-framework-core/src/components/GridWidgetArea";
import React from "react";

import { Framework } from "../api/framework";
import { MockFrameworkProvider } from "../testing/MockFrameworkProvider";

const MockWidget = () => <div className="rounded border p-4">Mock Widget</div>;

// Create mock framework instance (similar to withFramework decorator)
const mockFramework = {
  _createRemoteComponent: () => {
    const MockWidget = () => (
      <div className="rounded border p-4">Mock Widget</div>
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

const meta: Meta<typeof GridWidgetArea> = {
  component: GridWidgetArea,
  // Add render function for Docs page
  render: (args) => (
    <MockFrameworkProvider appName="storybook" framework={mockFramework}>
      <GridWidgetArea {...args} />
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
