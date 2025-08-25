import { type FormConfig, FormFieldType } from "@lumeweb/portal-framework-ui";

import schema from "./createApiKey.schema";

export default function createApiKeyForm(): FormConfig {
  return {
    action: "create",
    actionButtonsLayout: "horizontal",
    fields: [
      {
        description:
          "Give your API key a descriptive name to help you identify its purpose",
        label: "Key Name",
        name: "name",
        placeholder: "e.g., Production API, Development Testing",
        type: FormFieldType.TEXT,
      },
    ],
    refine: true,
    resource: "api-keys",
    successNotification: () => ({
      description: `The API key has been created.`,
      message: "API Key Created",
      type: "success",
    }),
    validationSchema: schema,
  };
}
