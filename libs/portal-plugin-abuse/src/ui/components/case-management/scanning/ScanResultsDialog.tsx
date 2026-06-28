import type { ScanResultResponse } from "@/types/evidence";

import { RefineResource } from "@/types/resources";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@lumeweb/portal-framework-ui-core";
import { Skeleton } from "@lumeweb/portal-framework-ui-core";
import { useList } from "@refinedev/core";
import { format } from "date-fns";

import { useEffect, useState } from "react";
import React from "react";
const AlertCircle = lazyIcon("AlertCircle");
const CheckCircle = lazyIcon("CheckCircle");
const XCircle = lazyIcon("XCircle");


interface ScanResultsDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  scanId: number;
}

export function ScanResultsDialog({
  onOpenChange,
  open,
  scanId,
}: ScanResultsDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("summary");

  const { data, isLoading } = useList<ScanResultResponse>({
    filters: [
      {
        field: "caseScanId",
        operator: "eq",
        value: scanId,
      },
    ],
    resource: RefineResource.ScanResult,
  });

  const results = data?.data || [];

  // Reset to summary tab when dialog opens with new scan
  useEffect(() => {
    if (open) {
      setActiveTab("summary");
    }
  }, [open, scanId]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Scan Results</DialogTitle>
          <DialogDescription>
            Detailed results from the scan operation.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          className="flex-1 flex flex-col"
          defaultValue="summary"
          onValueChange={setActiveTab}
          value={activeTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
          </TabsList>

          <TabsContent className="flex-1 pt-4 overflow-auto" value="summary">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No scan results available.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Scan Overview</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Scanners
                      </p>
                      <p className="text-lg font-medium">{results.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pass Rate</p>
                      <p className="text-lg font-medium">
                        {Math.round(
                          (results.filter((r) => r.passed).length /
                            results.length) *
                            100,
                        )}
                        %
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Results Summary</h3>
                  <div className="space-y-2">
                    {results.map((result) => (
                      <div
                        className="flex items-center p-2 border rounded-md"
                        key={result.id}>
                        {result.passed ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {result.scannerId}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(result.timestamp),
                                "MMM d, yyyy h:mm a",
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {result.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent className="flex-1 pt-4 overflow-auto" value="details">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No scan results available.
              </div>
            ) : (
              <div className="space-y-6">
                {results.map((result) => (
                  <div
                    className="border rounded-md overflow-hidden"
                    key={result.id}>
                    <div
                      className={`p-3 ${result.passed ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {result.passed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <h3 className="font-medium">{result.scannerId}</h3>
                        </div>
                        <span className="text-xs">
                          {format(
                            new Date(result.timestamp),
                            "MMM d, yyyy h:mm a",
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-medium mb-2">Result</h4>
                      <p className="text-sm">{result.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent className="flex-1 pt-4 overflow-auto" value="technical">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-60 w-full" />
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No technical data available.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <p className="text-sm">
                    This section contains technical details intended for
                    advanced users.
                  </p>
                </div>

                {results.map((result) => (
                  <div
                    className="border rounded-md overflow-hidden"
                    key={result.id}>
                    <div className="p-3 bg-muted">
                      <h3 className="font-medium">{result.scannerId}</h3>
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-medium mb-2">Metadata</h4>
                      {result.metadata ? (
                        <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-[200px]">
                          {JSON.stringify(result.metadata, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No metadata available.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
