import type { TimeRange } from "@/ui/types/dashboard";

import { Button } from "@lumeweb/portal-framework-ui-core";
import { Tabs, TabsList, TabsTrigger } from "@lumeweb/portal-framework-ui-core";
import { format } from "date-fns";
import { Download, RefreshCw } from "lucide-react";
import React from "react";

interface DashboardHeaderProps {
  isLoading: boolean;
  lastRefreshed: Date;
  onRefresh: () => void;
  onTimeRangeChange: (value: TimeRange) => void;
  timeRange: TimeRange;
}

export function Header({
  isLoading,
  lastRefreshed,
  onRefresh,
  onTimeRangeChange,
  timeRange,
}: DashboardHeaderProps) {
  const handleExport = () => {
    // In a real app, this would trigger a download
    // TODO: Implement
    alert("Exporting dashboard data...");
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-background">
          Abuse Management Dashboard
        </h1>
        <p className="text-muted-foreground">
          Analytics and overview of abuse management cases
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
        <div className="flex items-center">
          <Tabs
            onValueChange={(value) => onTimeRangeChange(value as TimeRange)}
            value={timeRange}>
            <TabsList>
              <TabsTrigger value="24h">24h</TabsTrigger>
              <TabsTrigger value="7d">7d</TabsTrigger>
              <TabsTrigger value="30d">30d</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="flex items-center gap-1"
            disabled={isLoading}
            onClick={onRefresh}
            size="sm"
            variant="outline">
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            className="flex items-center gap-1"
            onClick={handleExport}
            size="sm"
            variant="outline">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground hidden sm:block">
        Last updated: {format(lastRefreshed, "MMM d, yyyy h:mm a")}
      </div>
    </div>
  );
}
