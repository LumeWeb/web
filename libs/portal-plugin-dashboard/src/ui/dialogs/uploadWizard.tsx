import { DialogType, WizardDialogConfig } from "@lumeweb/portal-framework-ui";

import type { UIServiceConfig } from "@/types/upload";

import { uploadWizardForm } from "@/ui/forms/uploadWizard";

export function uploadWizardDialogConfig(
  services: UIServiceConfig[],
  onComplete?: () => void,
  onCancel?: () => void,
): WizardDialogConfig {
  // Determine if we have services available
  const hasServices = services && services.length > 0;

  return {
    actionButtons: hasServices ? undefined : [], // When no services, hide action buttons
    formConfig: uploadWizardForm(services),
    onError: onCancel,
    onSubmit: async (data) => {
      return { success: true };
    },
    onSuccess: onComplete,
    size: "6xl",
    title: "Upload Files",
    type: DialogType.WIZARD_FORM,
  };
}
