import type { Meta, StoryObj } from "@storybook/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BellRing } from "lucide-react";

const notifications = [
  {
    description: "1 hour ago",
    title: "Your call has been confirmed.",
  },
  {
    description: "1 hour ago",
    title: "You have a new message!",
  },
  {
    description: "2 hours ago",
    title: "Your subscription is expiring soon!",
  },
];

/**
 * Displays a card with header, content, and footer.
 */
const meta = {
  args: {
    className: "w-96",
  },
  argTypes: {},
  component: Card,
  parameters: {
    layout: "centered",
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {notifications.map((notification, index) => (
          <div className="flex items-center gap-4" key={index}>
            <BellRing className="size-6" />
            <div>
              <p>{notification.title}</p>
              <p className="text-foreground/60">{notification.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <button className="hover:underline">Close</button>
      </CardFooter>
    </Card>
  ),
  tags: ["autodocs"],
  title: "ui/Card",
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the card.
 */
export const Default: Story = {};
