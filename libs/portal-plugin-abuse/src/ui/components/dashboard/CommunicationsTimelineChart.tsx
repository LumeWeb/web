import type { CaseTypeFilter } from "@/ui/types/dashboard";

import { Card } from "@lumeweb/portal-framework-ui-core";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface CommsTimelineChartProps {
  caseTypeFilter: CaseTypeFilter;
  timeRange: TimeRange;
}
import React from "react";

export function CommunicationsTimelineChart({
  timeRange,
}: CommsTimelineChartProps) {
  // Generate mock data based on the time range
  const generateData = () => {
    if (timeRange === "24h") {
      return Array.from({ length: 24 }, (_, i) => ({
        count: Math.floor(Math.random() * 30) + 5,
        hour: i,
        time: `${i}:00`,
      }));
    } else {
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 6 + i);
        return {
          count: Math.floor(Math.random() * 150) + 20,
          day: i,
          time: date.toLocaleDateString("en-US", { weekday: "short" }),
        };
      });
    }
  };

  const data = generateData();

  // Find peak time
  const peakData = [...data].sort((a, b) => b.count - a.count)[0];

  // Custom tooltip
  const CustomTooltip = ({ active, label, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-2 shadow-lg border">
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">
            {payload[0].value} messages
          </div>
        </Card>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer height="100%" width="100%">
      <LineChart
        data={data}
        margin={{ bottom: 20, left: 20, right: 20, top: 20 }}>
        <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
        <XAxis dataKey="time" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          label={{
            fill: "#ef4444",
            fontSize: 12,
            position: "top",
            value: "Peak",
          }}
          stroke="#ef4444"
          strokeDasharray="3 3"
          x={peakData.time}
        />
        <Line
          activeDot={{ r: 5 }}
          dataKey="count"
          dot={{ r: 3 }}
          stroke="#3b82f6"
          strokeWidth={2}
          type="monotone"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
