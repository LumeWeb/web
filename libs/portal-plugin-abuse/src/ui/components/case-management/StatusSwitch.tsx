import { CaseStatus } from "@/types/case";
import { CheckCircle2, CircleDot, Clock, XCircle } from "lucide-react";
import React from "react";

import { type SwitchOption, VerticalSwitch } from "./VerticalSwitch";

interface StatusSwitchProps {
  className?: string;
  onChange: (value: CaseStatus) => Promise<void>;
  value: CaseStatus;
}

export function StatusSwitch({
  className,
  onChange,
  value,
}: StatusSwitchProps) {
  const statusOptions: SwitchOption<CaseStatus>[] = [
    {
      className: "text-blue-700 dark:text-blue-400",
      icon: <CircleDot className="h-4 w-4 text-blue-500" />,
      label: "New",
      value: CaseStatus.New,
    },
    {
      className: "text-yellow-700 dark:text-yellow-400",
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
      label: "In Progress",
      value: CaseStatus.InProgress,
    },
    {
      className: "text-green-700 dark:text-green-400",
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      label: "Resolved",
      value: CaseStatus.Resolved,
    },
    {
      className: "text-gray-700 dark:text-gray-400",
      icon: <XCircle className="h-4 w-4 text-gray-500" />,
      label: "Closed",
      value: CaseStatus.Closed,
    },
  ];

  return (
    <VerticalSwitch
      className={className}
      label="Status"
      onChange={onChange}
      options={statusOptions}
      value={value}
    />
  );
}
