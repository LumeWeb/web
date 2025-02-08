import type { CommunicationResponse } from "@/types/communication";

import { RefineResource } from "@/types/resources";
import { Skeleton } from "@lumeweb/portal-framework-ui-core";
import { useList } from "@refinedev/core";
import React from "react";

import { ThreadListItem } from "./ThreadListItem";
interface ThreadListProps {
  caseId: number;
  onSelectCommunication: (communication: CommunicationResponse) => void;
  selectedCommunicationId?: number;
}

export function ThreadList({
  caseId,
  onSelectCommunication,
  selectedCommunicationId,
}: ThreadListProps) {
  const { data, isLoading } = useList<CommunicationResponse>({
    meta: {
      caseId,
    },
    pagination: {
      pageSize: 10,
    },
    resource: RefineResource.Communication,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="p-3 border-b" key={index}>
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }

  const communications = data?.data || [];

  // Group communications by threadId
  const threadMap = new Map<string, CommunicationResponse[]>();

  communications.forEach((comm) => {
    if (comm.threadId) {
      if (!threadMap.has(comm.threadId)) {
        threadMap.set(comm.threadId, []);
      }
      threadMap.get(comm.threadId)!.push(comm);
    }
  });

  // Get the main communication from each thread (the one without a parentId)
  const threads: CommunicationResponse[] = [];

  threadMap.forEach((comms) => {
    const mainComm = comms.find((c) => !c.parentId) || comms[0];
    threads.push(mainComm);
  });

  // Sort threads by most recent first
  threads.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="overflow-auto h-full">
      {threads.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          No communications found
        </div>
      ) : (
        threads.map((communication) => (
          <ThreadListItem
            communication={communication}
            isSelected={selectedCommunicationId === communication.id}
            key={communication.id}
            onClick={() => onSelectCommunication(communication)}
          />
        ))
      )}
    </div>
  );
}
