import React from "react";
import { CheckIcon, XIcon } from "lucide-react";
import { formatDurationString } from "@/lib/time";

interface DisabledSettingProps {
  value: any;
  type: string;
}

export function DisabledSetting({ value, type }: DisabledSettingProps) {
  const renderValue = () => {
    switch (type) {
      case "string":
        return <span className="text-muted-foreground">{value}</span>;
      case "number":
        return <span className="text-muted-foreground">{value}</span>;
      case "boolean":
        return value ? (
          <CheckIcon className="h-4 w-4 text-muted-foreground" />
        ) : (
          <XIcon className="h-4 w-4 text-muted-foreground" />
        );
      case "array":
        return (
          <span className="text-muted-foreground">
            [{value.map((item: any) => JSON.stringify(item)).join(", ")}]
          </span>
        );
      case "duration":
        return (
          <span className="text-muted-foreground">
            {formatDurationString(value)}
          </span>
        );
      default:
        return (
          <span className="text-muted-foreground italic">
            {JSON.stringify(value)}
          </span>
        );
    }
  };

  return <div className="flex items-center space-x-2">{renderValue()}</div>;
}
