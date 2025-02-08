import type { Meta, StoryObj } from "@storybook/react";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

/**
 * A set of checkable buttons—known as radio buttons—where no more than one of
 * the buttons can be checked at a time.
 */
const meta = {
  args: {
    className: "grid gap-2 grid-cols-[1rem_1fr] items-center",
    defaultValue: "comfortable",
  },
  argTypes: {},
  component: RadioGroup,
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroupItem id="r1" value="default" />
      <label htmlFor="r1">Default</label>
      <RadioGroupItem id="r2" value="comfortable" />
      <label htmlFor="r2">Comfortable</label>
      <RadioGroupItem id="r3" value="compact" />
      <label htmlFor="r3">Compact</label>
    </RadioGroup>
  ),
  tags: ["autodocs"],
  title: "ui/RadioGroup",
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the radio group.
 */
export const Default: Story = {};
