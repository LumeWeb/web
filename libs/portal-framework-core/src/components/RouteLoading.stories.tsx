import type { Meta, StoryObj } from "@storybook/react";

import { RouteLoading } from "./RouteLoading";

const meta: Meta<typeof RouteLoading> = {
  component: RouteLoading,
  tags: ["autodocs"],
  title: "Components/RouteLoading",
};

export default meta;
type Story = StoryObj<typeof RouteLoading>;

export const Default: Story = {
  render: () => <RouteLoading />,
};
