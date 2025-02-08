import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lumeweb/portal-framework-ui-core";
import React from "react";

import {
  formatBulletList,
  formatCheckList,
  formatCode,
  formatHeading,
  formatOrderedList,
  formatParagraph,
  formatQuote,
} from "./formatting";
import { blockTypeToBlockName, useToolbarState } from "./ToolbarContext";

interface BlockTypeDropdownProps {
  blockType: keyof typeof blockTypeToBlockName;
}

export default function BlockTypeDropdown({
  blockType,
}: BlockTypeDropdownProps) {
  const [editor] = useLexicalComposerContext();
  const { updateToolbarState } = useToolbarState();

  const handleSelect = (value: string) => {
    switch (value) {
      case "bullet":
        formatBulletList(editor, blockType, updateToolbarState);
        break;
      case "check":
        formatCheckList(editor, blockType, updateToolbarState);
        break;
      case "code":
        formatCode(editor, blockType, updateToolbarState);
        break;
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        formatHeading(editor, blockType, value, updateToolbarState);
        break;
      case "number":
        formatOrderedList(editor, blockType, updateToolbarState);
        break;
      case "paragraph":
        formatParagraph(editor, updateToolbarState);
        break;
      case "quote":
        formatQuote(editor, blockType, updateToolbarState);
        break;
    }
  };

  return (
    <Select onValueChange={handleSelect} value={blockType}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Block Type" />
      </SelectTrigger>
      <SelectContent>
        {Object.keys(blockTypeToBlockName).map((type) => (
          <SelectItem key={type} value={type}>
            {blockTypeToBlockName[type as keyof typeof blockTypeToBlockName]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
