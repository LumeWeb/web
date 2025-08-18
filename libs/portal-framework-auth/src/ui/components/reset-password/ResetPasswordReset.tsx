import { SchemaForm } from "@lumeweb/portal-framework-ui";
import { useForgotPassword } from "@refinedev/core";
import React from "react";
import { Link } from "react-router";

import { ForgotPasswordRequest } from "../../../dataProviders/auth";
import { getResetPasswordForm } from "../../forms/resetPassword";

function ResetPasswordForm() {
  const forgotPassword = useForgotPassword<ForgotPasswordRequest>();

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
      <SchemaForm config={getResetPasswordForm(forgotPassword.mutate)} />
    </div>
  );
}

export default ResetPasswordForm;
