import { zodResolver } from "@hookform/resolvers/zod";
import { createBridgeComponent } from "@lumeweb/portal-framework-core";
import { useForgotPassword } from "@refinedev/core";
import React from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { z } from "zod";
import { ForgotPasswordRequest } from "../../../dataProviders/auth";
import schema from "./ResetPasswordForm.schema";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@lumeweb/portal-framework-ui-core";

type ResetPasswordFormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const forgotPassword = useForgotPassword<ForgotPasswordRequest>();

  const form = useForm<ResetPasswordFormValues>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: ResetPasswordFormValues) => {
    forgotPassword.mutate(data);
  };

  return (
    <div className="w-full h-full p-4 sm:p-10 space-y-4 mt-12">
      <p className="text-input-placeholder w-full text-left mb-10">
        <Link
          className="text-foreground text-md hover:underline hover:underline-offset-4"
          to="/login">
          ← Back to Login
        </Link>
      </p>
      <div className="!mb-12 space-y-2">
        <h2 className="text-3xl font-bold">Reset your password</h2>
      </div>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full h-14" type="submit">
            Reset Password
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default ResetPasswordForm;
