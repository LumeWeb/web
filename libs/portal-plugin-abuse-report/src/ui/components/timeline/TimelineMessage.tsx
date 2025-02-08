import { cn } from "@lumeweb/portal-framework-ui-core";
import { User, UserRound } from "lucide-react";
import React from "react";
import Markdown from "react-markdown";

import { TimelineItem } from "./Timeline";

interface TimelineMessageProps {
  className?: string;
  content: string;
  direction: "external" | "incoming";
  sender: string;
  timestamp: string;
  type?: string;
}

export function TimelineMessage({
  className,
  content,
  direction,
  sender,
  timestamp,
  type,
}: TimelineMessageProps) {
  const isIncoming = direction === "incoming";
  const isNote = type === "note";

  return (
    <TimelineItem
      className={cn("py-2", className)}
      dotClassName={
        isIncoming
          ? "bg-primary/20"
          : isNote
            ? "bg-muted/30"
            : "bg-secondary/30"
      }
      icon={
        isIncoming ? (
          <UserRound className="h-4 w-4 text-primary" />
        ) : (
          <User className="h-4 w-4 text-foreground" />
        )
      }>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {sender}
            {isNote && (
              <span className="ml-2 text-xs text-muted-foreground">(Note)</span>
            )}
          </span>
          <span className="text-xs text-foreground/60">{timestamp}</span>
        </div>
        <div className="bg-background p-4 rounded-lg w-full">
          <div className="text-sm text-foreground prose prose-invert max-w-none">
            {/* @ts-ignore */}
            <Markdown>{content}</Markdown>
          </div>
        </div>
      </div>
    </TimelineItem>
  );
}
