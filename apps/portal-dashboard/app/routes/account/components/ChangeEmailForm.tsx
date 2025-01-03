import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdate, useGetIdentity, BaseKey } from "@refinedev/core";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useForm } from "react-hook-form";
import schema from "./ChangeEmailForm.schema";
import { z } from "zod";

const formSchema = schema;

type FormValues = z.infer<typeof formSchema>;

export default function ChangeEmailForm({
  currentValue,
  close,
}: {
  currentValue: string;
  close: () => void;
}) {
  const { data: identity } = useGetIdentity<{ id: BaseKey }>();
  const { mutate: updateEmail, isSuccess } = useUpdate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      retypePassword: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    updateEmail({
      resource: "account",
      id: identity?.id || "",
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
          <Button type="submit" className="w-full h-14">
            Change Email Address
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
