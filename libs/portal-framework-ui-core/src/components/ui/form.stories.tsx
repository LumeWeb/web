import type { Meta, StoryObj } from "@storybook/react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { action } from "@storybook/addon-actions";
import { useForm } from "react-hook-form";
import * as z from "zod";

/**
 * Building forms with React Hook Form and Zod.
 */
const meta: Meta<typeof Form> = {
  argTypes: {},
  component: Form,
  render: (args) => <ProfileForm {...args} />,
  tags: ["autodocs"],
  title: "ui/Form",
} satisfies Meta<typeof Form>;

export default meta;

type Story = StoryObj<typeof meta>;

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

const ProfileForm = (args: Story["args"]) => {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      username: "",
    },
    resolver: zodResolver(formSchema),
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    action("onSubmit")(values);
  }
  return (
    <Form {...args} {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <input
                  className="border-input bg-background w-full rounded-md border px-3 py-2"
                  placeholder="username"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <button
          className="bg-primary text-primary-foreground rounded px-4 py-2"
          type="submit">
          Submit
        </button>
      </form>
    </Form>
  );
};

/**
 * The default form of the form.
 */
export const Default: Story = {};
