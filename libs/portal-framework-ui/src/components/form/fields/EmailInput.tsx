import { Input } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { registerFormComponent } from ".";
import { FormFieldType } from "../";

interface EmailInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  inputClassName?: string;
  label?: string;
  placeholder?: string;
  autocomplete?: string;
}

export const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  ({ autocomplete, ...props }, ref) => {
    return <Input ref={ref} type="email" autoComplete={autocomplete} {...props} />;
  },
);
EmailInput.displayName = "EmailInput";

export function registerEmailInput() {
  registerFormComponent(FormFieldType.EMAIL, EmailInput);
}
