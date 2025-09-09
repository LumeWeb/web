import { $generateHtmlFromNodes } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import DOMPurify from "dompurify";
import React from "react";

export const Preview = function () {
  const [editor] = useLexicalComposerContext();

  return (
    <div
      className="text-foreground min-h-[150px] whitespace-pre-wrap p-4"
      dangerouslySetInnerHTML={{
        __html: editor.read(() =>
          DOMPurify.sanitize($generateHtmlFromNodes(editor)),
        ),
      }}
    />
  );
};
