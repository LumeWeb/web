import { SchemaForm } from "@lumeweb/portal-framework-ui";
import { Button } from "@lumeweb/portal-framework-ui-core";
import { useForgotPassword, useGo } from "@refinedev/core";
import React, { useState } from "react";
import { useSearchParams } from "react-router";

import { ForgotPasswordConfirmRequest } from "../../../dataProviders/auth";
import { getResetPasswordConfirmForm } from "../../forms/resetPasswordConfirm";

function ResetPasswordConfirm() {
  const go = useGo();
  const forgotPassword = useForgotPassword<ForgotPasswordConfirmRequest>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const handleSubmit = (values: {
    email: string;
    password: string;
    token: string;
  }) => {
    forgotPassword.mutate(values, {
      onSuccess: (result) => {
        if (result.success) {
          setIsSuccess(true);
        }
      },
    });
  };

  const handleGoToLogin = () => {
    go({ to: "/login" });
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center">
        <p className="mb-4 opacity-60">
          Your password has been reset successfully.
        </p>
        <Button onClick={handleGoToLogin}>Go to Login</Button>
      </div>
    );
  }

  return (
    <SchemaForm
      config={{
        ...getResetPasswordConfirmForm(handleSubmit),
        defaultValues: {
          email,
          token,
        },
      }}
    />
  );
}
export default ResetPasswordConfirm;
