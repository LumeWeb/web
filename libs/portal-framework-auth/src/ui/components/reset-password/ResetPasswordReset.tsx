import { SchemaForm } from "@lumeweb/portal-framework-ui";
import { useForgotPassword } from "@refinedev/core";
import React from "react";

import { ForgotPasswordRequest } from "../../../dataProviders/auth";
import { getResetPasswordForm } from "../../forms/resetPassword";

function ResetPasswordForm() {
  const forgotPassword = useForgotPassword<ForgotPasswordRequest>();

  return <SchemaForm config={getResetPasswordForm(forgotPassword.mutate)} />;
}

export default ResetPasswordForm;
