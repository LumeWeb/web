import { SchemaForm, withTheme } from "@lumeweb/portal-framework-ui";
import {
  useGo,
  useIsAuthenticated,
  useLogin,
  useParsed,
} from "@refinedev/core";
import { useEffect } from "react";

import { getOtpForm } from "../../forms/otp";

export interface OtpParams {
  to?: string;
}

function OtpForm(): JSX.Element {
  const { data: authData, isLoading: isAuthLoading } = useIsAuthenticated();
  const go = useGo();
  const parsed = useParsed<OtpParams>();
  const login = useLogin();

  useEffect(() => {
    if (!isAuthLoading && authData?.authenticated) {
      go({ to: parsed.params?.to, type: "push" });
    }
  }, [isAuthLoading, authData, parsed.params?.to, go]);

  const otpFormConfig = getOtpForm(
    (values) => login.mutate({ ...values, redirectTo: parsed.params?.to }),
    parsed.params?.to,
  );

  return <SchemaForm config={otpFormConfig} />;
}

export default withTheme(OtpForm);
