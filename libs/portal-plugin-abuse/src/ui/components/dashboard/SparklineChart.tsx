import { Line, LineChart, ResponsiveContainer } from "recharts";

interface SparklineChartProps {
  color?: string;
  data: number[];
}

import React from "react";

export function SparklineChart({
  color = "#3b82f6",
  data,
}: SparklineChartProps) {
  const chartData = (data || []).map((value, index) => ({ index, value }));

  return (
    <ResponsiveContainer height="100%" width="100%">
      <LineChart data={chartData}>
        <Line
          dataKey="value"
          dot={false}
          isAnimationActive={false}
          stroke={color}
          strokeWidth={2}
          type="monotone"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
