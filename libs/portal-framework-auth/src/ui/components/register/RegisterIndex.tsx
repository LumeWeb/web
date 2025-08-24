import { SchemaForm, useLoginUrl, withTheme } from "@lumeweb/portal-framework-ui";
import { useRegister } from "@refinedev/core";
import React from "react";

import { RegisterFormRequest } from "@/dataProviders/auth";
import { AuthPage } from "@/ui/components/common/AuthPage";
import { getRegisterForm } from "@/ui/forms/register";

function RegisterIndex() {
  const register = useRegister<RegisterFormRequest>();
  const loginUrl = useLoginUrl();

  const onSubmit = async (values: any) => {
    await register.mutateAsync({
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      password: values.password,
    });
  };

  const finalRegisterFormConfig = getRegisterForm(onSubmit, loginUrl);

  return (
    <AuthPage variant="register">
      <SchemaForm config={finalRegisterFormConfig} />
    </AuthPage>
  );
}

export default withTheme(RegisterIndex);
