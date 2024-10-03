import { Link } from "@remix-run/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ToastAction } from "@/components/ui/toast";
import { useForgotPassword, useNotification } from "@refinedev/core";
import schema from "./ResetPasswordForm.schema";
import { ForgotPasswordRequest } from "@/dataProviders/authProvider";

type ResetPasswordFormValues = z.infer<typeof schema>;

export default function ResetPasswordForm() {
  const forgotPassword = useForgotPassword<ForgotPasswordRequest>();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ResetPasswordFormValues) => {
    forgotPassword.mutate(data);
  };

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
                  <Input {...field} />
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
