import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@lumeweb/portal-framework-ui";
import { BaseKey, useGetIdentity, useUpdate } from "@refinedev/core";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import schema from "./ChangeEmailForm.schema";

const formSchema = schema;

type FormValues = z.infer<typeof formSchema>;

export default function ChangeEmailForm({
  close,
  currentValue,
}: {
  close: () => void;
  currentValue: string;
}) {
  const { data: identity } = useGetIdentity<{ id: BaseKey }>();
  const { isSuccess, mutate: updateEmail } = useUpdate();

  const form = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
      retypePassword: "",
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormValues) => {
    updateEmail({
      id: identity?.id || "",
      resource: "account",
      values: {
        email: data.email,
        password: data.password,
      },
    });
  };

  useEffect(() => {
    if (isSuccess) {
      close();
    }
  }, [isSuccess, close]);

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle className="mb-8">Change Email</DialogTitle>
        </DialogHeader>
        <div className="rounded-full px-4 py-2 w-fit text-sm bg-ring font-bold text-secondary-1">
          {currentValue}
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Email Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="retypePassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Retype Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button className="w-full h-14" type="submit">
            Change Email Address
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
