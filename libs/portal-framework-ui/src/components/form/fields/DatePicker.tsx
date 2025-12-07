import { DatePicker as BaseDatePicker } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { registerFormComponent } from ".";
import { FormFieldType } from "@/components"; // Use barrel export
interface DatePickerProps {
  autocomplete?: React.InputHTMLAttributes<HTMLInputElement>["autoComplete"];
  date?: Date;
  disabled?: boolean;
  label?: string;
  name: string;
  onBlur?: () => void;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

export const DatePicker = (
  {
    ref,
    autocomplete,
    ...props
  }: DatePickerProps & {
    ref: React.RefObject<HTMLDivElement>;
  }
) => {
  return (
    <BaseDatePicker
      className="border-modal-input placeholder-modal-input placeholder:text-foreground/50 p-4"
      date={props.date}
      disabled={props.disabled}
      onBlur={props.onBlur}
      placeholder={props.placeholder}
      ref={ref}
      setDate={props.onChange}
      {...(autocomplete ? { autoComplete: autocomplete } : {})}
    />
  );
};
DatePicker.displayName = "DatePicker";

export function registerDatePicker() {
  registerFormComponent(FormFieldType.DATE, DatePicker);
}
