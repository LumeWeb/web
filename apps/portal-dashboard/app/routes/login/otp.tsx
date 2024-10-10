import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useGo,
  useIsAuthenticated,
  useLogin,
  useParsed,
} from "@refinedev/core";
import { Link } from "@remix-run/react";
import { useEffect } from "react";
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

import { LoginParams } from "portal-shared/components/routes/components/LoginForm";
import schema from "./otp.schema";
import { OTPFormRequest } from "portal-shared/dataProviders/authProvider";

export default function OtpForm() {
  const { isLoading: isAuthLoading, data: authData } = useIsAuthenticated();
  const go = useGo();
  const parsed = useParsed<LoginParams>();
  const to = parsed.params?.to;
  const login = useLogin<OTPFormRequest>();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = (data) => {
    debugger;
    login.mutate({
      otp: data.otp,
      redirectTo: to ?? undefined,
    });
  };

  useEffect(() => {
    if (!isAuthLoading && authData?.authenticated) {
      go({ to, type: "push" });
    }
  }, [isAuthLoading, authData, to, go]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full p-2 max-w-md mt-12 bg-background">
        <span className="block !mb-8 space-y-2">
          <h2 className="text-3xl font-bold">Check your inbox</h2>
          <p className="text-input-placeholder">
            We will need the six digit confirmation code you received in your
            email in order to verify your account and get started. Didn't
            receive a code?{" "}
            <Button type="button" variant="link" className="text-md h-0">
              Resend now →
            </Button>
          </p>
        </span>
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmation Code</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full h-14">
          Verify
        </Button>
        <p className="text-input-placeholder w-full text-left">
          <Link
            to="/login"
            className="text-primary-1 text-md hover:underline hover:underline-offset-4">
            ← Back to Login
          </Link>
        </p>
      </form>
    </Form>
  );
}
