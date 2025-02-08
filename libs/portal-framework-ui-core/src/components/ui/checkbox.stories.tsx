import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "@/components/ui/checkbox";

/**
 * A control that allows the user to toggle between checked and not checked.
 */
const meta: Meta<typeof Checkbox> = {
  args: {
    disabled: false,
    id: "terms",
  },
  argTypes: {},
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  render: (args) => (
    <div className="flex space-x-2">
      <Checkbox {...args} />
      <label
        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
        htmlFor={args.id}>
        Accept terms and conditions
      </label>
    </div>
  ),
  tags: ["autodocs"],
  title: "ui/Checkbox",
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the checkbox.
 */
export const Default: Story = {};

/**
 * Use the `disabled` prop to disable the checkbox.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    id: "disabled-terms",
  },
};
