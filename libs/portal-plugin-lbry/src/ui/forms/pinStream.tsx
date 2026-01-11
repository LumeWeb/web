import { type FormConfig, FormFieldType } from "@lumeweb/portal-framework-ui";

import schema from "./pinStream.schema";

export function pinStreamForm(): FormConfig {
  return {
    action: "create",
    actionButtonsLayout: "horizontal",
    fields: [
      {
        label: "SD Hash",
        name: "sd_hash",
        placeholder: "Enter SD hash (e.g., 1234567890abcdef...)",
        required: true,
        type: FormFieldType.TEXT,
      },
    ],
    refine: true,
    resource: "lbry/streams",
    successNotification: () => ({
      description: "The stream has been pinned to your account.",
      message: "Stream Pinned",
      type: "success",
    }),
    validationSchema: schema,
  };
}
