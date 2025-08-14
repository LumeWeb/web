import { DialogConfig } from "@lumeweb/portal-framework-ui";
import updatePasswordForm from "@/ui/forms/updatePassword";
import { z } from "zod";
import schema from "@/ui/forms/updatePassword.schema";

type FormValues = z.infer<typeof schema>;

export function updatePasswordDialogConfig(
  updatePasswordHook: any,
): DialogConfig<FormValues> {
  return {
    type: "form",
    title: "Change Password",
    formConfig: updatePasswordForm(),
    onSubmit: (req) => {
      return updatePasswordHook({
        currentPassword: req.current_password,
        password: req.new_password,
      });
    },
    onSuccess: () => void 0,
  };
}
