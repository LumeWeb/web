import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdatePassword } from "@refinedev/core";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "portal-shared/components/ui/dialog";
import { Button } from "portal-shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "portal-shared/components/ui/form";
import { Input } from "portal-shared/components/ui/input";
import type { UpdatePasswordFormRequest } from "portal-shared/dataProviders/authProvider";
import schema from "./ChangePasswordForm.schema";
import { z } from "zod";

const formSchema = schema;

type FormValues = z.infer<typeof formSchema>;

export default function ChangePasswordForm({ close }: { close: () => void }) {
  const { mutate: updatePassword, isSuccess } =
    useUpdatePassword<UpdatePasswordFormRequest>();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      retypePassword: "",
    },
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          <Button type="submit" className="w-full h-14">
            Change Password
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
