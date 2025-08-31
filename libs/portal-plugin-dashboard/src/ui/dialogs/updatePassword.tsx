import { DialogConfig } from "@lumeweb/portal-framework-ui";
import { z } from "zod";

import updatePasswordForm from "@/ui/forms/updatePassword";
import schema from "@/ui/forms/updatePassword.schema";

type FormValues = z.infer<typeof schema>;

export function updatePasswordDialogConfig(
  updatePasswordHook: any,
): DialogConfig<FormValues> {
  return {
    formConfig: updatePasswordForm(),
    onSubmit: (req) => {
      return updatePasswordHook({
        currentPassword: req.current_password,
        password: req.new_password,
      });
    },
    onSuccess: () => void 0,
    title: "Change Password",
    type: "form",
  };
}
