import { type FormConfig, FormFieldType } from "@lumeweb/portal-framework-ui";
import { ActionItemType } from "@lumeweb/portal-framework-ui";

import schema from "./resetPasswordConfirm.schema";

export const getResetPasswordConfirmForm = (
  mutate: (values: { email: string; password: string; token: string }) => void,
): FormConfig => {
  return {
    footerClassName: "",
    actionButtons: [
      {
        label: "Reset Password",
        type: ActionItemType.SUBMIT,
      },
    ],
    fields: [
      {
        inputProps: {
          readOnly: true,
        },
        label: "Email Address",
        name: "email",
        required: true,
        type: FormFieldType.TEXT,
      },
      {
        inputProps: {
          readOnly: true,
          autoComplete: "off",
        },
        label: "Reset Token",
        name: "token",
        required: true,
        type: FormFieldType.PASSWORD,
      },
      {
        label: "New Password",
        name: "password",
        required: true,
        type: FormFieldType.PASSWORD,
      },
      {
        label: "Confirm New Password",
        name: "confirmPassword",
        required: true,
        type: FormFieldType.PASSWORD,
      },
    ],
    layout: "vertical",
    onSubmit: (values) => {
      // Remove confirmPassword before submitting
      const { confirmPassword, ...submitValues } = values;
      mutate(submitValues);
    },
    validationSchema: schema,
  };
};
