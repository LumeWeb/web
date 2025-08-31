import {
  ActionItemType,
  type FormConfig,
  FormFieldType,
  GroupOrder,
} from "@lumeweb/portal-framework-ui";

import { schema } from "./register.schema";

export const getRegisterForm = (
  onSubmit: (values: any) => Promise<void>,
): FormConfig => ({
  actionButtons: [
    {
      className: "w-full h-14",
      label: "Create Account",
      type: ActionItemType.SUBMIT,
    },
  ],
  fields: [
    {
      autocomplete: "given-name",
      className: "space-y-2",
      group: "name",
      inputClassName: "h-14",
      itemClassName: "flex-1",
      label: "First Name",
      name: "firstName",
      type: FormFieldType.TEXT,
    },
    {
      autocomplete: "family-name",
      className: "space-y-2",
      group: "name",
      inputClassName: "h-14",
      itemClassName: "flex-1",
      label: "Last Name",
      name: "lastName",
      type: FormFieldType.TEXT,
    },
    {
      autocomplete: "email",
      inputClassName: "h-14",
      label: "Email",
      name: "email",
      type: FormFieldType.EMAIL,
    },
    {
      autocomplete: "new-password",
      inputClassName: "h-14",
      label: "Password",
      name: "password",
      type: FormFieldType.PASSWORD,
    },
    {
      autocomplete: "new-password",
      inputClassName: "h-14",
      label: "Confirm Password",
      name: "confirmPassword",
      type: FormFieldType.PASSWORD,
    },
    {
      label: (
        <span className="pl-2 text-sm">
          I agree to the
          <a
            className="text-foreground mx-1 underline"
            href="/terms-of-service">
            Terms of Service
          </a>
          and
          <a className="text-foreground mx-1 underline" href="/privacy-policy">
            Privacy Policy
          </a>
        </span>
      ),
      name: "termsOfService",
      type: FormFieldType.CHECKBOX,
    },
  ],
  footerClassName: "",
  formClassName: "w-full m-auto",
  groupOrder: GroupOrder.GROUPS_FIRST,
  groups: [
    {
      className: "flex gap-4",
      id: "name",
    },
  ],
  layout: "vertical",
  onSubmit: onSubmit,
  validationSchema: schema,
});
