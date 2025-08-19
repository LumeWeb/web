import type { DialogConfig } from "@lumeweb/portal-framework-ui";
import type { HttpError, DeleteOneParams } from "@refinedev/core";
import type { UseMutationResult } from "@tanstack/react-query";

import { DATA_PROVIDER_NAME } from "@lumeweb/portal-framework-auth";

import deleteAccountForm from "@/ui/forms/deleteAccount";

export function deleteAccountDialogConfig(
  deleteMutation: UseMutationResult<void, HttpError, DeleteOneParams, unknown>,
  logout: () => Promise<void>,
  openDialog: (config: DialogConfig) => void,
): DialogConfig {
  return {
    formConfig: deleteAccountForm(),
    onSubmit: async () => {
      try {
        return await deleteMutation.mutateAsync({
          resource: DATA_PROVIDER_NAME,
          successNotification: false,
        });
      } catch (error) {
        console.error('Failed to delete account:', error);
        throw new Error('Failed to delete account. Please try again or contact support.');
      }
    },
    onSuccess: () => {
      openDialog({
        description:
          "Your account will be deleted within 48 hours. If this is an error, please contact support immediately.",
        onConfirm: () => logout(),
        title: "Account Deletion Scheduled",
        type: "alert",
        variant: "success",
      });
      return true;
    },
    title: "Delete Account",
    type: "form",
  };
}
