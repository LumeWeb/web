import type { CommunicationResponse } from "@/types/communication";

import { RefineResource } from "@/types/resources";
import { Avatar, AvatarFallback, cn, Skeleton, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { useList } from "@refinedev/core";
import { format } from "date-fns";

import React from "react";

import { CommunicationDirectionBadge } from "./CommunicationDirectionBadge";
import { CommunicationTypeIcon } from "./CommunicationTypeIcon";
const User = lazyIcon("User");


interface ConversationViewProps {
  communication: CommunicationResponse;
}

export function ConversationView({ communication }: ConversationViewProps) {
  const { data: threadData, isLoading: isLoadingThread } =
    useList<CommunicationResponse>({
      meta: {
        caseId: communication.caseId,
      },
      pagination: {
        pageSize: 100,
      },
      resource: RefineResource.Communication,
    });

  if (isLoadingThread) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  // Get all communications in this thread
  const allCommunications = threadData?.data || [];
  const threadCommunications = allCommunications.filter(
    (comm) => comm.threadId === communication.threadId,
  );

  // Sort by creation date
  threadCommunications.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <div className="p-4 space-y-6">
      {threadCommunications.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          No messages in this conversation
        </div>
      ) : (
        threadCommunications.map((comm) => (
          <div
            className={cn(
              "rounded-lg p-4",
              comm.parentId ? "ml-8" : "",
              comm.direction === "incoming" || comm.direction === "external"
                ? "bg-muted/50 border"
                : "bg-primary/5 border border-primary/10",
            )}
            key={comm.id}>
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CommunicationTypeIcon
                      className="h-4 w-4 text-muted-foreground"
                      type={comm.type}
                    />
                    <span className="text-sm font-medium capitalize">
                      {comm.type}
                    </span>
                    <CommunicationDirectionBadge direction={comm.direction} />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(comm.createdAt), "MMM d, yyyy h:mm a")}
                  </span>
                </div>

                <div className="text-sm whitespace-pre-line mb-3">
                  {comm.content}
                </div>

                <div className="text-xs text-muted-foreground">
                  From: User {comm.senderId}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
