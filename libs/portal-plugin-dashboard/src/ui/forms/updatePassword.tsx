import { type FormConfig, FormFieldType } from "@lumeweb/portal-framework-ui";

import schema from "./updatePassword.schema";

export default function updateEmailForm(): FormConfig {
  return {
    actionButtonsLayout: "horizontal",
    fields: [
      {
        label: "Current Password",
        name: "current_password",
        type: FormFieldType.PASSWORD,
      },
      {
        label: "New Password",
        name: "new_password",
        type: FormFieldType.PASSWORD,
      },
      {
        label: "Retype Password",
        name: "retype_password",
        type: FormFieldType.PASSWORD,
      },
    ],
    validationSchema: schema,
  };
}
