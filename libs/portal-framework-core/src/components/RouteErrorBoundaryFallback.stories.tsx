import type { Meta, StoryObj } from '@storybook/react';

import { RouteErrorBoundaryFallback } from './RouteErrorBoundaryFallback';

const meta: Meta<typeof RouteErrorBoundaryFallback> = {
  title: 'Components/RouteErrorBoundaryFallback',
  component: RouteErrorBoundaryFallback,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RouteErrorBoundaryFallback>;

export const Default: Story = {
  args: {
    error: new Error('Test error message'),
  },
};

export const WithRetry: Story = {
  args: {
    error: new Error('Error with retry option'),
    resetErrorBoundary: () => alert('Retry clicked!'),
  },
};

export const RouterError: Story = {
  args: {
    error: {
      status: 404,
      statusText: 'Not Found',
      data: { message: 'Page not found' },
    },
  },
};

export const StringError: Story = {
  args: {
    error: 'Simple string error message',
  },
};
