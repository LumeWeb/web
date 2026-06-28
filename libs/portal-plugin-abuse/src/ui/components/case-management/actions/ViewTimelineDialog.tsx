"use client";

import type { CaseResponse, CasePriority, CaseStatus } from "@/types/case";

import { CaseEventType, type CaseHistoryEvent } from "@/types/case-history";
import { RefineResource } from "@/types/resources";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, ScrollArea, Tabs, TabsContent, TabsList, TabsTrigger, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { useNotification, useShow } from "@refinedev/core";
import { format } from "date-fns";

import { useState } from "react";
import React from "react";

import { CasePriorityBadge } from "../CasePriorityBadge";
import { CaseStatusBadge } from "../CaseStatusBadge";
const AlertTriangle = lazyIcon("AlertTriangle");
const Clock = lazyIcon("Clock");
const Download = lazyIcon("Download");
const FileText = lazyIcon("FileText");
const Loader2 = lazyIcon("Loader2");
const MessageSquare = lazyIcon("MessageSquare");
const User = lazyIcon("User");


interface ViewTimelineDialogProps {
  caseId: number;
}

export function ViewTimelineDialog({ caseId }: ViewTimelineDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const { open: openNotification } = useNotification();

  const {
    query: { isLoading },
    queryResult,
  } = useShow<CaseResponse>({
    id: caseId.toString(),
    resource: RefineResource.Case,
  });

  const history = queryResult.data?.data?.history || [];

  const filteredHistory =
    activeTab === "all"
      ? history
      : history.filter((event) => event.eventType === activeTab);

  // Sort by timestamp, newest first
  const sortedHistory = [...filteredHistory].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const handleExport = () => {
    // In a real app, this would generate and download a file
    openNotification?.({
      description: "The timeline has been exported successfully.",
      message: "Timeline exported",
      type: "success",
    });
  };

  const getEventIcon = (eventType: CaseEventType) => {
    switch (eventType) {
      case CaseEventType.AssigneeChanged:
        return <User className="h-4 w-4 text-purple-500" />;
      case CaseEventType.CommunicationAdded:
      case CaseEventType.NoteAdded:
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case CaseEventType.Created:
        return <FileText className="h-4 w-4 text-blue-500" />;
      case CaseEventType.PriorityChanged:
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case CaseEventType.StatusChanged:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventTitle = (event: CaseHistoryEvent) => {
    switch (event.eventType) {
      case CaseEventType.AssigneeChanged:
        return event.data.newValue ? "Case assigned" : "Case unassigned";
      case CaseEventType.CommunicationAdded:
        return "Communication added";
      case CaseEventType.Created:
        return "Case created";
      case CaseEventType.NoteAdded:
        return "Note added";
      case CaseEventType.PriorityChanged:
        return "Priority changed";
      case CaseEventType.StatusChanged:
        return "Status changed";
      default:
        return "Event occurred";
    }
  };

  const renderEventDetails = (event: CaseHistoryEvent) => {
    switch (event.eventType) {
      case CaseEventType.AssigneeChanged:
        return (
          <div>
            {event.data.oldValue && (
              <div className="text-sm text-muted-foreground">
                Previous assignee: User {event.data.oldValue}
              </div>
            )}
            {event.data.newValue ? (
              <div className="text-sm font-medium">
                Assigned to: User {event.data.newValue}
              </div>
            ) : (
              <div className="text-sm font-medium">Case unassigned</div>
            )}
          </div>
        );
      case CaseEventType.CommunicationAdded:
      case CaseEventType.NoteAdded:
        return event.data.comment ? (
          <div className="text-sm">{event.data.comment}</div>
        ) : null;
      case CaseEventType.PriorityChanged:
        return (
          <div className="flex items-center gap-2">
            <CasePriorityBadge priority={event.data.oldValue as CasePriority} />
            <span>→</span>
            <CasePriorityBadge priority={event.data.newValue as CasePriority} />
          </div>
        );
      case CaseEventType.StatusChanged:
        return (
          <div className="flex items-center gap-2">
            <CaseStatusBadge status={event.data.oldValue as CaseStatus} />
            <span>→</span>
            <CaseStatusBadge status={event.data.newValue as CaseStatus} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          View Timeline
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Case Timeline</DialogTitle>
            <Button
              className="flex items-center gap-1"
              onClick={handleExport}
              size="sm"
              variant="outline">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
          <DialogDescription>
            View the complete history of events for this case.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          className="flex-1 flex flex-col"
          defaultValue="all"
          onValueChange={setActiveTab}
          value={activeTab}>
          <TabsList className="grid grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value={CaseEventType.StatusChanged}>
              Status
            </TabsTrigger>
            <TabsTrigger value={CaseEventType.PriorityChanged}>
              Priority
            </TabsTrigger>
            <TabsTrigger value={CaseEventType.AssigneeChanged}>
              Assignee
            </TabsTrigger>
            <TabsTrigger value={CaseEventType.NoteAdded}>Notes</TabsTrigger>
            <TabsTrigger value={CaseEventType.CommunicationAdded}>
              Comms
            </TabsTrigger>
          </TabsList>

          <TabsContent className="flex-1 pt-4" value={activeTab}>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                {sortedHistory.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No events found in the timeline.
                  </div>
                ) : (
                  <div className="relative pl-6 border-l-2 border-muted ml-4 space-y-8">
                    {sortedHistory.map((event) => (
                      <div className="relative" key={event.id}>
                        <div className="absolute -left-[25px] p-1 rounded-full bg-background border-2 border-muted">
                          {getEventIcon(event.eventType)}
                        </div>
                        <div className="bg-muted/30 rounded-md p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium">
                              {getEventTitle(event)}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(event.timestamp),
                                "MMM d, yyyy h:mm a",
                              )}
                            </span>
                          </div>
                          {renderEventDetails(event)}
                          {event.data.comment && (
                            <div className="mt-2 text-sm text-muted-foreground italic">
                              &quot;{event.data.comment}&quot;
                            </div>
                          )}
                          <div className="mt-1 text-xs text-muted-foreground">
                            By User {event.userId}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
