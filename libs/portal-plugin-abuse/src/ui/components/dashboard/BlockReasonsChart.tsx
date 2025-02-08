import type { CaseTypeFilter, TimeRange } from "@/ui/types/dashboard";
import { useBlockReasonAnalytics } from "@/hooks/useBlockReasonAnalytics";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@lumeweb/portal-framework-ui-core";
import { Skeleton } from "@lumeweb/portal-framework-ui-core";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BlockReasonsChartProps {
  caseTypeFilter: CaseTypeFilter;
  timeRange: TimeRange;
}

export function BlockReasonsChart({ timeRange }: BlockReasonsChartProps) {
  const { data, isLoading, isError } = useBlockReasonAnalytics({ timeRange });

  // Transform API data to chart format
  const chartData = data?.items
    ? data.items.map((item) => ({
        name: item.reason,
        count: item.count,
      }))
    : [];

  // Colors for the bars
  const colors = [
    "#ef4444", // red
    "#8b5cf6", // purple
    "#3b82f6", // blue
    "#f97316", // orange
    "#ec4899", // pink
    "#eab308", // yellow
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, label, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-2 shadow-lg border">
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">
            {payload[0].value} blocks
          </div>
        </Card>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 p-4 text-center">
        Error loading block reason data.
      </div>
    );
  }

  return (
    <ResponsiveContainer height="100%" width="100%">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ bottom: 20, left: 80, right: 20, top: 20 }}>
        <CartesianGrid
          horizontal={true}
          stroke="#e5e7eb"
          strokeDasharray="3 3"
          vertical={false}
        />
        <XAxis tick={{ fontSize: 12 }} type="number" />
        <YAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          type="category"
          width={80}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {chartData.map((_entry, index) => (
            <Cell fill={colors[index % colors.length]} key={`cell-${index}`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
