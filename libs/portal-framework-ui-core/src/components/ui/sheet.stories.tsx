import type { Meta, StoryObj } from "@storybook/react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Extends the Dialog component to display content that complements the main
 * content of the screen.
 */
const meta: Meta<typeof SheetContent> = {
  args: {
    side: "right",
  },
  argTypes: {
    side: {
      control: {
        type: "radio",
      },
      options: ["top", "bottom", "left", "right"],
    },
  },
  component: Sheet,
  parameters: {
    layout: "centered",
  },
  render: (args) => (
    <Sheet>
      <SheetTrigger>Open</SheetTrigger>
      <SheetContent {...args}>
        <SheetHeader>
          <SheetTitle>Are you absolutely sure?</SheetTitle>
          <SheetDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose>
            <button className="hover:underline">Cancel</button>
          </SheetClose>
          <button className="bg-primary text-primary-foreground rounded px-4 py-2">
            Submit
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  tags: ["autodocs"],
  title: "ui/Sheet",
} satisfies Meta<typeof SheetContent>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the sheet.
 */
export const Default: Story = {};
