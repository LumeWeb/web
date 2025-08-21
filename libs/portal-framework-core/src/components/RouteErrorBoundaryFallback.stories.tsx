import type { Meta, StoryObj } from "@storybook/react";

import { RouteErrorBoundaryFallback } from "./RouteErrorBoundaryFallback";

const meta: Meta<typeof RouteErrorBoundaryFallback> = {
  component: RouteErrorBoundaryFallback,
  tags: ["autodocs"],
  title: "Components/RouteErrorBoundaryFallback",
};

export default meta;
type Story = StoryObj<typeof RouteErrorBoundaryFallback>;

export const Default: Story = {
  args: {
    error: new Error("Test error message"),
  },
};

export const WithRetry: Story = {
  args: {
    error: new Error("Error with retry option"),
    resetErrorBoundary: () => alert("Retry clicked!"),
  },
};

export const RouterError: Story = {
  args: {
    error: {
      data: { message: "Page not found" },
      status: 404,
      statusText: "Not Found",
    },
  },
};

export const StringError: Story = {
  args: {
    error: "Simple string error message",
  },
};
