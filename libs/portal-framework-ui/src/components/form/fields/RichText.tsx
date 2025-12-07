import React from "react";

import { Editor as BaseEditor, ToolbarOption } from "@/components/editor";

import { registerFormComponent } from ".";
import { FormFieldType } from "@/components";
import { FormComponentProps } from "./types";

interface RichTextProps extends FormComponentProps {
  autocomplete?: string;
  enablePreview?: boolean;
  toolbarOptions?: ToolbarOption[];
}

export const RichText = (
  {
    ref,
    autocomplete,
    enablePreview,
    onChange,
    placeholder,
    required,
    toolbarOptions,
    value
  }: RichTextProps & {
    ref: React.RefObject<HTMLDivElement>;
  }
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
      {...(autocomplete ? { autoComplete: autocomplete } : {})}
    />
  );
};
RichText.displayName = "MarkdownEditor";

export function registerRichText() {
  registerFormComponent(FormFieldType.RICH_TEXT, RichText);
}
