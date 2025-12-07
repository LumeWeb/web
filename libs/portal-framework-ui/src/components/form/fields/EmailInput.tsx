import { Input } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { registerFormComponent } from ".";
import { FormFieldType } from "@/components";

interface EmailInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  autocomplete?: string;
  className?: string;
  inputClassName?: string;
  label?: string;
  placeholder?: string;
}

export const EmailInput = (
  {
    ref,
    autocomplete,
    ...props
  }: EmailInputProps & {
    ref: React.RefObject<HTMLInputElement>;
  }
) => {
  return (
    <Input autoComplete={autocomplete} ref={ref} type="email" {...props} />
  );
};
EmailInput.displayName = "EmailInput";

export function registerEmailInput() {
  registerFormComponent(FormFieldType.EMAIL, EmailInput);
}
