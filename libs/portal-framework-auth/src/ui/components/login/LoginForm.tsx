import type { AuthFormRequest } from "@/dataProviders/auth";
import {
  ActionItemType,
  FormConfig,
  FormFieldType,
  SchemaForm,
  useResetPasswordUrl,
} from "@lumeweb/portal-framework-ui";
import { useLogin, useParsed } from "@refinedev/core";
import React from "react";
import { Link } from "react-router";
import LoginSchema from "./LoginForm.schema";
import type { z } from "zod";

export type LoginParams = {
  to: string;
};

type LoginFormValues = z.infer<typeof LoginSchema>;

export const LoginForm = () => {
  const { mutate: login } = useLogin<AuthFormRequest>();
  const parsed = useParsed<LoginParams>();
  const resetPasswordUrl = useResetPasswordUrl();

  const formConfig: FormConfig<LoginFormValues> = {
    adapter: "rhf",
    validationSchema: LoginSchema,
    fields: [
      {
        name: "email",
        type: FormFieldType.TEXT,
        label: "Email",
        inputClassName: "mt-4 bg-input border placeholder-input-placeholder",
        labelClassName: "font-semibold text-sm text-secondary-foreground",
        required: true,
      },
      {
        name: "password",
        type: FormFieldType.PASSWORD,
        label: "Password",
        inputClassName: "mt-4 bg-input border placeholder-input-placeholder",
        labelClassName: "font-semibold text-sm text-secondary-foreground",
        required: true,
      },
      {
        name: "remember",
        type: FormFieldType.CHECKBOX,
        label: "Remember Me",
        itemClassName: "flex items-center space-x-2 text-foreground",
      },
    ],
    footer: [
      {
        type: ActionItemType.CUSTOM_COMPONENT,
        component: () => <div className="w-full min-h-[32px] px-4 pb-3 pt-1" />,
        props: {},
      },
      {
        type: ActionItemType.SUBMIT,
        label: "Login",
        className:
          "w-full h-14 px-4 py-2 bg-secondary text-foreground hover:bg-secondary/60",
      },
    ],
    footerClassName: false,
    onSubmit: async (data) => {
      login({
        email: data.email,
        password: data.password,
        redirectTo: parsed.params?.to,
        remember: data.remember ?? false,
      });
    },
    // Update formClassName to match the target wrapper
    formClassName: "w-full max-w-md",
    closeOnSubmit: false,
  };

  return (
    <div className="w-full max-w-md">
      <SchemaForm config={formConfig} />
      <p className="inline-block mt-4 text-input-placeholder">
        Forgot your password?{" "}
        <Link
          className="text-foreground text-md hover:underline hover:underline-offset-4"
          to={resetPasswordUrl}>
          Reset Password
        </Link>
      </p>
    </div>
  );
};
