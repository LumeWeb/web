import type { ReactElement, ReactNode } from "react";
import { Fragment, useMemo } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import clsx from "clsx";

interface CodeBlockProps {
  "children"?: ReactNode;
  "className"?: string;
  "data-language"?: string;
  "data-title"?: string;
  "data-shiki"?: string;
}

interface CodeGroupProps {
  children: ReactNode;
  defaultValue?: string;
  className?: string;
}

function getCodeInfo(
  element: ReactElement<CodeBlockProps>,
): { label: string; lang: string; children: ReactNode } | null {
  const className = element.props.className || "";
  const isShiki = className.includes("shiki");

  if (!isShiki && !className.includes("language-")) {
    return null;
  }

  // Extract language
  let lang = "text";
  if (className.includes("github-light")) {
    lang =
      className
        .split(" ")
        .find((c) => c.startsWith("language-"))
        ?.replace("language-", "") || "text";
  }

  // Get label from data-title or use language
  const label = element.props["data-title"] || lang;

  // Get children - could be Code component or raw code
  const children = element.props.children;

  return { label, lang, children };
}

function findCodeBlocks(
  node: ReactNode,
): Array<{ label: string; lang: string; children: ReactNode }> {
  const codeBlocks: Array<{
    label: string;
    lang: string;
    children: ReactNode;
  }> = [];

  if (!node) return codeBlocks;

  if (typeof node === "string" || typeof node === "number") {
    return codeBlocks;
  }

  if (Array.isArray(node)) {
    node.forEach((child) => {
      codeBlocks.push(...findCodeBlocks(child));
    });
    return codeBlocks;
  }

  if (typeof node === "object") {
    const el = node as ReactElement<CodeBlockProps>;

    // Check if it's a fragment
    if (el.type === Fragment) {
      if (el.props?.children) {
        return findCodeBlocks(el.props.children);
      }
      return codeBlocks;
    }

    // Check if it's a code block
    const info = getCodeInfo(el);
    if (info) {
      return [info];
    }
  }

  return codeBlocks;
}

export function CodeGroup({
  children,
  defaultValue,
  className,
}: CodeGroupProps) {
  const { tabs, firstValue } = useMemo(() => {
    const codeBlocks = findCodeBlocks(children);
    return {
      tabs: codeBlocks,
      firstValue: codeBlocks[0]?.label,
    };
  }, [children]);

  if (tabs.length === 0) {
    return <>{children}</>;
  }

  return (
    <Tabs.Root
      className={clsx(
        "bg-codeBlockBackground border-codeInlineBorder rounded border",
        className,
      )}
      defaultValue={defaultValue ?? firstValue}>
      <Tabs.List className="bg-codeTitleBackground border-border flex rounded-t border-b px-8 md:px-[56px]">
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.label}
            value={tab.label}
            className="text-text3 hover:text-text data-[state=active]:text-title data-[state=active]:border-borderAccent py-2 pr-2 pb-1.5 pl-2 text-sm font-medium transition-colors duration-100 data-[state=active]:border-b-2">
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.map((tab) => (
        <Tabs.Content
          key={tab.label}
          value={tab.label}
          className="bg-codeBlockBackground">
          <div className="overflow-x-auto p-[22px]">
            <div className="code-group inline-block min-w-0 whitespace-pre">
              {tab.children}
            </div>
          </div>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
