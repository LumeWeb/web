import { Input } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { registerFormComponent } from ".";
import { FormFieldType } from "../";
interface FileInputProps {
  disabled?: boolean;
  label?: string;
  name: string;
  onBlur?: () => void;
  onChange?: (files: FileList | null) => void;
  ref?: React.Ref<HTMLInputElement>;
  value?: FileList;
}

export const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ ...props }, ref) => {
    return (
      <Input
        disabled={props.disabled}
        name={props.name}
        onBlur={props.onBlur}
        onChange={(e) => props.onChange?.(e.target.files)}
        ref={ref}
        type="file"
      />
    );
  },
);
FileInput.displayName = "FileInput";

export function registerFileInput() {
  registerFormComponent(FormFieldType.FILE, FileInput);
}
