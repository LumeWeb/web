import {
  ALL_TIME_RANGES,
  type CaseTypeFilter,
  type TimeRange,
} from "@/ui/types/dashboard";

import { useCaseTimeSeriesAnalytics } from "@/hooks/useCaseTimeSeriesAnalytics";
import { useCaseAnalyticsMulti } from "@/hooks/useCaseAnalyticsMulti";
import { Card, CardContent, Skeleton, lazyIcon } from "@lumeweb/portal-framework-ui-core";

import React, { useMemo } from "react";

import { SparklineChart } from "./SparklineChart";
const ArrowDown = lazyIcon("ArrowDown");
const ArrowUp = lazyIcon("ArrowUp");
const Clock = lazyIcon("Clock");
const FileText = lazyIcon("FileText");
const Search = lazyIcon("Search");


interface SummaryCardsProps {
  caseTypeFilter: CaseTypeFilter;
  timeRange: TimeRange;
}

export function SummaryCards({ timeRange, caseTypeFilter }: SummaryCardsProps) {
  const { data, isLoading: analyticsIsLoading } =
    useCaseAnalyticsMulti(ALL_TIME_RANGES);

  // Memoize the specific time range data you need
  const currentTimeRangeData = data[timeRange];
  const newCases24hDataPoint = data["24h"];
  const newCases7dDataPoint = data["7d"];

  // Extract data from API response
  const openCases = currentTimeRangeData?.open_cases || 0;
  const newCases24h = newCases24hDataPoint?.new_cases || 0;
  const newCases7d = newCases7dDataPoint?.new_cases || 0;
  const avgResponseTime = currentTimeRangeData?.communications
    ?.average_response_seconds
    ? Math.round(
        Number(currentTimeRangeData?.communications?.average_response_seconds) /
          3600,
      )
    : 0;
  const needsReviewCount = currentTimeRangeData?.needs_review_count || 0;
  const totalCases = currentTimeRangeData?.total_cases || 0;
  const needsReviewPercent =
    totalCases > 0 ? Math.round((needsReviewCount / totalCases) * 100) : 0;

  // Memoize the timeRange value to prevent hook inconsistencies
  const openCasesTimeRange = useMemo(
    () => (timeRange === "all" ? "30d" : timeRange),
    [timeRange],
  );

  // Get time-series data for sparklines
  const { data: openCasesData } = useCaseTimeSeriesAnalytics({
    metric: "open_cases",
    timeRange: openCasesTimeRange,
    filters: {
      caseType: caseTypeFilter === "all" ? undefined : caseTypeFilter,
    },
  });
  const { data: newCases24hData } = useCaseTimeSeriesAnalytics({
    metric: "new_cases",
    timeRange: "24h",
    filters: {
      caseType: caseTypeFilter === "all" ? undefined : caseTypeFilter,
    },
  });
  const { data: newCases7dData } = useCaseTimeSeriesAnalytics({
    metric: "new_cases",
    timeRange: "7d",
    filters: {
      caseType: caseTypeFilter === "all" ? undefined : caseTypeFilter,
    },
  });

  // Calculate trends
  const calculateTrend = (data: number[]) => {
    if (!data || data.length < 2) return null;
    const first = data[0];
    const last = data[data.length - 1];
    // Return null if we can't calculate a meaningful trend
    if (first === 0 || isNaN(first) || isNaN(last)) return null;
    return ((last - first) / first) * 100;
  };

  const newCasesTrend24h = calculateTrend(newCases24hData);
  const newCasesTrend7d = calculateTrend(newCases7dData);

  if (analyticsIsLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-7 w-1/2 mb-2" />
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Open Case Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              Open Cases
            </h3>
          </div>
          <div className="text-3xl font-bold mb-4">{openCases}</div>
          <div className="h-16">
            <SparklineChart data={openCasesData ?? []} />
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Last 7 days trend
          </div>
        </CardContent>
      </Card>

      {/* New Case Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              New Cases
            </h3>
          </div>
          <div className="text-3xl font-bold mb-1">
            {timeRange === "24h" ? newCases24h : newCases7d / 7}
          </div>
          <div className="flex items-center gap-1">
            {timeRange === "24h" &&
              newCasesTrend24h !== null &&
              (newCasesTrend24h > 0 ? (
                <div className="flex items-center text-red-500 text-sm">
                  <ArrowUp className="h-3.5 w-3.5" />
                  {newCasesTrend24h}%
                </div>
              ) : (
                <div className="flex items-center text-green-500 text-sm">
                  <ArrowDown className="h-3.5 w-3.5" />
                  {Math.abs(newCasesTrend24h)}%
                </div>
              ))}
            {timeRange !== "24h" &&
              newCasesTrend7d !== null &&
              (newCasesTrend7d > 0 ? (
                <div className="flex items-center text-red-500 text-sm">
                  <ArrowUp className="h-3.5 w-3.5" />
                  {newCasesTrend7d}%
                </div>
              ) : (
                <div className="flex items-center text-green-500 text-sm">
                  <ArrowDown className="h-3.5 w-3.5" />
                  {Math.abs(newCasesTrend7d)}%
                </div>
              ))}
            <span className="text-xs text-muted-foreground">
              vs previous period
            </span>
          </div>
          <div className="mt-4 h-16">
            <SparklineChart
              data={timeRange === "24h" ? newCases24hData : newCases7dData}
              color="#3b82f6"
            />
            <div className="text-center mt-1">
              <div className="text-xs text-muted-foreground">
                {timeRange === "24h" ? (
                  <>~{Math.round(newCases24h / 24)} cases/hour</>
                ) : (
                  <>~{Math.round(newCases7d / 7)} cases/day</>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avg Response Time Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Avg. First Response
            </h3>
          </div>
          <div className="text-3xl font-bold mb-1">{avgResponseTime}h</div>
          <div className="text-xs text-muted-foreground mt-2">
            Based on {timeRange} data
          </div>
        </CardContent>
      </Card>

      {/* Needs Review Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Search className="h-4 w-4" />
              Needs Review
            </h3>
          </div>
          <div className="text-3xl font-bold mb-4">{needsReviewPercent}%</div>
          <div className="flex items-center justify-center h-16">
            <div className="relative h-16 w-16">
              <svg className="h-16 w-16" viewBox="0 0 36 36">
                <path
                  className="stroke-muted"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3"
                />
                <path
                  className="stroke-amber-500"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeDasharray={`${needsReviewPercent}, 100`}
                  strokeWidth="3"
                />
                <text
                  className="text-xs font-medium fill-foreground"
                  textAnchor="middle"
                  x="18"
                  y="20.5">
                  {needsReviewCount}
                </text>
              </svg>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-2 text-center">
            {needsReviewCount} of {totalCases} total cases
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
