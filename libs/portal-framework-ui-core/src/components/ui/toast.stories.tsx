import type { Meta, StoryObj } from "@storybook/react";

import {
  Toast,
  ToastAction,
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/useToast";

/**
 * A succinct message that is displayed temporarily.
 */
const meta = {
  argTypes: {},
  component: Toast,
  parameters: {
    layout: "centered",
  },
  render: (args) => {
    const { toast } = useToast();
    return (
      <div>
        <button
          onClick={() => {
            toast(args);
          }}>
          Show Toast
        </button>
        <Toaster />
      </div>
    );
  },
  tags: ["autodocs"],
  title: "ui/Toast",
} satisfies Meta<typeof Toast>;

export default meta;

type Story = Omit<StoryObj<typeof meta>, "args"> & {
  args: Omit<ToasterToast, "id">;
};

type ToasterToast = ToastProps & {
  action?: ToastActionElement;
  description?: string;
  id: string;
  title?: string;
};

/**
 * The default form of the toast.
 */
export const Default: Story = {
  args: {
    description: "Your message has been sent.",
  },
};

/**
 * Use the `title` prop to provide a title for the toast.
 */
export const WithTitle: Story = {
  args: {
    description: "There was a problem with your request.",
    title: "Uh oh! Something went wrong.",
  },
};

/**
 * Use the `action` prop to provide an action for the toast.
 */
export const WithAction: Story = {
  args: {
    action: <ToastAction altText="Try again">Try again</ToastAction>,
    description: "There was a problem with your request.",
    title: "Uh oh! Something went wrong.",
  },
};

/**
 * Use the `destructive` variant to indicate a destructive action.
 */
export const Destructive: Story = {
  args: {
    action: <ToastAction altText="Try again">Try again</ToastAction>,
    description: "There was a problem with your request.",
    title: "Uh oh! Something went wrong.",
    variant: "destructive",
  },
};
