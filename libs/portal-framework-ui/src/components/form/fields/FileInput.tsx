import { Input } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import type { AutocompleteToken } from "@/components";

import { registerFormComponent } from ".";
import { FormFieldType } from "@/components";

interface FileInputProps {
  autocomplete?: AutocompleteToken;
  disabled?: boolean;
  label?: string;
  name: string;
  onBlur?: () => void;
  onChange?: (files: FileList | null) => void;
  value?: FileList;
}

export const FileInput = (
  {
    ref,
    autocomplete,
    ...props
  }: FileInputProps & {
    ref: React.RefObject<HTMLInputElement>;
  }
) => {
  return (
    <Input
      autoComplete={autocomplete}
      disabled={props.disabled}
      name={props.name}
      onBlur={props.onBlur}
      onChange={(e) => props.onChange?.(e.target.files)}
      ref={ref}
      type="file"
    />
  );
};
FileInput.displayName = "FileInput";

export function registerFileInput() {
  registerFormComponent(FormFieldType.FILE, FileInput);
}
