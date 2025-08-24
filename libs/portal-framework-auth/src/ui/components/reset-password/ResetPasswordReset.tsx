import { SchemaForm } from "@lumeweb/portal-framework-ui";
import { useForgotPassword } from "@refinedev/core";
import React from "react";

import { ForgotPasswordRequest } from "../../../dataProviders/auth";
import { getResetPasswordForm } from "../../forms/resetPassword";

function ResetPasswordForm() {
  const forgotPassword = useForgotPassword<ForgotPasswordRequest>();

  return (
    <>
      <div className="mb-12 space-y-2">
        <h2 className="text-3xl font-bold">Reset your password</h2>
      </div>
      <SchemaForm config={getResetPasswordForm(forgotPassword.mutate)} />
    </>
  );
}

export default ResetPasswordForm;
