import { CasePriority } from "@/types/case";
import { lazyIcon } from "@lumeweb/portal-framework-ui-core";

import React from "react";

import { type SwitchOption, VerticalSwitch } from "./VerticalSwitch";
const AlertCircle = lazyIcon("AlertCircle");
const AlertTriangle = lazyIcon("AlertTriangle");
const CircleAlert = lazyIcon("CircleAlert");
const CircleCheck = lazyIcon("CircleCheck");

interface PrioritySwitchProps {
  className?: string;
  onChange: (value: CasePriority) => Promise<void>;
  value: CasePriority;
}

export function PrioritySwitch({
  className,
  onChange,
  value,
}: PrioritySwitchProps) {
  const priorityOptions: SwitchOption<CasePriority>[] = [
    {
      className: "text-green-700 dark:text-green-400",
      icon: <CircleCheck className="h-4 w-4 text-green-500" />,
      label: "Low",
      value: CasePriority.low,
    },
    {
      className: "text-blue-700 dark:text-blue-400",
      icon: <AlertCircle className="h-4 w-4 text-blue-500" />,
      label: "Medium",
      value: CasePriority.medium,
    },
    {
      className: "text-orange-700 dark:text-orange-400",
      icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
      label: "High",
      value: CasePriority.high,
    },
    {
      className: "text-red-700 dark:text-red-400",
      icon: <CircleAlert className="h-4 w-4 text-red-500" />,
      label: "Critical",
      value: CasePriority.critical,
    },
  ];

  return (
    <VerticalSwitch
      className={className}
      label="Priority"
      onChange={onChange}
      options={priorityOptions}
      value={value}
    />
  );
}
