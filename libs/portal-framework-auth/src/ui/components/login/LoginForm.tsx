import { SchemaForm, useResetPasswordUrl } from "@lumeweb/portal-framework-ui";
import { useLogin, useParsed } from "@refinedev/core";
import React from "react";
import { Link } from "react-router";

import type { AuthFormRequest } from "@/dataProviders/auth";

import { getLoginFormConfig } from "../../forms/login";

export interface LoginParams {
  to: string;
}

export const LoginForm = () => {
  const { mutate: login } = useLogin<AuthFormRequest>();
  const parsed = useParsed<LoginParams>();
  const resetPasswordUrl = useResetPasswordUrl();

  const onSubmit = async (data: any) => {
    login({
      email: data.email,
      password: data.password,
      redirectTo: parsed.params?.to,
      remember: data.remember ?? false,
    });
  };

  const formConfig = getLoginFormConfig(onSubmit);

  return (
    <>
      <SchemaForm config={formConfig} />
      <p className="inline-block mt-4 text-input-placeholder">
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
