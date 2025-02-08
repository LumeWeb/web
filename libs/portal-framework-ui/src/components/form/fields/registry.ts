import { ComponentType } from "react";

import type { FormComponentEntry, FormComponentProps } from "./types";

import { FormFieldType } from ".";

const componentRegistry = new Map<FormFieldType, FormComponentEntry>();

export function getFormComponent(type: FormFieldType) {
  return componentRegistry.get(type);
}

export function registerFormComponent(
  type: FormFieldType,
  component: ComponentType<FormComponentProps>,
  metadata?: { handlesLabel?: boolean },
) {
  componentRegistry.set(type, {
    component,
    handlesLabel: metadata?.handlesLabel,
  });
}
