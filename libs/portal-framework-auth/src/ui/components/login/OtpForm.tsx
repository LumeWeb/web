import {
  SchemaForm,
  useResetPasswordUrl,
  withTheme,
} from "@lumeweb/portal-framework-ui";
import { useLogin } from "@refinedev/core";
import React from "react";

import { useBrand } from "@lumeweb/portal-framework-core";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
import { useSafeRedirectTo } from "@/hooks/useSafeRedirectTo";
import { isAbsoluteRedirect } from "@/dataProviders/auth";
import { AuthPage } from "@/ui/components/common/AuthPage";
import { AuthPageTitle } from "@/ui/components/common/AuthPageTitle";

import { getOtpForm } from "../../forms/otp";

export interface OtpParams {
  to?: string;
}

function OtpForm(): React.JSX.Element {
  const login = useLogin();
  const resetPasswordUrl = useResetPasswordUrl();
  const brand = useBrand();

  const redirectTo = useSafeRedirectTo();

  useRedirectIfAuthenticated("/dashboard", redirectTo, "push");

  const otpFormConfig = getOtpForm(
    (values) =>
      login.mutate(
        { ...values, redirectTo: redirectTo ?? "/dashboard" },
        {
          onSuccess: (result) => {
            if (result.success && redirectTo && isAbsoluteRedirect(redirectTo)) {
              window.location.replace(redirectTo);
            }
          },
        },
      ),
    redirectTo ?? "/dashboard",
  );

  return (
    <AuthPage
      beforeLink={<AuthPageTitle>Two-Factor Authentication</AuthPageTitle>}
      brand={brand}
      linkLabel="Forgot your password?"
      linkText="Reset password →"
      linkUrl={resetPasswordUrl}
      variant="login">
      <SchemaForm config={otpFormConfig} />
    </AuthPage>
  );
}

export default withTheme(OtpForm);
