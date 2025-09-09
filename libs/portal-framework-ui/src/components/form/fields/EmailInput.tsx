import { Input } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { registerFormComponent } from ".";
import { FormFieldType } from "../";

interface EmailInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  autocomplete?: string;
  className?: string;
  inputClassName?: string;
  label?: string;
  placeholder?: string;
}

export const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  ({ autocomplete, ...props }, ref) => {
    return (
      <Input autoComplete={autocomplete} ref={ref} type="email" {...props} />
    );
  },
);
EmailInput.displayName = "EmailInput";

export function registerEmailInput() {
  registerFormComponent(FormFieldType.EMAIL, EmailInput);
}
