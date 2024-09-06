import React, { useState } from "react";
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
import useCopy from "../hooks/useCopy";
import BareCopyButton from "./BareCopyButton";

export default function CIDTooltip({ cid }: { cid: CID }) {
  const [open, setOpen] = useState(false);
  const v1Cid = cid.toV1().toString();
  const v0Cid = cid.toString();

  const { copied, copyToClipboard } = useCopy(500);

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    setOpen(false);
  };

  return (
    <div className="flex items-center space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help">{v1Cid.slice(0, 20)}...</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{v1Cid}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm">
            {copied ? (
              <BareCopyButton copied={true} />
            ) : (
              <BareCopyButton copied={false} />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48">
          <div className="space-y-2">
            <Button
              className="w-full justify-start"
              variant="ghost"
              onClick={() => handleCopy(v0Cid)}>
              Copy v0 CID
            </Button>
            <Button
              className="w-full justify-start"
              variant="ghost"
              onClick={() => handleCopy(v1Cid)}>
              Copy v1 CID
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
