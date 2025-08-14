import { cn, Input as BaseInput } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { registerFormComponent } from ".";
import { FormFieldType } from "../";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  inputClassName?: string; // Use inputClassName for the actual input element
  label?: string;
  placeholder?: string;
  // onChange is included via React.InputHTMLAttributes
  // value is included via React.InputHTMLAttributes
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ inputClassName, onChange, placeholder, type, value, ...props }, ref) => {
    return (
      <BaseInput
        className={cn("border-none bg-input h-14", inputClassName)}
        onChange={onChange}
        placeholder={placeholder}
        ref={ref}
        type={type}
        value={value ?? ""} // Use value prop directly, default to empty string
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export function registerInput() {
  registerFormComponent(FormFieldType.TEXT, Input);
  registerFormComponent(FormFieldType.PASSWORD, Input);
}
