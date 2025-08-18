import { SchemaForm } from "@lumeweb/portal-framework-ui";
import { Button } from "@lumeweb/portal-framework-ui-core";
import { useForgotPassword, useGo } from "@refinedev/core";
import React, { useState } from "react";
import { Link, useSearchParams } from "react-router";

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
        <p className="opacity-60 mb-4">
          Your password has been reset successfully.
        </p>
        <Button onClick={handleGoToLogin}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 sm:p-10 space-y-4 mt-12">
      <p className="text-input-placeholder w-full text-left mb-10">
        <Link
          className="text-foreground text-md hover:underline hover:underline-offset-4"
          to="/login">
          ← Back to Login
        </Link>
      </p>
      <div className="!mb-12 space-y-2">
        <h2 className="text-3xl font-bold">Reset your password</h2>
      </div>
      <SchemaForm
        config={{
          ...getResetPasswordConfirmForm(handleSubmit),
          defaultValues: {
            email,
            token,
          },
        }}
      />
    </div>
  );
}
export default ResetPasswordConfirm;
