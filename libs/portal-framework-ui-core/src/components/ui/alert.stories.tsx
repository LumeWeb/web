import type { Meta, StoryObj } from "@storybook/react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

/**
 * Displays a callout for user attention.
 */
const meta = {
  args: {
    variant: "default",
  },
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: ["default", "destructive"],
    },
  },
  component: Alert,
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the cli.
      </AlertDescription>
    </Alert>
  ),
  tags: ["autodocs"],
  title: "ui/Alert",
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;
/**
 * The default form of the alert.
 */
export const Default: Story = {};

/**
 * Use the `destructive` alert to indicate a destructive action.
 */
export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
  render: (args) => (
    <Alert {...args}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  ),
};
