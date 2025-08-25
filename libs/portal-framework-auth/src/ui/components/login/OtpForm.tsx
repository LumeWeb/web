import { SchemaForm, withTheme } from "@lumeweb/portal-framework-ui";
import { useResetPasswordUrl } from "@lumeweb/portal-framework-ui";
import {
  useGo,
  useIsAuthenticated,
  useLogin,
  useParsed,
} from "@refinedev/core";
import { useEffect } from "react";

import { AuthPage } from "@/ui/components/common/AuthPage";
import { AuthPageTitle } from "@/ui/components/common/AuthPageTitle";

import { getOtpForm } from "../../forms/otp";

export interface OtpParams {
  to?: string;
}

function OtpForm(): JSX.Element {
  const { data: authData, isLoading: isAuthLoading } = useIsAuthenticated();
  const go = useGo();
  const parsed = useParsed<OtpParams>();
  const login = useLogin();
  const resetPasswordUrl = useResetPasswordUrl();

  useEffect(() => {
    if (!isAuthLoading && authData?.authenticated) {
      go({ to: parsed.params?.to, type: "push" });
    }
  }, [isAuthLoading, authData, parsed.params?.to, go]);

  const otpFormConfig = getOtpForm(
    (values) => login.mutate({ ...values, redirectTo: parsed.params?.to }),
    parsed.params?.to,
  );

  return (
    <AuthPage
      beforeLink={<AuthPageTitle>Two-Factor Authentication</AuthPageTitle>}
      linkLabel="Forgot your password?"
      linkText="Reset password →"
      linkUrl={resetPasswordUrl}
      variant="login">
      <SchemaForm config={otpFormConfig} />
    </AuthPage>
  );
}

export default withTheme(OtpForm);
