import {
  Textarea as BaseTextarea,
  cn,
} from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { registerFormComponent } from ".";
import { FormFieldType } from "@/components";

export const Textarea = // Use inputClassName for the actual textarea element
(
  {
    ref,
    autocomplete,
    autoComplete: htmlAutoComplete,
    inputClassName,
    onChange,
    placeholder,
    value,
    ...props
  }
) => {
  return (
    <BaseTextarea
      autoComplete={autocomplete ?? htmlAutoComplete}
      className={cn(
        "border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
        inputClassName,
      )}
      onChange={onChange}
      placeholder={placeholder}
      ref={ref}
      value={value ?? ""} // Use value prop directly, default to empty string
      {...props}
    />
  );
};
Textarea.displayName = "Textarea";

export function registerTextarea() {
  registerFormComponent(FormFieldType.TEXTAREA, Textarea);
}
