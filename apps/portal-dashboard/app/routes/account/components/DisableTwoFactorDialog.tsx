import React from "react";
import { useForm } from "react-hook-form";
import { useCustomMutation, useNotification } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import useApiUrl from "@/routes/account/hooks/useApiUrl.js";
import { useInvalidateAuthStore } from "@refinedev/core";

export default function DisableTwoFactorDialog({
  close,
}: {
  close: () => void;
}) {
  const apiUrl = useApiUrl();
  const form = useForm({
    defaultValues: {
      password: "",
    },
  });
  const invalidateAuth = useInvalidateAuthStore();

  const { mutate: disableTwoFactor, isLoading: isDisabling } =
    useCustomMutation();
  const { open } = useNotification();

  const handleDisableTwoFactor = (values: { password: string }) => {
    disableTwoFactor(
      {
        url: `${apiUrl}/api/auth/otp/disable`,
        method: "post",
        values,
      },
      {
        onSuccess: () => {
          open?.({
            type: "success",
            message: "Two-factor authentication disabled",
            description: "Your account is no longer using 2FA.",
          });
          invalidateAuth();
          close();
        },
        onError: () => {
          open?.({
            type: "error",
            message: "An error occurred",
            description: "Unable to disable 2FA. Please try again later.",
          });
        },
      },
    );
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="mb-8">
          Disable Two-Factor Authentication
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Disabling two-factor authentication will make your account less
            secure. Please confirm this action by entering your account
            password.
          </AlertDescription>
        </Alert>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleDisableTwoFactor)}
            className="space-y-8">
            <FormField
              control={form.control}
              name="password"
              rules={{
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters long",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your account password to confirm disabling 2FA.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isDisabling}>
                Disable 2FA
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
