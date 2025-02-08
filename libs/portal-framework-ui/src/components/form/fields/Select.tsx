import {
  Select as BaseSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lumeweb/portal-framework-ui-core";
import { cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import type { FormFieldOption } from "../";

import { registerFormComponent } from ".";
import { FormFieldType } from "../";

export const Select = React.forwardRef<
  HTMLButtonElement,
  {
    [key: string]: any;
    className?: string;
    label?: string;
    options: FormFieldOption[];
    placeholder?: string;
  }
>(
  (
    {
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
        {...props}>
        <SelectTrigger
          className={cn(
            "w-full h-14 border-none bg-modal-input text-foreground placeholder:text-foreground/50",
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
