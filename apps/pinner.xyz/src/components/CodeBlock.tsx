import { useState, useCallback } from "react";
import { Copy, Check, Terminal } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export interface CodeBlockCommand {
  label: string;
  command: string;
}

interface CodeBlockProps {
  commands: CodeBlockCommand[];
  defaultIndex?: number;
  className?: string;
}

export function CodeBlock({
  commands,
  defaultIndex = 0,
  className,
}: CodeBlockProps) {
  const [activeValue, setActiveValue] = useState(
    commands[defaultIndex]?.label ?? ""
  );
  const [copied, setCopied] = useState(false);

  const activeCommand =
    commands.find((c) => c.label === activeValue)?.command ?? "";

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(activeCommand).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [activeCommand]);

  if (commands.length === 0) return null;

  if (commands.length === 1) {
    return (
      <div className={className}>
        <div className="inline-block w-fit max-w-full rounded-lg border border-home-text/10 bg-home-card-bg overflow-hidden">
          <div className="flex items-center border-b border-home-text/10 px-3 py-1.5">
            <Terminal className="h-3.5 w-3.5 text-home-text-muted mr-2" />
            <span className="text-xs text-home-text-muted">Terminal</span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 ml-auto rounded-md px-2 py-0.5 text-xs text-home-text-muted hover:text-home-text hover:bg-home-text/5 transition-colors"
              aria-label="Copy command"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="flex items-center px-4 py-3">
            <code className="text-sm font-mono text-green-400">
              {commands[0].command}
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Tabs
        value={activeValue}
        onValueChange={setActiveValue}
        className="mt-0"
      >
        <div className="inline-block w-fit max-w-full rounded-lg border border-home-text/10 bg-home-card-bg overflow-hidden">
          <div className="flex items-center border-b border-home-text/10 px-2">
            <TabsList
              variant="line"
              className="bg-transparent p-0 h-auto gap-0"
            >
              {commands.map((cmd) => (
                <TabsTrigger
                  key={cmd.label}
                  value={cmd.label}
                  className="text-xs text-home-text-muted hover:text-home-text px-2.5 py-1.5 rounded-sm data-active:text-home-text data-active:bg-home-text/10"
                >
                  {cmd.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 ml-auto rounded-md px-2 py-0.5 text-xs text-home-text-muted hover:text-home-text hover:bg-home-text/5 transition-colors"
              aria-label="Copy command"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          {commands.map((cmd) => (
            <TabsContent
              key={cmd.label}
              value={cmd.label}
              className="mt-0"
            >
              <div className="flex items-center px-4 py-3">
                <code className="text-sm font-mono text-green-400">
                  {cmd.command}
                </code>
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
