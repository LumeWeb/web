import {
  SchemaForm,
  useResetPasswordUrl,
  withTheme,
} from "@lumeweb/portal-framework-ui";
import React from "react";

import { useBrand } from "@lumeweb/portal-framework-core";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
import { useSafeLogin } from "@/hooks/useSafeLogin";
import { useSafeRedirectTarget } from "@/hooks/useSafeRedirectTarget";
import { AuthPage } from "@/ui/components/common/AuthPage";
import { AuthPageTitle } from "@/ui/components/common/AuthPageTitle";

import { getOtpForm } from "../../forms/otp";

export interface OtpParams {
  to?: string;
}

function OtpForm(): React.JSX.Element {
  const { redirectTo } = useSafeRedirectTarget();
  const { mutate: login } = useSafeLogin();
  const resetPasswordUrl = useResetPasswordUrl();
  const brand = useBrand();

  useRedirectIfAuthenticated("/dashboard", redirectTo, "push");

  const otpFormConfig = getOtpForm(
    (values) =>
      // Destination after OTP validation = auth provider's sanitized
      // redirectTo (see useSafeLogin). If the provider answers
      // success + "/otp?to=…" (OTP required), the OTP step is followed — an
      // external `?to=` can never skip it.
      login({
        otp: values.otp,
        redirectTo: redirectTo ?? undefined,
      }),
    redirectTo ?? undefined,
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
