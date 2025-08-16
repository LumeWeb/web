import { DialogConfig } from "@lumeweb/portal-framework-ui";

import {
  disable2faForm,
  InvalidateAuthHandler,
  OTPDisableHandler,
} from "@/ui/forms/disable2fa";

export function disable2faDialogConfig(
  otpHandler: OTPDisableHandler,
  invalidateAuth: InvalidateAuthHandler,
): DialogConfig {
  return {
    formConfig: disable2faForm(),
    async onSubmit(data) {
      return otpHandler(data);
    },
    async onSuccess() {
      await invalidateAuth();
    },
    title: "Disable Two-Factor Authentication",
    type: "form",
  };
}
