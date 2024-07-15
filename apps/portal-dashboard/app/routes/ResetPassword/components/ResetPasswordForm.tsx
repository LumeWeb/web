import { Link } from "@remix-run/react";
import { Button } from "~/components/ui/button.js";
import { Field } from "~/components/Forms.js";
import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ToastAction } from "~/components/ui/toast";
import { useNotification } from "@refinedev/core";
import RecoverPasswordSchema from "./ResetPasswordForm.schema";

export default function ResetPasswordForm() {
  const { open } = useNotification();
  const [form, fields] = useForm({
    id: "sign-up",
    constraint: getZodConstraint(RecoverPasswordSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: RecoverPasswordSchema });
    },
    onSubmit(e) {
      e.preventDefault();
      open?.({
        type: "success",
        message: "Password reset email sent",
        description:
          "Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.",
        action: <ToastAction altText="Cancel">Cancel</ToastAction>,
        cancelMutation: () => {
          console.log("cancel mutation");
        },
      });
    },
  });

  return (
    <form
      className="w-full h-full p-4 sm:p-10 space-y-4 mt-12"
      {...getFormProps(form)}>
      <p className="text-input-placeholder w-full text-left mb-10">
        <Link
          to="/login"
          className="text-foreground text-md hover:underline hover:underline-offset-4">
          ← Back to Login
        </Link>
      </p>
      <span className="!mb-12 space-y-2">
        <h2 className="text-3xl font-bold">Reset your password</h2>
      </span>
      <Field
        inputProps={{ name: fields.email.name }}
        labelProps={{ children: "Email Address" }}
        errors={fields.email.errors}
      />
      <Button className="w-full h-14">Reset Password</Button>
    </form>
  );
}
