import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { $getRoot } from "lexical";
import React, { forwardRef, useState } from "react";

import { Preview } from "./Preview";
import { ToolbarProvider } from "./ToolbarContext";
import { ToolbarPlugin } from "./ToolbarPlugin";

export interface EditorProps {
  enablePreview?: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  toolbarOptions?: ToolbarOption[];
  value?: string;
}

export type ToolbarOption =
  | "blockTypes"
  | "bold"
  | "clear"
  | "italic"
  | "redo"
  | "strikethrough"
  | "subscript"
  | "superscript"
  | "underline"
  | "undo";

export const Editor = forwardRef<HTMLDivElement, EditorProps>(
  ({ enablePreview, onChange, placeholder, toolbarOptions, value }, ref) => {
    const [isPreview, setIsPreview] = useState(false);

    const handleChange = React.useCallback(
      (editorState) => {
        const content = editorState.read(() => $getRoot().getTextContent());
        onChange?.(content);
      },
      [onChange],
    );

    const initialConfig = React.useMemo(
      () =>
        ({
          editable: !isPreview,
          editorState: () => {
            $convertFromMarkdownString(value ?? "", TRANSFORMERS);
          },
          namespace: "MarkdownEditor",
          nodes: [
            HorizontalRuleNode,
            CodeNode,
            LinkNode,
            ListNode,
            ListItemNode,
            HeadingNode,
            QuoteNode,
          ],
          onError: (error: Error) => {
            throw error;
          },
          theme: {
            heading: {
              h1: "text-2xl font-bold",
              h2: "text-xl font-bold",
              h3: "text-lg font-semibold",
              h4: "text-base font-semibold",
              h5: "text-sm font-semibold",
              h6: "text-xs font-semibold",
            },
            link: "cursor-pointer",
            root: "p-3 border rounded-md bg-modal-input text-foreground",
            text: {
              bold: "font-semibold",
              italic: "italic",
              underline: "underline",
            },
          },
        }) satisfies InitialConfigType,
      [isPreview, value],
    );

    return (
      <div className="bg-modal-input text-foreground rounded-md border">
        <LexicalComposer initialConfig={initialConfig}>
          <ToolbarProvider>
            <div className="border-border flex items-center justify-between gap-1 border-b p-1">
              <ToolbarPlugin
                isPreview={isPreview}
                setIsPreview={setIsPreview}
                toolbarOptions={toolbarOptions}
              />
            </div>
            {!isPreview ? (
              <>
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable
                      aria-placeholder={placeholder ?? ""}
                      className="text-foreground min-h-[150px] w-full resize-none bg-transparent outline-none"
                      placeholder={
                        <div className="text-foreground/50">{placeholder}</div>
                      }
                    />
                  }
                  ErrorBoundary={LexicalErrorBoundary}
                />
                <HistoryPlugin />
                <ListPlugin />
                <CheckListPlugin />
                <LinkPlugin />
                <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                <OnChangePlugin
                  ignoreHistoryMergeTagChange={true}
                  ignoreSelectionChange={true}
                  onChange={handleChange}
                />
              </>
            ) : (
              <Preview />
            )}
          </ToolbarProvider>
        </LexicalComposer>
      </div>
    );
  },
);
Editor.displayName = "Markdown";
