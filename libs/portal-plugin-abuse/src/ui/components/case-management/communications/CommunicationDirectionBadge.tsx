import { CommunicationDirection } from "@/types/communication";
import { Badge, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { cn } from "@lumeweb/portal-framework-ui-core";

import React from "react";
const ArrowDownLeft = lazyIcon("ArrowDownLeft");
const ArrowUpRight = lazyIcon("ArrowUpRight");
const MessageSquare = lazyIcon("MessageSquare");
const Users = lazyIcon("Users");


interface CommunicationDirectionBadgeProps {
  className?: string;
  direction: CommunicationDirection;
}

export function CommunicationDirectionBadge({
  className,
  direction,
}: CommunicationDirectionBadgeProps) {
  const getDirectionConfig = (direction: CommunicationDirection) => {
    switch (direction) {
      case CommunicationDirection.External:
        return {
          className:
            "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
          icon: MessageSquare,
          label: "External",
        };
      case CommunicationDirection.Incoming:
        return {
          className:
            "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
          icon: ArrowDownLeft,
          label: "Incoming",
        };
      case CommunicationDirection.Internal:
        return {
          className:
            "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
          icon: Users,
          label: "Internal",
        };
      case CommunicationDirection.Outgoing:
        return {
          className:
            "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400",
          icon: ArrowUpRight,
          label: "Outgoing",
        };
      default:
        return {
          className:
            "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400",
          icon: MessageSquare,
          label: direction,
        };
    }
  };

  const config = getDirectionConfig(direction);
  const Icon = config.icon;

  return (
    <Badge
      className={cn("font-medium gap-1", config.className, className)}
      variant="outline">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
