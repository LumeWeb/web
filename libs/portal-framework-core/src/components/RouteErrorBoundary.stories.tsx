import type { Meta, StoryObj } from "@storybook/react";

import { RouteErrorBoundary } from "./RouteErrorBoundary";

const meta: Meta<typeof RouteErrorBoundary> = {
  title: "Components/RouteErrorBoundary",
  component: RouteErrorBoundary,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RouteErrorBoundary>;

const ErrorThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error from component");
  }
  return <div>No error thrown</div>;
};

export const WithRouterError: Story = {
  args: {
    children: undefined,
  },
  render: () => (
    <RouteErrorBoundary>
      <ErrorThrowingComponent shouldThrow={true} />
    </RouteErrorBoundary>
  ),
};

export const WithChildren: Story = {
  args: {
    children: <ErrorThrowingComponent shouldThrow={true} />,
  },
};

export const WithoutError: Story = {
  args: {
    children: <ErrorThrowingComponent shouldThrow={false} />,
  },
};
