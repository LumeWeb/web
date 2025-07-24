import { type FormConfig, FormFieldType } from "@lumeweb/portal-framework-ui";
import schema from "./updateEmail.schema";

export default function updateEmailForm(): FormConfig {
  return {
    actionButtonsLayout: "horizontal",
    validationSchema: schema,
    fields: [
      {
        label: "New Email Address",
        name: "email",
        type: FormFieldType.TEXT,
      },
      {
        label: "Password",
        name: "password",
        type: FormFieldType.PASSWORD,
      },
      {
        label: "Retype Password",
        name: "password_confirm",
        type: FormFieldType.PASSWORD,
      },
    ],
  };
}
