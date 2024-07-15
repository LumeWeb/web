import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "portal-shared/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "portal-shared/components/ui/popover";
import { Button, buttonVariants } from "portal-shared/components/ui/button";
import { CID } from "multiformats/cid";
import useCopy from "../hooks/useCopy";
import BareCopyButton from "./BareCopyButton";
import { cn } from "portal-shared/util/cn";

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
        <PopoverTrigger
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          {copied ? (
            <BareCopyButton copied={true} useButton={false} />
          ) : (
            <BareCopyButton copied={false} useButton={false} />
          )}
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
