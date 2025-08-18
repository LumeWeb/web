import type { z } from "zod";

import {
  ActionItemType,
  FormConfig,
  FormFieldType,
} from "@lumeweb/portal-framework-ui";

import { schema } from "./login.schema";

type LoginFormValues = z.infer<typeof schema>;

export const getLoginFormConfig = (
  login: (data: any) => void,
): FormConfig<LoginFormValues> => ({
  adapter: "rhf",
  closeOnSubmit: false,
  fields: [
    {
      inputClassName: "mt-4 bg-input border placeholder-input-placeholder",
      label: "Email",
      labelClassName: "font-semibold text-sm text-secondary-foreground",
      name: "email",
      required: true,
      type: FormFieldType.TEXT,
    },
    {
      inputClassName: "mt-4 bg-input border placeholder-input-placeholder",
      label: "Password",
      labelClassName: "font-semibold text-sm text-secondary-foreground",
      name: "password",
      required: true,
      type: FormFieldType.PASSWORD,
    },
    {
      itemClassName: "flex items-center space-x-2 text-foreground",
      label: "Remember Me",
      name: "remember",
      type: FormFieldType.CHECKBOX,
    },
  ],
  footer: [
    {
      component: () => <div className="w-full min-h-[32px] px-4 pb-3 pt-1" />,
      type: ActionItemType.CUSTOM_COMPONENT,
    },
    {
      className:
        "w-full h-14 px-4 py-2 bg-secondary text-foreground hover:bg-secondary/60",
      label: "Login",
      type: ActionItemType.SUBMIT,
    },
  ],
  footerClassName: false,
  // Update formClassName to match the target wrapper
  formClassName: "w-full max-w-md",
  onSubmit: (data) => {
    return login(data);
  },
  validationSchema: schema,
});
