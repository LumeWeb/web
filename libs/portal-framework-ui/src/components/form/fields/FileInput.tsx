import { Input } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { registerFormComponent } from ".";
import { FormFieldType } from "../";
import type { AutocompleteToken } from "../types";

interface FileInputProps {
  disabled?: boolean;
  label?: string;
  name: string;
  onBlur?: () => void;
  onChange?: (files: FileList | null) => void;
  value?: FileList;
  autocomplete?: AutocompleteToken;
}

export const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ autocomplete, ...props }, ref) => {
    return (
      <Input
        disabled={props.disabled}
        name={props.name}
        onBlur={props.onBlur}
        onChange={(e) => props.onChange?.(e.target.files)}
        ref={ref}
        type="file"
        autoComplete={autocomplete}
      />
    );
  },
);
FileInput.displayName = "FileInput";

export function registerFileInput() {
  registerFormComponent(FormFieldType.FILE, FileInput);
}
