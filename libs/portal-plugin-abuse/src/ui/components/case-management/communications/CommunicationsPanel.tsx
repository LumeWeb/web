import type { CommunicationResponse } from "@/types/communication";

import { RefineResource } from "@/types/resources";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@lumeweb/portal-framework-ui-core";
import { useList } from "@refinedev/core";
import { ArrowLeft, MessageSquare } from "lucide-react";
import React, { useEffect, useState } from "react";

import { ConversationView } from "./ConversationView";
import { ReplyComposer } from "./ReplyComposer";
import { ThreadList } from "./ThreadList";

interface CommunicationsPanelProps {
  caseId: number;
}

export function CommunicationsPanel({ caseId }: CommunicationsPanelProps) {
  const [selectedCommunication, setSelectedCommunication] =
    useState<CommunicationResponse | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check if we're in a mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { isLoading: isLoadingThreads } = useList<CommunicationResponse>({
    meta: {
      params: {
        caseId,
      },
    },
    pagination: {
      pageSize: 10,
    },
    resource: RefineResource.CaseCommunication,
  });

  const handleSelectCommunication = (communication: CommunicationResponse) => {
    setSelectedCommunication(communication);
  };

  const handleBackToThreads = () => {
    setSelectedCommunication(null);
  };

  const handleReplySuccess = () => {
    // Refresh the conversation view
    setTimeout(() => {
      // This could be improved with optimistic updates or real-time updates
      if (selectedCommunication) {
        // Force a refresh by temporarily clearing and resetting the selection
        const tempComm = selectedCommunication;
        setSelectedCommunication(null);
        setTimeout(() => setSelectedCommunication(tempComm), 50);
      }
    }, 100);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Communications
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
        {/* Mobile or desktop view with conversation selected */}
        {isMobileView && selectedCommunication ? (
          <div className="flex flex-col h-full">
            <div className="p-2 border-b">
              <Button
                className="flex items-center gap-1"
                onClick={handleBackToThreads}
                size="sm"
                variant="ghost">
                <ArrowLeft className="h-4 w-4" />
                Back to Threads
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              {selectedCommunication && (
                <ConversationView communication={selectedCommunication} />
              )}
            </div>
            <div className="mt-auto">
              {selectedCommunication && (
                <ReplyComposer
                  caseId={caseId}
                  onSuccess={handleReplySuccess}
                  parentId={selectedCommunication.id}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full">
            {/* Threads list - always visible on desktop, conditionally on mobile */}
            <div
              className={`${selectedCommunication && !isMobileView ? "w-1/3 border-r" : "w-full"} h-full overflow-hidden flex flex-col`}>
              <div className="p-3 border-b bg-muted/30">
                <h3 className="font-medium">Message Threads</h3>
              </div>
              <div className="flex-1 overflow-auto">
                {isLoadingThreads ? (
                  <div className="p-4 space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : (
                  <ThreadList
                    caseId={caseId}
                    onSelectCommunication={handleSelectCommunication}
                    selectedCommunicationId={selectedCommunication?.id}
                  />
                )}
              </div>
            </div>

            {/* Conversation view - only visible on desktop when a thread is selected */}
            {selectedCommunication && !isMobileView && (
              <div className="w-2/3 h-full flex flex-col">
                <div className="p-3 border-b bg-muted/30">
                  <h3 className="font-medium">Conversation</h3>
                </div>
                <div className="flex-1 overflow-auto">
                  <ConversationView communication={selectedCommunication} />
                </div>
                <div className="mt-auto">
                  <ReplyComposer
                    caseId={caseId}
                    onSuccess={handleReplySuccess}
                    parentId={selectedCommunication.id}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
