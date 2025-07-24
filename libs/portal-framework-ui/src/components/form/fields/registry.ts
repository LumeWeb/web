import { ComponentType } from "react";

import type { FormComponentEntry, FormComponentProps } from "./types";

import { FormFieldType } from ".";

const componentRegistry = new Map<FormFieldType | string, FormComponentEntry>();

export function getFormComponent(type: FormFieldType | string) {
  return componentRegistry.get(type);
}

export function registerFormComponent(
  type: FormFieldType | string,
  component: ComponentType<FormComponentProps>,
  metadata?: { handlesLabel?: boolean },
) {
  componentRegistry.set(type, {
    component,
    handlesLabel: metadata?.handlesLabel,
  });
}
