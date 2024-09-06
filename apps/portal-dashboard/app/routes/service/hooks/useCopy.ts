import React, { useState, useEffect, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CID } from "multiformats/cid";

// Custom hook for copy functionality
export default function useCopy(initialDelay = 500) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), initialDelay);
      return () => clearTimeout(timer);
    }
  }, [copied, initialDelay]);

  const copyToClipboard = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
  }, []);

  return { copied, copyToClipboard };
}
