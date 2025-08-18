import {
  RadioGroup as BaseRadioGroup,
  RadioGroupItem,
} from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { registerFormComponent } from ".";
import { FormFieldType } from "../";

interface RadioGroupProps {
  disabled?: boolean;
  label?: string;
  labelClassName?: string;
  name: string;
  onBlur?: () => void;
  onChange?: (value: string) => void;
  options: string[];
  value?: string;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ options, ...props }, ref) => {
    return (
      <BaseRadioGroup
        disabled={props.disabled}
        name={props.name}
        onBlur={props.onBlur}
        onValueChange={props.onChange}
        ref={ref}
        value={props.value}>
        {options.map((option) => (
          <div className="radio-option" key={option}>
            <RadioGroupItem id={`${props.name}-${slugify(option)}`} value={option} />
            <label className={props.labelClassName} htmlFor={`${props.name}-${slugify(option)}`}>
              {option}
            </label>
          </div>
        ))}
      </BaseRadioGroup>
    );
  },
);
RadioGroup.displayName = "RadioGroup";

export function registerRadioGroup() {
  registerFormComponent(FormFieldType.RADIO, RadioGroup);
}
