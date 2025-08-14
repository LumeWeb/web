import { DialogConfig } from "@lumeweb/portal-framework-ui";
import { OTPEnableHandler } from "@lumeweb/portal-framework-auth";

import { enable2faForm, InvalidateAuthHandler } from "@/ui/forms/enable2fa";

export function enable2faDialogConfig(
  otpHandler: OTPEnableHandler,
  invalidateAuth: InvalidateAuthHandler,
): DialogConfig<FormValues> {
  return {
    formConfig: enable2faForm(otpHandler, invalidateAuth),
    title: "Setup Two-Factor Authentication",
    type: "form",
  };
}
