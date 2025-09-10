import { $isListNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isHeadingNode } from "@lexical/rich-text";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import { Button, Separator, Toggle } from "@lumeweb/portal-framework-ui-core";
import {
  FontBoldIcon,
  FontItalicIcon,
  ReloadIcon,
  UnderlineIcon,
} from "@radix-ui/react-icons";
import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_TEXT_COMMAND,
  LexicalCommand,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import React, { useEffect, useState } from "react";

import BlockTypeDropdown from "./BlockTypeDropdown";
import { ToolbarOption } from "./Editor";
import {
  blockTypeToBlockName,
  ToolbarState,
  ToolbarStateKey,
  ToolbarStateValue,
  useToolbarState,
} from "./ToolbarContext";

export const defaultToolbarOptions: ToolbarOption[] = [
  "bold",
  "italic",
  "underline",
  "undo",
  "redo",
  "blockTypes",
];

const formatToStateKey = {
  bold: "isBold",
  clear: "isClear",
  italic: "isItalic",
  strikethrough: "isStrikethrough",
  subscript: "isSubscript",
  superscript: "isSuperscript",
  underline: "isUnderline",
} as const;

type FormatPayload = keyof typeof formatToStateKey;

interface ToolbarButtonProps {
  children: React.ReactNode;
  command: LexicalCommand<any>;
  disabled?: boolean;
  payload?: any;
  title?: string;
}

interface ToolbarPluginProps {
  enablePreview?: boolean;
  isPreview: boolean;
  setIsPreview: React.Dispatch<React.SetStateAction<boolean>>;
  toolbarOptions?: (
    | "blockTypes"
    | "bold"
    | "clear"
    | "italic"
    | "redo"
    | "strikethrough"
    | "subscript"
    | "superscript"
    | "underline"
    | "undo"
  )[];
}

const ToolbarButton = ({
  children,
  command,
  disabled,
  payload,
  title,
}: ToolbarButtonProps) => {
  const [editor] = useLexicalComposerContext();
  const {
    toolbarState,
    updateToolbarState,
  }: {
    toolbarState: ToolbarState;
    updateToolbarState: <Key extends ToolbarStateKey>(
      key: Key,
      value: ToolbarStateValue<Key>,
    ) => void;
  } = useToolbarState();

  const isActive =
    command === FORMAT_TEXT_COMMAND
      ? toolbarState[formatToStateKey[payload as FormatPayload]]
      : false;

  const handleClick = () => {
    editor.dispatchCommand(command, payload);
  };

  if (command === FORMAT_TEXT_COMMAND) {
    const stateKey = formatToStateKey[payload as FormatPayload];

    return (
      <Toggle
        aria-label={title}
        disabled={disabled}
        onPressedChange={(pressed) => {
          handleClick();
          updateToolbarState(stateKey, pressed);
          if (payload === "clear") {
            setTimeout(() => {
              updateToolbarState(stateKey, false);
            }, 300);
          }
        }}
        pressed={toolbarState[stateKey]}
        size="sm"
        title={title}>
        {children}
      </Toggle>
    );
  }

  return (
    <Button
      className={isActive ? "bg-gray-200" : ""}
      disabled={disabled}
      onClick={handleClick}
      size="icon"
      title={title}
      variant="ghost">
      {children}
    </Button>
  );
};

export function ToolbarPlugin({
  enablePreview = true,
  isPreview,
  setIsPreview,
  toolbarOptions = defaultToolbarOptions,
}: ToolbarPluginProps) {
  const [editor] = useLexicalComposerContext();
  const { toolbarState, updateToolbarState } = useToolbarState();

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const $updateToolbar = React.useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      updateToolbarState("isBold", selection.hasFormat("bold"));
      updateToolbarState("isItalic", selection.hasFormat("italic"));
      updateToolbarState(
        "isStrikethrough",
        selection.hasFormat("strikethrough"),
      );
      updateToolbarState("isSubscript", selection.hasFormat("subscript"));
      updateToolbarState("isSuperscript", selection.hasFormat("superscript"));
      updateToolbarState("isUnderline", selection.hasFormat("underline"));

      const anchorNode = selection.anchor.getNode();

      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const type = $isHeadingNode(element)
        ? element.getTag()
        : $isListNode(element)
          ? element.getListType()
          : element.getType();

      if (type in blockTypeToBlockName) {
        updateToolbarState(
          "blockType",
          type as keyof typeof blockTypeToBlockName,
        );
      }
    }
  }, [updateToolbarState]);

  React.useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
    );
  }, [editor, $updateToolbar]);

  useEffect(() => {
    if (!enablePreview) {
      setIsPreview(false);
    }

    if (enablePreview) {
      editor.setEditable(!isPreview);
    }
  }, [editor, enablePreview, isPreview, setIsPreview]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [editor]);

  return (
    <div className="relative z-10 w-full border-b">
      <div className="flex justify-center space-x-2 p-1">
        {toolbarOptions.includes("clear") && (
          <ToolbarButton
            command={FORMAT_TEXT_COMMAND}
            disabled={isPreview}
            payload="clear"
            title="Clear Formatting">
            <ReloadIcon className="text-muted-foreground" />
          </ToolbarButton>
        )}

        {toolbarOptions.includes("undo") && (
          <Button
            className="h-8 px-2"
            disabled={!canUndo || isPreview}
            onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
            title="Undo (Ctrl+Z)"
            variant="ghost">
            <ReloadIcon className="-scale-x-100 transform" />
          </Button>
        )}

        {toolbarOptions.includes("redo") && (
          <Button
            className="h-8 px-2"
            disabled={!canRedo || isPreview}
            onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
            title="Redo (Ctrl+Y)"
            variant="ghost">
            <ReloadIcon className="rotate-180" />
          </Button>
        )}

        {enablePreview && (
          <div className="flex items-center gap-1 pr-2">
            <Button
              onClick={() => setIsPreview(false)}
              size="sm"
              type="button"
              variant={!isPreview ? "secondary" : "ghost"}>
              Write
            </Button>
            <Button
              onClick={() => setIsPreview(true)}
              size="sm"
              type="button"
              variant={isPreview ? "secondary" : "ghost"}>
              Preview
            </Button>
          </div>
        )}

        {toolbarOptions.includes("blockTypes") && (
          <>
            <Separator className="my-1 h-auto" orientation="vertical" />
            <BlockTypeDropdown blockType={toolbarState.blockType} />
          </>
        )}

        {toolbarOptions.includes("bold") && (
          <ToolbarButton
            command={FORMAT_TEXT_COMMAND}
            disabled={isPreview}
            payload="bold"
            title="Bold (Ctrl+B)">
            <FontBoldIcon />
          </ToolbarButton>
        )}

        {toolbarOptions.includes("italic") && (
          <ToolbarButton
            command={FORMAT_TEXT_COMMAND}
            disabled={isPreview}
            payload="italic"
            title="Italic (Ctrl+I)">
            <FontItalicIcon />
          </ToolbarButton>
        )}

        {toolbarOptions.includes("underline") && (
          <ToolbarButton
            command={FORMAT_TEXT_COMMAND}
            disabled={isPreview}
            payload="underline"
            title="Underline (Ctrl+U)">
            <UnderlineIcon />
          </ToolbarButton>
        )}
      </div>
    </div>
  );
}
