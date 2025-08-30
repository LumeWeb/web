import type { ComponentType, ReactNode } from "react";

import {
  Checkbox as BaseCheckbox,
  cn,
  Label,
} from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { registerFormComponent } from ".";
import { FormFieldType } from "../"; // Use barrel export

interface CheckboxProps {
  disabled?: boolean;
  label?: ComponentType<any> | ReactNode | string;
  name: string;
  onBlur?: () => void;
  onChange?: (checked: boolean) => void;
  value?: boolean;
  autocomplete?: string;
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ label, autocomplete, ...props }, ref) => {
    return (
      <>
        <BaseCheckbox
          checked={props.value}
          disabled={props.disabled}
          id={props.name}
          name={props.name}
          onBlur={props.onBlur}
          onCheckedChange={props.onChange}
          ref={ref}
          autoComplete={autocomplete}
        />
        {label && (
          <Label
            className={cn("text-foreground", props.labelClassName)}
            htmlFor={props.name}>
            {typeof label === "function" ? React.createElement(label) : label}
          </Label>
        )}
      </>
    );
  },
);
Checkbox.displayName = "Checkbox";

export function registerCheckbox() {
  registerFormComponent(FormFieldType.CHECKBOX, Checkbox, {
    handlesLabel: true,
  });
}
