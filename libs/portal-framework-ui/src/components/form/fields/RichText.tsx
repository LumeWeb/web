import { Editor as BaseEditor, ToolbarOption } from "@/components/editor";
import React, { forwardRef } from "react";

import { registerFormComponent } from ".";
import { FormFieldType } from "../";
import { FormComponentProps } from "./types";

interface RichTextProps extends FormComponentProps {
  enablePreview?: boolean;
  toolbarOptions?: ToolbarOption[];
}

export const RichText = forwardRef<HTMLDivElement, RichTextProps>(
  (
    { enablePreview, onChange, placeholder, required, toolbarOptions, value },
    ref,
  ) => {
    return (
      <BaseEditor
        enablePreview={enablePreview}
        onChange={onChange}
        placeholder={placeholder}
        ref={ref}
        required={required}
        toolbarOptions={toolbarOptions}
        value={value}
      />
    );
  },
);
RichText.displayName = "MarkdownEditor";

export function registerRichText() {
  registerFormComponent(FormFieldType.RICH_TEXT, RichText);
}
