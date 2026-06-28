import { CaseStatus } from "@/types/case";
import { lazyIcon } from "@lumeweb/portal-framework-ui-core";

import React from "react";

import { type SwitchOption, VerticalSwitch } from "./VerticalSwitch";
const CheckCircle2 = lazyIcon("CheckCircle2");
const CircleDot = lazyIcon("CircleDot");
const Clock = lazyIcon("Clock");
const XCircle = lazyIcon("XCircle");


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
      value: CaseStatus.new,
    },
    {
      className: "text-yellow-700 dark:text-yellow-400",
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
      label: "In Progress",
      value: CaseStatus.in_progress,
    },
    {
      className: "text-green-700 dark:text-green-400",
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      label: "Resolved",
      value: CaseStatus.resolved,
    },
    {
      className: "text-gray-700 dark:text-gray-400",
      icon: <XCircle className="h-4 w-4 text-gray-500" />,
      label: "Closed",
      value: CaseStatus.closed,
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
