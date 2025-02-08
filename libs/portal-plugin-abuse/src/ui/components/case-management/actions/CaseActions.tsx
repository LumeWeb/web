import type { CaseStatus } from "@/types/case";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { AddNoteDialog } from "./AddNoteDialog";
import { ExportCaseDialog } from "./ExportCaseDialog";
import { UpdateStatusDialog } from "./UpdateStatusDialog";

interface CaseActionsProps {
  caseId: number;
  caseReference: string;
  currentAssigneeId?: number;
  currentStatus: CaseStatus;
  onAssignUser: (userId: number | undefined) => Promise<void>;
  onRefresh?: () => void;
  onStatusChange: (status: CaseStatus, comment: string) => Promise<void>;
}

export function CaseActions({
  caseId,
  caseReference,
  currentAssigneeId,
  currentStatus,
  onAssignUser,
  onRefresh,
  onStatusChange,
}: CaseActionsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <UpdateStatusDialog
            caseId={caseId}
            currentStatus={currentStatus}
            onStatusChange={onStatusChange}
          />
          <AddNoteDialog caseId={caseId} onSuccess={onRefresh} />
          {/*          <AssignUserDialog
            caseId={caseId}
            currentAssigneeId={currentAssigneeId}
            onAssign={onAssignUser}
          />
          <ViewTimelineDialog caseId={caseId} />*/}
          <ExportCaseDialog caseId={caseId} caseReference={caseReference} />
        </div>
      </CardContent>
    </Card>
  );
}
