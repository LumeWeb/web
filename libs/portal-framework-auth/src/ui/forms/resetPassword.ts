import { type FormConfig, FormFieldType } from "@lumeweb/portal-framework-ui";
import { ActionItemType } from "@lumeweb/portal-framework-ui";

import { schema } from "./resetPassword.schema";

export const getResetPasswordForm = (
  mutate: (values: { email: string }) => void,
): FormConfig => {
  return {
    actionButtons: [
      {
        label: "Reset Password",
        type: ActionItemType.SUBMIT,
      },
    ],
    fields: [
      {
        label: "Email Address",
        name: "email",
        required: true,
        type: FormFieldType.EMAIL,
      },
    ],
    footerClassName: "",
    layout: "vertical",
    onSubmit: (values) => mutate(values),
    validationSchema: schema,
  };
};
