import { useEffect, useState } from "react";
import { Link, useSearchParams } from "@remix-run/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { useForgotPassword, useGo } from "@refinedev/core";
import { ForgotPasswordConfirmRequest } from "portal-shared/dataProviders/authProvider";

const schema = z
  .object({
    email: z.string().email().min(1),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    token: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof schema>;

export default function ConfirmResetPasswordForm() {
  const go = useGo();
  const forgotPassword = useForgotPassword<ForgotPasswordConfirmRequest>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchParams] = useSearchParams();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      token: "",
    },
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
          to="/login"
          className="text-foreground text-md hover:underline hover:underline-offset-4">
          ← Back to Login
        </Link>
      </p>
      <div className="!mb-12 space-y-2">
        <h2 className="text-3xl font-bold">Reset your password</h2>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <Button type="submit" className="w-full h-14">
            Reset Password
          </Button>
        </form>
      </Form>
    </div>
  );
}
