import { DialogConfig } from "@lumeweb/portal-framework-ui";
import updateEmailForm from "@/ui/forms/updateEmail";
import {
  UseCustomMutationReturnType,
  UseLoadingOvertimeReturnType,
  BaseRecord,
} from "@refinedev/core";
import { z } from "zod";
import schema from "@/ui/forms/updateEmail.schema";

type FormValues = z.infer<typeof schema>;

export function updateEmailDialogConfig(
  updatePasswordHook: UseCustomMutationReturnType<FormValues, any>,
  refetch?: () => any,
): DialogConfig<FormValues> {
  let onSuccess = async () => {};

  if (refetch) {
    onSuccess = async () => {
      return refetch();
    };
  }

  return {
    type: "form",
    title: "Change Email",
    formConfig: updateEmailForm(),
    onSubmit: (req) => {
      return updatePasswordHook.mutateAsync({
        url: "/account/update-email",
        method: "post",
        dataProviderName: "account",
        values: {
          email: req.email,
          password: req.password,
        },
        successNotification: () => {
          return {
            message: "Email Updated Successfully",
            description: "Your email address has been changed",
            type: "success",
          };
        },
        errorNotification: (error) => {
          return {
            message: "Failed to Update Email",
            description:
              error?.message || "Please check your password and try again",
            type: "error",
          };
        },
      });
    },
    onSuccess,
  };
}
