import type { Meta, StoryObj } from '@storybook/react';
import { ErrorDisplay } from './ErrorDisplay';

const meta: Meta<typeof ErrorDisplay> = {
  title: 'Components/ErrorDisplay',
  component: ErrorDisplay,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ErrorDisplay>;

export const SimpleError: Story = {
  args: {
    error: new Error('This is a test error message'),
  },
};

export const WithRetry: Story = {
  args: {
    error: new Error('Error with retry option'),
    onRetry: () => alert('Retry clicked!'),
  },
};

export const InitializationError: Story = {
  args: {
    error: {
      errors: [
        {
          category: 'plugin',
          error: new Error('Plugin failed to load'),
          id: 'core:plugin',
        },
        {
          category: 'capability',
          error: new Error('Capability initialization failed'),
          id: 'core:capability',
        },
      ],
    },
  },
};
