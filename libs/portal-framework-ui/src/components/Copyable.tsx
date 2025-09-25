import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@lumeweb/portal-framework-ui-core";

interface CopyableProps {
  /**
   * The text to be copied
   */
  text: string;
  /**
   * The display text (if different from the copied text)
   */
  displayText?: string;
  /**
   * Maximum length before truncating (default: 20)
   */
  maxLength?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Tooltip text for copy action (default: "Copy")
   */
  copyTooltip?: string;
  /**
   * Tooltip text when copied (default: "Copied!")
   */
  copiedTooltip?: string;
  /**
   * Whether to show the copy icon (default: true)
   */
  showIcon?: boolean;
}

export function Copyable({
  text,
  displayText,
  maxLength = 20,
  className,
  copyTooltip = "Copy",
  copiedTooltip = "Copied!",
  showIcon = true,
}: CopyableProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const textToDisplay = displayText || text;
  const truncatedText = textToDisplay.length > maxLength 
    ? `${textToDisplay.substring(0, maxLength)}...` 
    : textToDisplay;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleCopy}
            className={cn(
              "inline-flex items-center gap-1 text-sm hover:bg-muted/50 rounded px-2 py-1 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              className
            )}
          >
            <span className="font-mono">{truncatedText}</span>
            {showIcon && (
              <span className="text-muted-foreground">
                {isCopied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isCopied ? copiedTooltip : copyTooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
