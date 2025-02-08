import { Label, Switch as BaseSwitch } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { registerFormComponent } from ".";
import { FormFieldType } from "../";

interface SwitchProps {
  disabled?: boolean;
  label?: string;
  name: string;
  onBlur?: () => void;
  onChange?: (checked: boolean) => void;
  value?: boolean;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ label, ...props }, ref) => {
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
        />
        {label && (
          <Label className="text-foreground" htmlFor={props.name}>
            {label}
          </Label>
        )}
      </>
    );
  },
);
Switch.displayName = "Switch";

export function registerSwitch() {
  registerFormComponent(FormFieldType.SWITCH, Switch, { handlesLabel: true });
}
