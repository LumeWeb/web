import {
  ActionItemType,
  FormConfig,
  FormFieldType,
} from "@lumeweb/portal-framework-ui";
import { Link } from "react-router";

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
    footer: [
      {
        component: () => (
          <Link
            className="text-primary-1 text-md hover:underline hover:underline-offset-4"
            to="/login">
            ← Back to Login
          </Link>
        ),
        type: ActionItemType.CUSTOM_COMPONENT,
      },
    ],
    formClassName: "w-full p-2 max-w-md mt-12 bg-background",
    header: (
      <div className="block !mb-8 space-y-2">
        <h2 className="text-3xl font-bold">Check your inbox</h2>
        <p className="text-input-placeholder">
          We will need the six digit confirmation code you received in your
          email in order to verify your account and get started. Didn't receive
          a code?{" "}
          <button
            className="text-md h-0 text-primary-1 hover:underline"
            type="button">
            Resend now →
          </button>
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
