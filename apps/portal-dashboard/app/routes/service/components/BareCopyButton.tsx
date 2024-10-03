import React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BareCopyButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  copied: boolean;
  useButton?: boolean;
}

export default function BareCopyButton({
  copied,
  useButton = true,
  ...props
}: BareCopyButtonProps) {
  const Icon = copied ? Check : Copy;
  const iconProps = {
    className: copied ? "h-4 w-4 text-green-500" : "h-4 w-4",
  };

  if (useButton) {
    return (
      <Button variant="ghost" size="sm" {...props}>
        <Icon {...iconProps} />
      </Button>
    );
  }

  return <Icon {...iconProps} />;
}
