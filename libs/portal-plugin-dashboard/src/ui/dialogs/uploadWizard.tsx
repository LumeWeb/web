import { DialogType, WizardDialogConfig } from "@lumeweb/portal-framework-ui";
import { createActionHelpers } from "@lumeweb/portal-framework-ui";

import type { UIServiceConfig } from "@/types/upload";
import type { UseUploadManagerReturn } from "@/ui/hooks/useUploadManager";

import { uploadWizardForm } from "@/ui/forms/uploadWizard";

export function uploadWizardDialogConfig(
  services: UIServiceConfig[],
  uploadManager: UseUploadManagerReturn,
  onComplete?: () => void,
  onCancel?: () => void,
): WizardDialogConfig {
  // Determine if we have services available
  const hasServices = services && services.length > 0;

  // Create action helpers
  const { cancel, done } = createActionHelpers();

  return {
    // When no services available, provide a close action button
    ...(!hasServices && { 
      actionButtons: [cancel(onCancel, "Close")]
    }),
    formConfig: uploadWizardForm(services, uploadManager),
    onError: onCancel,
    onSubmit: async (data) => {
      return { success: true };
    },
    onSuccess: onComplete,
    preventCloseOnOutsideClick: true,
    size: "6xl",
    title: "Upload Files",
    type: DialogType.WIZARD_FORM,
  };
}
