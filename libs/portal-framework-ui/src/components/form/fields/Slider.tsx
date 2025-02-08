import { Slider as BaseSlider } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { registerFormComponent } from ".";
import { FormFieldType } from "../";

interface SliderProps {
  className?: string;
  disabled?: boolean;
  label?: string;
  max?: number;
  min?: number;
  name: string;
  onBlur?: () => void;
  onChange?: (value: number) => void;
  step?: number;
  value?: number;
}

export const Slider = React.forwardRef<HTMLSpanElement, SliderProps>(
  ({ max = 100, min = 0, onChange, step = 1, value, ...props }, ref) => {
    return (
      <BaseSlider
        disabled={props.disabled}
        max={max}
        min={min}
        onBlur={props.onBlur}
        onValueChange={(vals) => onChange?.(vals[0])}
        ref={ref}
        step={step}
        value={[value || min]}
      />
    );
  },
);
Slider.displayName = "Slider";

export function registerSlider() {
  registerFormComponent(FormFieldType.SLIDER, Slider);
}
