import { SchemaForm, useResetPasswordUrl } from "@lumeweb/portal-framework-ui";
import React from "react";
import { Link } from "react-router";

import { useSafeLogin } from "@/hooks/useSafeLogin";
import { useSafeRedirectTarget } from "@/hooks/useSafeRedirectTarget";
import { getLoginFormConfig } from "../../forms/login";

export interface LoginParams {
  to: string;
}

export const LoginForm = () => {
  const { mutate: login } = useSafeLogin();
  const { redirectTo } = useSafeRedirectTarget();
  const resetPasswordUrl = useResetPasswordUrl();

  const onSubmit = async (data: any) => {
    // `to` is read exactly once (URLSearchParams) and sanitized here; the
    // destination after login is decided only by the auth provider's
    // sanitized redirectTo (see useSafeLogin), never the raw query param.
    login({
      email: data.email,
      password: data.password,
      redirectTo: redirectTo ?? undefined,
      remember: data.remember ?? false,
    });
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
