import { SchemaForm, useResetPasswordUrl } from "@lumeweb/portal-framework-ui";
import { useLogin, useParsed } from "@refinedev/core";
import React from "react";
import { Link } from "react-router";

import type { AuthFormRequest } from "@/dataProviders/auth";
import { isAbsoluteRedirect, sanitizeRedirectUrl } from "@/dataProviders/auth";
import { getLoginFormConfig } from "../../forms/login";

export interface LoginParams {
  to: string;
}

export const LoginForm = () => {
  const { mutate: login } = useLogin<AuthFormRequest>();
  const parsed = useParsed<LoginParams>();
  const resetPasswordUrl = useResetPasswordUrl();

  const onSubmit = async (data: any) => {
    const redirectTo = sanitizeRedirectUrl(parsed.params?.to);

    login(
      {
        email: data.email,
        password: data.password,
        redirectTo,
        remember: data.remember ?? false,
      },
      {
        onSuccess: (result) => {
          if (result.success && isAbsoluteRedirect(redirectTo)) {
            window.location.href = redirectTo;
          }
        },
      },
    );
  };

  const formConfig = getLoginFormConfig(onSubmit);

  return (
    <>
      <SchemaForm config={formConfig} />
      <p className="text-input-placeholder mt-4 inline-block">
        Forgot your password?{" "}
        <Link
          className="text-foreground text-md hover:underline hover:underline-offset-4"
          to={resetPasswordUrl}>
          Reset Password
        </Link>
      </p>
    </>
  );
};
