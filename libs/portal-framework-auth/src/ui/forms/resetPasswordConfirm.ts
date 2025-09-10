import {
  ActionItemType,
  type FormConfig,
  FormFieldType,
} from "@lumeweb/portal-framework-ui";

import schema from "./resetPasswordConfirm.schema";

export const getResetPasswordConfirmForm = (
  mutate: (values: { email: string; password: string; token: string }) => void,
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
        autocomplete: "username",
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
          autoComplete: "off",
          readOnly: true,
        },
        label: "Reset Token",
        name: "token",
        required: true,
        type: FormFieldType.PASSWORD,
      },
      {
        autocomplete: "new-password",
        label: "New Password",
        name: "password",
        required: true,
        type: FormFieldType.PASSWORD,
      },
      {
        autocomplete: "new-password",
        label: "Confirm New Password",
        name: "confirmPassword",
        required: true,
        type: FormFieldType.PASSWORD,
      },
    ],
    footerClassName: "",
    layout: "vertical",
    onSubmit: (values) => {
      // Remove confirmPassword before submitting
      const { confirmPassword, ...submitValues } = values;
      mutate(submitValues);
    },
    validationSchema: schema,
  };
};
