import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useGo, useIsAuthenticated, useParsed } from "@refinedev/core";
import { Link } from "@remix-run/react";
import { useEffect } from "react";
import { Field } from "apps/portal-dashboard/app/components/Forms.js";
import { Button } from "@/components/ui/button";

import { LoginParams } from "apps/portal-dashboard/app/routes/Login/components/LoginForm.js";
import schema from "./otp.schema";

export default function OtpForm() {
  const { isLoading: isAuthLoading, data: authData } = useIsAuthenticated();
  const go = useGo();
  const parsed = useParsed<LoginParams>();
  // TODO: Add support for resending the OTP
  const [form, fields] = useForm({
    id: "otp",
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    shouldValidate: "onSubmit",
  });
  const valid = true;
  const to = parsed.params?.to ?? "/dashboard";

  useEffect(() => {
    if (!isAuthLoading) {
      if (authData?.authenticated && valid) {
        go({ to, type: "push" });
      }
    }
  }, [isAuthLoading, authData, to, go]);

  return (
    <form
      className="w-full p-2 max-w-md mt-12 bg-background"
      {...getFormProps(form)}>
      <span className="block !mb-8 space-y-2">
        <h2 className="text-3xl font-bold">Check your inbox</h2>
        <p className="text-input-placeholder">
          We will need the six digit confirmation code you received in your
          email in order to verify your account and get started. Didn't receive
          a code?{" "}
          <Button type="button" variant={"link"} className="text-md h-0">
            Resend now →
          </Button>
        </p>
      </span>
      <Field
        inputProps={{ name: fields.otp.name }}
        labelProps={{ children: "Confirmation Code" }}
        errors={fields.otp.errors}
      />
      <Button className="w-full h-14">Verify</Button>
      <p className="text-input-placeholder w-full text-left">
        <Link
          to="/login"
          className="text-primary-1 text-md hover:underline hover:underline-offset-4">
          ← Back to Login
        </Link>
      </p>
    </form>
  );
}
