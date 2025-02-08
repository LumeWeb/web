import type { Meta, StoryObj } from '@storybook/react';

import { RouteLoading } from './RouteLoading';

const meta: Meta<typeof RouteLoading> = {
  title: 'Components/RouteLoading',
  component: RouteLoading,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RouteLoading>;

export const Default: Story = {
  render: () => <RouteLoading />,
};
