import type { CommunicationResponse } from "@/types/communication";

import { Avatar, AvatarFallback, cn, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { format } from "date-fns";

import React from "react";

import { CommunicationDirectionBadge } from "./CommunicationDirectionBadge";
import { CommunicationTypeIcon } from "./CommunicationTypeIcon";
const User = lazyIcon("User");


interface ThreadListItemProps {
  communication: CommunicationResponse;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ThreadListItem({
  communication,
  isSelected,
  onClick,
}: ThreadListItemProps) {
  const { content, createdAt, direction, type } = communication;

  // Truncate content for preview
  const contentPreview =
    content.length > 100 ? `${content.substring(0, 100)}...` : content;

  return (
    <div
      className={cn(
        "p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors",
        isSelected && "bg-muted",
      )}
      onClick={onClick}>
      <div className="flex items-start gap-2">
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <CommunicationTypeIcon
                className="h-4 w-4 text-muted-foreground"
                type={type}
              />
              <span className="text-sm font-medium capitalize">{type}</span>
            </div>
            <CommunicationDirectionBadge direction={direction} />
          </div>
          <p className="text-sm text-muted-foreground mb-2">{contentPreview}</p>
          <div className="text-xs text-muted-foreground">
            {format(new Date(createdAt), "MMM d, yyyy h:mm a")}
          </div>
        </div>
      </div>
    </div>
  );
}
