import { Input } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { registerFormComponent } from ".";
import { FormFieldType } from "../";

interface EmailInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  inputClassName?: string;
  label?: string;
  placeholder?: string;
}

export const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  (props, ref) => {
    return <Input ref={ref} type="email" {...props} />;
  },
);
EmailInput.displayName = "EmailInput";

export function registerEmailInput() {
  registerFormComponent(FormFieldType.EMAIL, EmailInput);
}
