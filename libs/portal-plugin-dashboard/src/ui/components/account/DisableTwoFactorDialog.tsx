import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@lumeweb/portal-framework-ui-core";
import { useApiUrl } from "@lumeweb/portal-framework-ui";
import {
  useCustomMutation,
  useInvalidateAuthStore,
  useNotification,
} from "@refinedev/core";
import { AlertCircle } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";

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

  // @ts-ignore
  const { isLoading: isDisabling, mutate: disableTwoFactor } =
    useCustomMutation();
  const { open } = useNotification();

  const handleDisableTwoFactor = (values: { password: string }) => {
    disableTwoFactor(
      {
        method: "post",
        url: `${apiUrl}/api/auth/otp/disable`,
        values,
      },
      {
        onError: () => {
          open?.({
            description: "Unable to disable 2FA. Please try again later.",
            message: "An error occurred",
            type: "error",
          });
        },
        onSuccess: () => {
          open?.({
            description: "Your account is no longer using 2FA.",
            message: "Two-factor authentication disabled",
            type: "success",
          });
          invalidateAuth();
          close();
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
            className="space-y-8"
            onSubmit={form.handleSubmit(handleDisableTwoFactor)}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your account password to confirm disabling 2FA.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
              rules={{
                minLength: {
                  message: "Password must be at least 8 characters long",
                  value: 8,
                },
                required: "Password is required",
              }}
            />
            <div className="flex justify-end space-x-4">
              <Button onClick={close} type="button" variant="outline">
                Cancel
              </Button>
              <Button
                disabled={isDisabling}
                type="submit"
                variant="destructive">
                Disable 2FA
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
