import { type FormConfig, FormFieldType } from "@lumeweb/portal-framework-ui";
import { OTPDisableRequest } from "@lumeweb/portal-sdk";
import { CreateResponse } from "@refinedev/core";

import schema from "./disable2fa.schema";

export type InvalidateAuthHandler = () => Promise<void>;

export type OTPDisableHandler = (
  values: OTPDisableRequest,
) => Promise<CreateResponse<OTPDisableRequest>>;

export function disable2faForm(): FormConfig {
  return {
    actionButtonsLayout: "horizontal",
    fields: [
      {
        inputProps: {
          autoComplete: "current-password",
        },
        label: "Password",
        name: "password",
        placeholder: "Enter your password",
        required: true,
        type: FormFieldType.PASSWORD,
      },
    ],
    validationSchema: schema,
  };
}
