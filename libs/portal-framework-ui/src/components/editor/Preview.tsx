import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes } from "@lexical/html";
import DOMPurify from "dompurify";

export const Preview = function () {
  const [editor] = useLexicalComposerContext();

  return (
    <div
      className="p-4 min-h-[150px] whitespace-pre-wrap text-foreground"
      dangerouslySetInnerHTML={{
        __html: editor.read(() =>
          DOMPurify.sanitize($generateHtmlFromNodes(editor)),
        ),
      }}
    />
  );
};
