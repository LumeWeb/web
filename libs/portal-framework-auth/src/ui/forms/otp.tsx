import {
  ActionItemType,
  FormConfig,
  FormFieldType,
} from "@lumeweb/portal-framework-ui";

import schema from "./otp.schema";

export const getOtpForm = (
  login: (values: { otp: string; redirectTo?: string }) => void,
  to?: string,
): FormConfig => {
  return {
    actionButtons: [
      {
        label: "Verify",
        type: ActionItemType.SUBMIT,
      },
    ],
    fields: [
      {
        label: "Confirmation Code",
        name: "otp",
        placeholder: "Enter 6-digit code",
        required: true,
        type: FormFieldType.TEXT,
      },
    ],
    header: (
      <div className="mb-8 block space-y-2">
        <h3 className="font-bold">Enter your authenticator code</h3>
        <p className="text-primary">
          Please enter the 6-digit verification code from your authenticator
          app.
        </p>
      </div>
    ),
    layout: "vertical",
    onSubmit: (values) => {
      login({
        otp: values.otp,
        redirectTo: to,
      });
    },
    validationSchema: schema,
  };
};
