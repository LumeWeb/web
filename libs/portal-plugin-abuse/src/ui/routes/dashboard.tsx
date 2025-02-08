import { CaseTables } from "@/ui/components/dashboard/CaseTables";
import { ChartGrid } from "@/ui/components/dashboard/ChartGrid";
import { Header } from "@/ui/components/dashboard/Header";
import { SummaryCards } from "@/ui/components/dashboard/SummaryCards";
import { CaseTypeFilter, TimeRange } from "@/ui/types/dashboard";
import { useCaseTypeCounts } from "@/hooks/useCaseTypeCounts";
import {
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@lumeweb/portal-framework-ui-core";
import React, { useState } from "react";

function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [caseTypeFilter, setCaseTypeFilter] = useState<CaseTypeFilter>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const { counts, isLoading: isLoadingCounts } = useCaseTypeCounts(timeRange);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false);
      setLastRefreshed(new Date());
    }, 1000);
  };

  return (
    <div className="mx-auto p-10 space-y-6">
      <Header
        isLoading={isLoading}
        lastRefreshed={lastRefreshed}
        onRefresh={handleRefresh}
        onTimeRangeChange={setTimeRange}
        timeRange={timeRange}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <Tabs
          onValueChange={(value) => setCaseTypeFilter(value as CaseTypeFilter)}
          value={caseTypeFilter}>
          <TabsList>
            <TabsTrigger value="all">
              All Types
              {!isLoadingCounts && (
                <Badge
                  className="ml-2 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                  variant="outline">
                  {counts.all}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="spam">
              Spam
              {!isLoadingCounts && (
                <Badge
                  className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  variant="outline">
                  {counts.spam}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="harassment">
              Harassment
              {!isLoadingCounts && (
                <Badge
                  className="ml-2 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                  variant="outline">
                  {counts.harassment}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="content">
              Content
              {!isLoadingCounts && (
                <Badge
                  className="ml-2 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                  variant="outline">
                  {counts.content}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <SummaryCards caseTypeFilter={caseTypeFilter} timeRange={timeRange} />

      <ChartGrid caseTypeFilter={caseTypeFilter} timeRange={timeRange} />

      <CaseTables caseTypeFilter={caseTypeFilter} timeRange={timeRange} />
    </div>
  );
}
export default Dashboard;
