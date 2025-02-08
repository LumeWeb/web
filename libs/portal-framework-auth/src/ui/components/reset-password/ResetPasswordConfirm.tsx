import { zodResolver } from "@hookform/resolvers/zod";
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
import { useForgotPassword, useGo } from "@refinedev/core";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router";
import { z } from "zod";

import { ForgotPasswordConfirmRequest } from "../../../dataProviders/auth";
import schema from "./ResetPasswordConfirmForm.schema";

type ResetPasswordFormValues = z.infer<typeof schema>;

function ResetPasswordConfirm() {
  const go = useGo();
  const forgotPassword = useForgotPassword<ForgotPasswordConfirmRequest>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchParams] = useSearchParams();

  const form = useForm<ResetPasswordFormValues>({
    defaultValues: {
      confirmPassword: "",
      email: "",
      password: "",
      token: "",
    },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const email = searchParams.get("email") || "";
    const token = searchParams.get("token") || "";
    form.setValue("email", email);
    form.setValue("token", token);
  }, [searchParams, form]);

  const onSubmit = (data: ResetPasswordFormValues) => {
    // Remove confirmPassword before sending to the API
    const { confirmPassword, ...submitData } = data;
    // @ts-ignore
    forgotPassword.mutate(submitData, {
      onSuccess: (result) => {
        if (result.success) {
          setIsSuccess(true);
        }
      },
    });
  };

  const handleGoToLogin = () => {
    go({ to: "/login" });
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center">
        <p className="opacity-60 mb-4">
          Your password has been reset successfully.
        </p>
        <Button onClick={handleGoToLogin}>Go to Login</Button>
      </div>
    );
  }

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
                  <Input {...field} readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reset Token</FormLabel>
                <FormControl>
                  <Input {...field} readOnly />
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
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
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
export default ResetPasswordConfirm;
