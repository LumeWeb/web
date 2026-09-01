import { SchemaForm, useResetPasswordUrl } from "@lumeweb/portal-framework-ui";
import { useLogin } from "@refinedev/core";
import React from "react";
import { Link } from "react-router";

import type { AuthFormRequest } from "@/dataProviders/auth";
import { isAbsoluteRedirect } from "@/dataProviders/auth";
import { useSafeRedirectTo } from "@/hooks/useSafeRedirectTo";
import { getLoginFormConfig } from "../../forms/login";

export interface LoginParams {
  to: string;
}

export const LoginForm = () => {
  const { mutate: login } = useLogin<AuthFormRequest>();
  const resetPasswordUrl = useResetPasswordUrl();
  const redirectTo = useSafeRedirectTo();

  const onSubmit = async (data: any) => {
    login(
      {
        email: data.email,
        password: data.password,
        redirectTo: redirectTo ?? "/dashboard",
        remember: data.remember ?? false,
      },
      {
        onSuccess: (result) => {
          if (result.success && redirectTo && isAbsoluteRedirect(redirectTo)) {
            window.location.replace(redirectTo);
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
