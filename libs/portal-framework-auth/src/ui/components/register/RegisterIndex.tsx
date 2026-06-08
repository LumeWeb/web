import {
  SchemaForm,
  useLoginUrl,
  withTheme,
} from "@lumeweb/portal-framework-ui";
import { useRegister } from "@refinedev/core";
import React from "react";
import { useSearchParams } from "react-router";

import { RegisterFormRequest } from "@/dataProviders/auth";
import { useRedirectIfAuthenticated } from "@/hooks/useRedirectIfAuthenticated";
import { AuthPage } from "@/ui/components/common/AuthPage";
import { AuthPageTitle } from "@/ui/components/common/AuthPageTitle";
import { getRegisterForm } from "@/ui/forms/register";

function RegisterIndex() {
  const register = useRegister<RegisterFormRequest>();
  const loginUrl = useLoginUrl();
  const [searchParams] = useSearchParams();

  const to = searchParams.get("to");
  const loginUrlWithTo = to
    ? `${loginUrl}?to=${encodeURIComponent(to)}`
    : loginUrl;

  useRedirectIfAuthenticated("/dashboard", to);

  const onSubmit = async (values: any) => {
    await register.mutateAsync({
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      password: values.password,
      redirectTo: to ?? undefined,
    });
  };

  const finalRegisterFormConfig = getRegisterForm(onSubmit);

  return (
    <AuthPage
      beforeLink={<AuthPageTitle>All Roads Lead to Lume 🎉</AuthPageTitle>}
      linkLabel="Already have an account?"
      linkText="Login here →"
      linkUrl={loginUrlWithTo}
      variant="register">
      <SchemaForm config={finalRegisterFormConfig} />
    </AuthPage>
  );
}

export default withTheme(RegisterIndex);
