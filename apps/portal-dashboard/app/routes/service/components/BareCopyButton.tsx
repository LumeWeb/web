import React, { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BareCopyButtonProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  copied: boolean;
}

export default function BareCopyButton({
  copied,
  ...props
}: BareCopyButtonProps) {
  return (
    <Button variant="ghost" size="sm" {...props}>
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}
