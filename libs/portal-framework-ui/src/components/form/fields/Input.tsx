import { Input as BaseInput, cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { registerFormComponent } from ".";
import { FormFieldType } from "@/components";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  autocomplete?: string;
  className?: string;
  inputClassName?: string; // Use inputClassName for the actual input element
  label?: string;
  placeholder?: string;
  // onChange is included via React.InputHTMLAttributes
  // value is included via React.InputHTMLAttributes
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      autocomplete,
      autoComplete: htmlAutoComplete,
      inputClassName,
      onChange,
      placeholder,
      type,
      value,
      ...props
    },
    ref,
  ) => {
    return (
      <BaseInput
        autoComplete={autocomplete ?? htmlAutoComplete}
        className={cn("bg-input h-14 border-none", inputClassName)}
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
