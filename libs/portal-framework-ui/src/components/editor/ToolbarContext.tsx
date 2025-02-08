import { registerBridgedContext } from "@lumeweb/portal-framework-core";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export const blockTypeToBlockName = {
  bullet: "Bulleted List",
  check: "Check List",
  code: "Code Block",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  number: "Numbered List",
  paragraph: "Normal",
  quote: "Quote",
};

export type BlockType = "check" | "code" | keyof typeof blockTypeToBlockName;

export interface ToolbarState {
  blockType: BlockType;
  isBold: boolean;
  isClear: boolean;
  isItalic: boolean;
  isStrikethrough: boolean;
  isSubscript: boolean;
  isSuperscript: boolean;
  isUnderline: boolean;
}

export type ToolbarStateKey = keyof ToolbarState;

export type ToolbarStateValue<Key extends ToolbarStateKey> = ToolbarState[Key];

interface ContextShape {
  toolbarState: ToolbarState;
  updateToolbarState: <Key extends ToolbarStateKey>(
    key: Key,
    value: ToolbarStateValue<Key>,
  ) => void;
}

const Context = createContext<ContextShape | undefined>(undefined);

registerBridgedContext(Context, "MarkdownToolbarContext");

export const ToolbarProvider = ({ children }: { children: ReactNode }) => {
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    blockType: "paragraph",
    isBold: false,
    isClear: false,
    isItalic: false,
    isStrikethrough: false,
    isSubscript: false,
    isSuperscript: false,
    isUnderline: false,
  });

  const updateToolbarState = useCallback(
    <Key extends ToolbarStateKey>(key: Key, value: ToolbarStateValue<Key>) => {
      setToolbarState((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  const contextValue = useMemo(
    () => ({
      toolbarState,
      updateToolbarState,
    }),
    [toolbarState, updateToolbarState],
  );

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export const useToolbarState = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("useToolbarState must be used within a ToolbarProvider");
  }

  return context;
};
