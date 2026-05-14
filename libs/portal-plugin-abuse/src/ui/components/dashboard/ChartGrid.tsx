import type { CaseTypeFilter, TimeRange } from "@/ui/types/dashboard";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@lumeweb/portal-framework-ui-core";
import { Skeleton } from "@lumeweb/portal-framework-ui-core";
import { Tabs, TabsList, TabsTrigger } from "@lumeweb/portal-framework-ui-core";
import { useState } from "react";
import { CommunicationsTimelineChart } from "@/ui/components/dashboard/CommunicationsTimelineChart";

import { BlockReasonsChart } from "./BlockReasonsChart";
import { StatusFlowChart } from "./StatusFlowChart";
import { TypeSourceHeatmap } from "./TypeSourceHeatmap";

interface ChartGridProps {
  caseTypeFilter: CaseTypeFilter;
  timeRange: TimeRange;
}

import React from "react";

export function ChartGrid({ caseTypeFilter, timeRange }: ChartGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Status Flow Chart (Sankey) */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Case Status Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <StatusFlowChart
              caseTypeFilter={caseTypeFilter}
              timeRange={timeRange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Type/Source Heatmap */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Case Type by Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <TypeSourceHeatmap
              caseTypeFilter={caseTypeFilter}
              timeRange={timeRange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Communication Timeline */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">
            Communications Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <CommunicationsTimelineChart
              caseTypeFilter={caseTypeFilter}
              timeRange={timeRange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Block Reasons Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Block Reasons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <BlockReasonsChart
              caseTypeFilter={caseTypeFilter}
              timeRange={timeRange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
