import { CaseType, ReportSource } from "@/types/case";
import { CaseTypeFilter, type TimeRange } from "@/ui/types/dashboard";
import { useCaseTypeSourceMatrixAnalytics } from "@/hooks/useCaseTypeSourceMatrixAnalytics";

import { Card } from "@lumeweb/portal-framework-ui-core";
import {
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

interface TypeSourceHeatmapProps {
  timeRange: TimeRange;
  caseTypeFilter: CaseTypeFilter;
}

export function TypeSourceHeatmap({
  timeRange,
  caseTypeFilter,
}: TypeSourceHeatmapProps) {
  const { data } = useCaseTypeSourceMatrixAnalytics({
    timeRange,
    caseType: caseTypeFilter === "all" ? undefined : caseTypeFilter,
  });

  // Generate the order of case types and report sources from enums
  const caseTypeOrder = Object.values(CaseType);
  const reportSourceOrder = Object.values(ReportSource);

  // Transform API data to chart format
  const chartData = data?.items
    ? data.items.map((item) => ({
        source: item.report_source,
        type: item.case_type,
        x: caseTypeOrder.indexOf(item.case_type as CaseType),
        y: reportSourceOrder.indexOf(item.report_source as ReportSource),
        z: item.case_count,
      }))
    : [];

  // Custom tooltip for the heatmap
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card className="p-2 shadow-lg border">
          <div className="text-sm font-medium">
            {data.type} / {data.source}
          </div>
          <div className="text-xs text-muted-foreground">{data.z} cases</div>
        </Card>
      );
    }
    return null;
  };

  // Get color based on value
  const getColor = (value: number) => {
    if (!data?.items) return "rgb(255,255,255)";
    const maxValue = Math.max(...data.items.map((item) => item.case_count));
    const normalizedValue = value / maxValue;

    // Green to red color scale
    const r = Math.floor(normalizedValue * 255);
    const g = Math.floor(255 - normalizedValue * 200);
    const b = Math.floor(50);

    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <ResponsiveContainer height="100%" width="100%">
      <ScatterChart margin={{ bottom: 20, left: 20, right: 20, top: 20 }}>
        <XAxis
          dataKey="x"
          name="Type"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => caseTypeOrder[value]}
          type="category"
        />
        <YAxis
          dataKey="y"
          name="Source"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => reportSourceOrder[value]}
          type="category"
        />
        <ZAxis
          dataKey="z"
          domain={[0, "dataMax"]}
          range={[400, 1000]}
          type="number"
        />
        <Tooltip content={<CustomTooltip />} />
        <Scatter data={chartData}>
          {chartData.map((entry, index) => (
            <Cell fill={getColor(entry.z)} key={`cell-${index}`} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
