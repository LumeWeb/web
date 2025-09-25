import { DialogConfig, DialogType, DialogTypes } from "@lumeweb/portal-framework-ui";

import {
  enable2faForm,
  FormValues,
  InvalidateAuthHandler,
  OTPEnableHandler,
} from "@/ui/forms/enable2fa";

export function enable2faDialogConfig(
  otpHandler: OTPEnableHandler,
  invalidateAuth: InvalidateAuthHandler,
): DialogConfig<FormValues> {
  return {
    formConfig: enable2faForm(otpHandler, invalidateAuth),
    title: "Setup Two-Factor Authentication",
    type: DialogTypes.FORM,
  };
}
