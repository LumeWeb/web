import { DatePicker as BaseDatePicker } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { registerFormComponent } from ".";
import { FormFieldType } from "../"; // Use barrel export
interface DatePickerProps {
  date?: Date;
  disabled?: boolean;
  label?: string;
  name: string;
  onBlur?: () => void;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  ({ ...props }, ref) => {
    return (
      <BaseDatePicker
        className="border-modal-input placeholder-modal-input placeholder:text-foreground/50 p-4"
        date={props.date}
        disabled={props.disabled}
        onBlur={props.onBlur}
        placeholder={props.placeholder}
        ref={ref}
        setDate={props.onChange}
      />
    );
  },
);
DatePicker.displayName = "DatePicker";

export function registerDatePicker() {
  registerFormComponent(FormFieldType.DATE, DatePicker);
}
