import { DialogConfig, DialogType } from "@lumeweb/portal-framework-ui";
import { z } from "zod";

import createApiKeyForm from "@/ui/forms/createApiKey";
import schema from "@/ui/forms/createApiKey.schema";

type FormValues = z.infer<typeof schema>;

export function createApiKeyDialogConfig(
  onSuccess: (key: string) => void,
): DialogConfig<FormValues> {
  return {
    formConfig: createApiKeyForm(),
    onSuccess: (response) => {
      if (response?.token) {
        onSuccess(response.token);
      }
    },
    title: "Create New API Key",
    type: DialogType.FORM,
  };
}
