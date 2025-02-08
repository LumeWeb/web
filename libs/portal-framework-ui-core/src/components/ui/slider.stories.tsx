import type { Meta, StoryObj } from "@storybook/react";

import { Slider } from "@/components/ui/slider";

/**
 * An input where the user selects a value from within a given range.
 */
const meta = {
  args: {
    defaultValue: [33],
    max: 100,
    step: 1,
  },
  argTypes: {},
  component: Slider,
  tags: ["autodocs"],
  title: "ui/Slider",
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the slider.
 */
export const Default: Story = {};

/**
 * Use the `inverted` prop to have the slider fill from right to left.
 */
export const Inverted: Story = {
  args: {
    inverted: true,
  },
};

/**
 * Use the `disabled` prop to disable the slider.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
