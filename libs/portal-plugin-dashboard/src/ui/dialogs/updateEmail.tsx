import { DialogConfig, DialogType } from "@lumeweb/portal-framework-ui";
import { UseCustomMutationReturnType } from "@refinedev/core";
import { z } from "zod";

import updateEmailForm from "@/ui/forms/updateEmail";
import schema from "@/ui/forms/updateEmail.schema";

type FormValues = z.infer<typeof schema>;

export function updateEmailDialogConfig(
  updateEmailHook: UseCustomMutationReturnType<FormValues, any>,
  refetch?: () => any,
): DialogConfig<FormValues> {
  let onSuccess = async () => {};

  if (refetch) {
    onSuccess = async () => {
      return refetch();
    };
  }

  return {
    formConfig: updateEmailForm(),
    onSubmit: (req) => {
      return updateEmailHook.mutateAsync({
        dataProviderName: "account",
        errorNotification: (error) => {
          return {
            description:
              error?.message || "Please check your password and try again",
            message: "Failed to Update Email",
            type: "error",
          };
        },
        method: "post",
        successNotification: () => {
          return {
            description: "Your email address has been changed",
            message: "Email Updated Successfully",
            type: "success",
          };
        },
        url: "/account/update-email",
        values: {
          email: req.email,
          password: req.password,
        },
      });
    },
    onSuccess,
    title: "Change Email",
    type: DialogType.FORM,
  };
}
