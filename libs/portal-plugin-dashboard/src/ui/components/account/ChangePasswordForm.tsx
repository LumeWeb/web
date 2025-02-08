import type { UpdatePasswordFormRequest } from "@/dataProviders/auth";

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
import { useUpdatePassword } from "@refinedev/core";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import schema from "./ChangePasswordForm.schema";

const formSchema = schema;

type FormValues = z.infer<typeof formSchema>;

export default function ChangePasswordForm({ close }: { close: () => void }) {
  const { isSuccess, mutate: updatePassword } =
    useUpdatePassword<UpdatePasswordFormRequest>();

  const form = useForm<FormValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      retypePassword: "",
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormValues) => {
    updatePassword({
      currentPassword: data.currentPassword,
      password: data.newPassword,
    });
  };

  useEffect(() => {
    if (isSuccess) {
      close();
    }
  }, [isSuccess, close]);

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle className="mb-8">Change Password</DialogTitle>
        </DialogHeader>

        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
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
            Change Password
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
