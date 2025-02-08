import type { Meta, StoryObj } from "@storybook/react";

import { Switch } from "@/components/ui/switch";

/**
 * A control that allows the user to toggle between checked and not checked.
 */
const meta = {
  argTypes: {},
  component: Switch,
  parameters: {
    layout: "centered",
  },
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Switch {...args} />
      <label className="peer-disabled:text-foreground/50" htmlFor={args.id}>
        Airplane Mode
      </label>
    </div>
  ),
  tags: ["autodocs"],
  title: "ui/Switch",
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the switch.
 */
export const Default: Story = {
  args: {
    id: "default-switch",
  },
};

/**
 * Use the `disabled` prop to disable the switch.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    id: "disabled-switch",
  },
};
