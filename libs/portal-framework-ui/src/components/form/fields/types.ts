import type { ComponentType } from "react";

import { FormFieldOption } from "../types";

export enum FormFieldType {
  CHECKBOX = "checkbox",
  CUSTOM = "custom",
  DATE = "date",
  FILE = "file",
  PASSWORD = "password",
  RADIO = "radio",
  RICH_TEXT = "rich_text",
  SELECT = "select",
  SLIDER = "slider",
  SWITCH = "switch",
  TEXT = "text",
  TEXTAREA = "textarea",
}

export interface FormComponentEntry {
  component: ComponentType<FormComponentProps>;
  handlesLabel?: boolean;
}

export interface FormComponentProps {
  [key: string]: any;
  className?: string;
  inputClassName?: string;
  label?: string;
  options?: FormFieldOption[];
  placeholder?: string;
  required?: boolean;
}
