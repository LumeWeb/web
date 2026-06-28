import type { ScanResponse, ScanStatus } from "@/types/evidence";

import { Button, lazyIcon } from "@lumeweb/portal-framework-ui-core";

interface ScanHistoryListProps {
  getStatusBadge: (status: ScanStatus) => React.ReactNode;
  onViewResults: (scanId: number) => void;
  scans: ScanResponse[];
}
import { format } from "date-fns";
import React from "react";
const Eye = lazyIcon("Eye");


export function ScanHistoryList({
  getStatusBadge,
  onViewResults,
  scans,
}: ScanHistoryListProps) {
  return (
    <div className="space-y-2">
      {scans.map((scan) => (
        <div
          className="flex items-center justify-between p-2 border rounded-md"
          key={scan.id}>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {getStatusBadge(scan.status)}
              <span className="text-sm font-medium">
                {format(new Date(scan.createdAt), "MMM d, yyyy h:mm a")}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {scan.attempts > 0 && (
                <span className="mr-2">Attempts: {scan.attempts}</span>
              )}
              {scan.lastAttempt && (
                <span>
                  Last attempt:{" "}
                  {format(new Date(scan.lastAttempt), "MMM d, yyyy h:mm a")}
                </span>
              )}
            </div>
          </div>
          <Button
            className="flex items-center gap-1"
            onClick={() => onViewResults(scan.id)}
            size="sm"
            variant="ghost">
            <Eye className="h-3.5 w-3.5" />
            Results
          </Button>
        </div>
      ))}
    </div>
  );
}
