import {
  type FormConfig,
  FormFieldType,
  InlineAuthLinkBanner,
} from "@lumeweb/portal-framework-ui";

import { schema } from "./register.schema";

export const getRegisterForm = (
  onSubmit: (values: any) => Promise<void>,
): FormConfig => ({
  fields: [
    {
      className: "flex-1",
      inputClassName: "h-14",
      label: "First Name",
      name: "firstName",
      type: FormFieldType.TEXT,
    },
    {
      className: "flex-1",
      inputClassName: "h-14",
      label: "Last Name",
      name: "lastName",
      type: FormFieldType.TEXT,
    },
    {
      inputClassName: "h-14",
      label: "Email",
      name: "email",
      type: FormFieldType.EMAIL,
    },
    {
      inputClassName: "h-14",
      label: "Password",
      name: "password",
      type: FormFieldType.PASSWORD,
    },
    {
      inputClassName: "h-14",
      label: "Confirm Password",
      name: "confirmPassword",
      type: FormFieldType.PASSWORD,
    },
    {
      label: (
        <span className="text-sm">
          I agree to the
          <a
            className="text-foreground underline mx-1"
            href="/terms-of-service">
            Terms of Service
          </a>
          and
          <a className="text-foreground underline mx-1" href="/privacy-policy">
            Privacy Policy
          </a>
        </span>
      ),
      name: "termsOfService",
      type: FormFieldType.CHECKBOX,
    },
  ],
  formClassName: "w-full p-2 max-w-md space-y-4 mt-14 sm:bg-background",
  header: (
    <>
      <InlineAuthLinkBanner label="Already have an account?" to="/login" />
      <div className="mt-10">
        <h3 className=" block  sm:hidden text-2xl text-foreground mb-10">
          Create a New Account
        </h3>
      </div>
    </>
  ),
  layout: "vertical",
  onSubmit: onSubmit,
  submitLabel: "Create Account",
  validationSchema: schema,
});
