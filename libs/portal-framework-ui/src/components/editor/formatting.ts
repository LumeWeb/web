import { $createCodeNode } from "@lexical/code";
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingTagType,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $findMatchingParent } from "@lexical/utils";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  LexicalEditor,
} from "lexical";

import { blockTypeToBlockName } from "./ToolbarContext";

export function clearFormatting(
  editor: any,
  updateToolbarState: (key: string, value: any) => void,
) {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) return;

      const currentBlockType = $isHeadingNode(element)
        ? element.getTag()
        : $isListNode(element)
          ? element.getListType()
          : element.getType();

      if (currentBlockType === "paragraph") {
        const textContent = selection.getTextContent();
        const paragraphNode = $createParagraphNode();
        selection.insertNodes([paragraphNode]);
        const newSelection = $getSelection();
        if ($isRangeSelection(newSelection)) {
          newSelection.insertRawText(textContent);
        }
      } else {
        $setBlocksType(selection, () => $createParagraphNode());
      }

      updateToolbarState("isBold", false);
      updateToolbarState("isItalic", false);
      updateToolbarState("isUnderline", false);
      updateToolbarState("isStrikethrough", false);
      updateToolbarState("isSubscript", false);
      updateToolbarState("isSuperscript", false);
      updateToolbarState("isClear", true);

      updateToolbarState("blockType", "paragraph");
      updateToolbarState("isBold", false);
      updateToolbarState("isItalic", false);
      updateToolbarState("isUnderline", false);
      updateToolbarState("isStrikethrough", false);
      updateToolbarState("isSubscript", false);
      updateToolbarState("isSuperscript", false);
      updateToolbarState("isClear", true);
    }
  });
}

export function formatCheckList(
  editor: any,
  currentBlockType: string,
  updateToolbarState: (key: string, value: any) => void,
) {
  if (currentBlockType !== "check") {
    editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    updateToolbarState("blockType", "check");
  } else {
    formatParagraph(editor, updateToolbarState);
  }
}

export const formatCode = (
  editor: LexicalEditor,
  blockType: string,
  updateToolbarState: (key: string, value: any) => void,
) => {
  if (blockType !== "code") {
    editor.update(() => {
      let selection = $getSelection();
      if (!selection) {
        return;
      }
      if (!$isRangeSelection(selection) || selection.isCollapsed()) {
        $setBlocksType(selection, () => $createCodeNode());
      } else {
        const textContent = selection.getTextContent();
        const codeNode = $createCodeNode();
        selection.insertNodes([codeNode]);
        selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertRawText(textContent);
        }
      }
    });
    updateToolbarState("blockType", "code");
  }
};

export function formatParagraph(
  editor: LexicalEditor,
  updateToolbarState: (key: string, value: any) => void,
) {
  editor.update(() => {
    const selection = $getSelection();
    $setBlocksType(selection, () => $createParagraphNode());
    updateToolbarState("blockType", "paragraph");
  });
}

export const formatHeading = (
  editor: LexicalEditor,
  blockType: string,
  headingSize: HeadingTagType,
  updateToolbarState: (key: string, value: any) => void,
) => {
  if (blockType !== headingSize) {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
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

        const currentBlockType = $isHeadingNode(element)
          ? element.getTag()
          : $isListNode(element)
            ? element.getListType()
            : element.getType();

        if (currentBlockType === headingSize) {
          $setBlocksType(selection, () => $createParagraphNode());
          updateToolbarState("blockType", "paragraph");
        } else {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
          updateToolbarState(
            "blockType",
            headingSize as keyof typeof blockTypeToBlockName,
          );
        }
      }
    });
  }
};

export const formatQuote = (
  editor: LexicalEditor,
  blockType: string,
  updateToolbarState: (key: string, value: any) => void,
) => {
  if (blockType !== "quote") {
    editor.update(() => {
      const selection = $getSelection();
      $setBlocksType(selection, () => $createQuoteNode());
      updateToolbarState("blockType", "paragraph");
    });
  }
};

export const formatBulletList = (
  editor: LexicalEditor,
  blockType: string,
  updateToolbarState: (key: string, value: any) => void,
) => {
  if (blockType !== "bullet") {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    updateToolbarState("blockType", "bullet");
  } else {
    formatParagraph(editor, updateToolbarState);
  }
};

export const formatOrderedList = (
  editor: LexicalEditor,
  blockType: string,
  updateToolbarState: (key: string, value: any) => void,
) => {
  if (blockType !== "number") {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    updateToolbarState("blockType", "number");
  } else {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    updateToolbarState("blockType", "paragraph");
  }
};
