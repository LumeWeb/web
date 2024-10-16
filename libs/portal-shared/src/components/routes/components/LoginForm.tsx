import { useLogin, useParsed } from "@refinedev/core";
import type { AuthFormRequest } from "@/dataProviders/authProvider";
import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import LoginSchema from "@/components/routes/components/LoginForm.schema";
import { Field, FieldCheckbox } from "@/components/Forms";
import { Button } from "@/components/ui/button";
import { Link } from "@remix-run/react";
import useResetPasswordUrl from "@/hooks/useResetPasswordUrl";

export type LoginParams = {
  to: string;
};
export const LoginForm = () => {
  const login = useLogin<AuthFormRequest>();
  const parsed = useParsed<LoginParams>();
  const [form, fields] = useForm({
    id: "login",
    constraint: getZodConstraint(LoginSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LoginSchema });
    },
    shouldValidate: "onSubmit",
    onSubmit(e, { submission }) {
      e.preventDefault();

      if (submission?.status === "success") {
        const data = submission.value;
        login.mutate({
          email: data.email,
          password: data.password,
          remember: data.remember ?? false,
          redirectTo: parsed.params?.to,
        });
      }
    },
  });

  const resetPasswordUrl = useResetPasswordUrl();

  return (
    <form className="w-full max-w-md " {...getFormProps(form)}>
      <Field
        inputProps={{ name: fields.email.name }}
        labelProps={{ children: "Email" }}
        errors={fields.email.errors}
      />
      <Field
        inputProps={{ name: fields.password.name, type: "password" }}
        labelProps={{ children: "Password" }}
        errors={fields.password.errors}
      />
      <FieldCheckbox
        inputProps={{ name: fields.remember.name, form: form.id }}
        labelProps={{ children: "Remember Me" }}
        errors={fields.remember.errors}
      />
      <Button className="w-full h-14">Login</Button>
      <p className="inline-block mt-4 text-input-placeholder">
        Forgot your password?{" "}
        <Link
          to={resetPasswordUrl}
          className="text-foreground text-md hover:underline hover:underline-offset-4">
          Reset Password
        </Link>
      </p>
    </form>
  );
};
