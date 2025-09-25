import {
  Select as BaseSelect,
  cn,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lumeweb/portal-framework-ui-core";
import React from "react";

import type { FormFieldOption } from "@/components";

import { registerFormComponent } from ".";
import { FormFieldType } from "@/components";

export const Select = React.forwardRef<
  HTMLButtonElement,
  {
    [key: string]: any;
    autocomplete?: string;
    className?: string;
    label?: string;
    options: FormFieldOption[];
    placeholder?: string;
  }
>(
  (
    {
      autocomplete,
      inputClassName,
      onChange,
      options,
      placeholder = "Select...",
      required,
      value,
      ...props
    },
    ref,
  ) => {
    return (
      <BaseSelect
        onValueChange={onChange}
        required={required}
        value={value || ""}
        {...(autocomplete ? { autoComplete: autocomplete } : {})}
        {...props}>
        <SelectTrigger
          className={cn(
            "bg-modal-input text-foreground placeholder:text-foreground/50 h-14 w-full border-none",
            inputClassName,
            "data-[placeholder]:text-foreground/50",
          )}
          ref={ref}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {(options || []).map((option: FormFieldOption) => {
            const value = typeof option === "string" ? option : option.value;
            const label = typeof option === "string" ? option : option.label;
            return (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </BaseSelect>
    );
  },
);
Select.displayName = "Select";

export function registerSelect() {
  registerFormComponent(FormFieldType.SELECT, Select);
}
