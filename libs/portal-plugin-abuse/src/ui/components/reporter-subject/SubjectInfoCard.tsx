import type { SubjectDetailResponse } from "@/types/reporter-subject";

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@lumeweb/portal-framework-ui-core";
import { format } from "date-fns";
import { AlertTriangle, Clock, Link2 } from "lucide-react";
import React from "react";

interface SubjectInfoCardProps {
  subject: SubjectDetailResponse;
}

export function SubjectInfoCard({ subject }: SubjectInfoCardProps) {
  const getScanBadgeVariant = (result?: string) => {
    if (!result) return "outline";
    switch (result) {
      case "clean":
        return "secondary"; // Changed from "success" to "secondary"
      case "malicious":
        return "destructive";
      case "suspicious":
        return "default"; // Changed from "warning" to "default"
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Link2 className="h-4 w-4 text-muted-foreground" />
          Subject Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{subject.identifier}</h3>
            {/*            {subject.lastScanResult && (
              <Badge
                className="capitalize"
                variant={getScanBadgeVariant(subject.lastScanResult)}>
                {subject.lastScanResult}
              </Badge>
            )}*/}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="capitalize">
              {subject.type?.replace("_", " ")}
            </span>
          </div>
        </div>

        {/*<div className="grid grid-cols-2 gap-4 text-sm">
          {subject.sourceUrl && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Source URL</p>
              <p className="font-medium truncate">{subject.sourceUrl}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">First Seen</p>
            <p className="font-medium flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              {format(new Date(subject.firstSeenDate), "MMM d, yyyy")}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Last Seen</p>
            <p className="font-medium flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              {format(new Date(subject.lastSeenDate), "MMM d, yyyy")}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Associated Cases</p>
            <p className="font-medium">{subject.totalAssociatedCases}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Risk Score</p>
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{subject.riskScore}/100</span>
            </div>
          </div>
          {subject.lastScanDate && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Last Scan Date</p>
              <p className="font-medium flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                {format(new Date(subject.lastScanDate), "MMM d, yyyy h:mm a")}
              </p>
            </div>
          )}
        </div>*/}

        {subject.notes && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-sm">{subject.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
