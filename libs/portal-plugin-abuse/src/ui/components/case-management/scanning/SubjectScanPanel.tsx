import {
  type ScanResponse,
  ScanStatus,
  type SubjectResponse,
} from "@/types/subject";
import { RefineResource } from "@/types/resources";
import { Card, CardContent, CardHeader, CardTitle, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { Button } from "@lumeweb/portal-framework-ui-core";
import { Skeleton } from "@lumeweb/portal-framework-ui-core";
import { Badge } from "@lumeweb/portal-framework-ui-core";
import { useCreate, useList, useNotification } from "@refinedev/core";

import React, { useState } from "react";

import { ScanHistoryList } from "./ScanHistoryList";
import { ScanResultsDialog } from "./ScanResultsDialog";
const AlertTriangle = lazyIcon("AlertTriangle");
const Hash = lazyIcon("Hash");
const Link2 = lazyIcon("Link2");
const Scan = lazyIcon("Scan");
const Shield = lazyIcon("Shield");
const ShieldAlert = lazyIcon("ShieldAlert");
const ShieldX = lazyIcon("ShieldX");


interface SubjectScanPanelProps {
  caseId: number;
  subjectId: number;
}

export function SubjectScanPanel({ caseId, subjectId }: SubjectScanPanelProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedScanId, setSelectedScanId] = useState<null | number>(null);
  const [resultsOpen, setResultsOpen] = useState(false);

  const { open: openNotification } = useNotification();
  const { mutate } = useCreate();

  const { data: subjectData, isLoading: isLoadingSubject } =
    useList<SubjectResponse>({
      filters: [
        {
          field: "id",
          operator: "eq",
          value: subjectId,
        },
      ],
      resource: RefineResource.Subject,
    });

  const {
    data: scansData,
    isLoading: isLoadingScans,
    refetch: refetchScans,
  } = useList<ScanResponse>({
    filters: [
      {
        field: "caseId",
        operator: "eq",
        value: caseId,
      },
      {
        field: "subjectId",
        operator: "eq",
        value: subjectId,
      },
    ],
    pagination: {
      pageSize: 5,
    },
    resource: RefineResource.Scan,
    sorters: [
      {
        field: "createdAt",
        order: "desc",
      },
    ],
  });

  const subject = subjectData?.data?.[0] as SubjectResponse;
  const scans = scansData?.data || [];

  const handleScanNow = () => {
    setIsScanning(true);

    /*mutate(
      {
        id: subjectId,
        meta: {
          operation: "scan",
        },
        resource: RefineResource.Subject,
        values: {
          scan: true,
        },
      },
      {
        onError: (_) => {
          openNotification?.({
            description:
              "There was an error initiating the scan. Please try again.",
            message: "Scan failed",
            type: "error",
          });
          setIsScanning(false);
        },
        onSuccess: (_) => {
          openNotification?.({
            description: "The subject scan has been initiated successfully.",
            message: "Scan initiated",
            type: "success",
          });
          refetchScans();
          setIsScanning(false);
        },
      },
    );*/
  };

  const handleViewResults = (scanId: number) => {
    setSelectedScanId(scanId);
    setResultsOpen(true);
  };

  const getSubjectTypeIcon = () => {
    if (!subject) return null;

    switch (subject.type) {
      case "hash":
        return <Hash className="h-4 w-4" />;
      case "url":
        return <Link2 className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: ScanStatus) => {
    switch (status) {
      case ScanStatus.clean:
        return (
          <Badge
            className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
            variant="outline">
            <Shield className="h-3 w-3 mr-1" />
            Clean
          </Badge>
        );
      case ScanStatus.failed:
        return (
          <Badge
            className="bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400"
            variant="outline">
            <ShieldX className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      case ScanStatus.flagged:
        return (
          <Badge
            className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
            variant="outline">
            <ShieldAlert className="h-3 w-3 mr-1" />
            Flagged
          </Badge>
        );
      case ScanStatus.in_progress:
      default:
        return (
          <Badge
            className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
            variant="outline">
            <Scan className="h-3 w-3 mr-1 animate-pulse" />
            Pending
          </Badge>
        );
    }
  };

  if (isLoadingSubject) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Subject Scanning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full mb-4" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!subject) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Subject Scanning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Subject not found.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">
          Subject Scanning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getSubjectTypeIcon()}
              <h3 className="font-medium">Subject Details</h3>
            </div>
            <Badge variant="outline">{subject.type?.toUpperCase()}</Badge>
          </div>

          <div className="mb-4">
            <p className="text-sm font-mono break-all">{subject.identifier}</p>
            {subject?.source_url && (
              <p className="text-xs text-muted-foreground mt-1">
                Source:{" "}
                <a
                  className="hover:underline"
                  href={subject?.source_url}
                  rel="noopener noreferrer"
                  target="_blank">
                  {subject?.source_url}
                </a>
              </p>
            )}
          </div>

          <Button
            className="w-full"
            disabled={isScanning}
            onClick={handleScanNow}>
            {isScanning ? "Scanning..." : "Scan Now"}
          </Button>
        </div>

        <div>
          <h3 className="font-medium mb-2">Scan History</h3>
          {isLoadingScans ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : scans.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No scan history available.
            </div>
          ) : (
            <ScanHistoryList
              getStatusBadge={getStatusBadge}
              onViewResults={handleViewResults}
              scans={scans}
            />
          )}
        </div>

        {selectedScanId && (
          <ScanResultsDialog
            onOpenChange={setResultsOpen}
            open={resultsOpen}
            scanId={selectedScanId}
          />
        )}
      </CardContent>
    </Card>
  );
}
