import {
  Switch as BaseSwitch,
  cn,
  Label,
} from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { registerFormComponent } from ".";
import { FormFieldType } from "@/components";

interface SwitchProps {
  autocomplete?: string;
  disabled?: boolean;
  label?: string;
  labelClassName?: string;
  name: string;
  onBlur?: () => void;
  onChange?: (checked: boolean) => void;
  value?: boolean;
}

export const Switch = (
  {
    ref,
    autocomplete,
    label,
    ...props
  }: SwitchProps & {
    ref: React.RefObject<HTMLButtonElement>;
  }
) => {
  return (
    <>
      <BaseSwitch
        checked={props.value}
        disabled={props.disabled}
        id={props.name}
        name={props.name}
        onBlur={props.onBlur}
        onCheckedChange={props.onChange}
        ref={ref}
        {...(autocomplete ? { autoComplete: autocomplete } : {})}
      />
      {label && (
        <Label
          className={cn("text-foreground", props.labelClassName)}
          htmlFor={props.name}>
          {label}
        </Label>
      )}
    </>
  );
};
Switch.displayName = "Switch";

export function registerSwitch() {
  registerFormComponent(FormFieldType.SWITCH, Switch, { handlesLabel: true });
}
