import type { Meta, StoryObj } from "@storybook/react";

import { Label } from "@/components/ui/label";

/**
 * Renders an accessible label associated with controls.
 */
const meta = {
  args: {
    children: "Your email address",
    htmlFor: "email",
  },
  argTypes: {
    children: {
      control: { type: "text" },
    },
  },
  component: Label,
  tags: ["autodocs"],
  title: "ui/Label",
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof Label>;

/**
 * The default form of the label.
 */
export const Default: Story = {};
