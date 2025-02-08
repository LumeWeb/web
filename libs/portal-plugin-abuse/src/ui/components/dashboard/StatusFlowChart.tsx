import type { TimeRange, CaseTypeFilter } from "@/ui/types/dashboard";
import { useCaseStatusFlowAnalytics } from "@/hooks/useCaseStatusFlowAnalytics";
import { ResponsiveContainer } from "recharts";
import { Label, Layer, Rectangle, Sankey, Tooltip } from "recharts";
import { CaseStatus } from "@/types/case";
import { Skeleton } from "@lumeweb/portal-framework-ui-core";

interface StatusFlowChartProps {
  timeRange: TimeRange;
  caseTypeFilter: CaseTypeFilter;
}

export function StatusFlowChart({
  timeRange,
  caseTypeFilter,
}: StatusFlowChartProps) {
  const { data, isLoading } = useCaseStatusFlowAnalytics({
    timeRange,
    caseType: caseTypeFilter === "all" ? undefined : caseTypeFilter,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (!data || !data.links?.length || !data.nodes?.length) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No status flow data available
      </div>
    );
  }

  // Custom node for the Sankey diagram
  const CustomNode = ({ height, index, width, x, y }: any) => {
    const colors = [
      "url(#blueGradient)",
      "url(#orangeGradient)",
      "url(#greenGradient)",
      "url(#grayGradient)",
      "url(#purpleGradient)",
    ];

    return (
      <Rectangle
        fill={colors[index % colors.length]}
        fillOpacity="1"
        height={height}
        rx={4}
        ry={4}
        width={width}
        x={x}
        y={y}
      />
    );
  };

  return (
    <ResponsiveContainer height="100%" width="100%">
      <Sankey
        data={data}
        link={{ stroke: "#d1d5db" }}
        margin={{ bottom: 10, left: 10, right: 10, top: 10 }}
        node={<CustomNode />}
        nodePadding={50}>
        <defs>
          <linearGradient id="blueGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="orangeGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="greenGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <linearGradient id="grayGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#e5e7eb" />
            <stop offset="100%" stopColor="#6b7280" />
          </linearGradient>
          <linearGradient id="purpleGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#ddd6fe" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <Tooltip
          formatter={(value, name) => [`${value} cases`, name]}
          labelFormatter={() => ""}
        />
        <Layer>
          {data.nodes.map((node, index) => (
            <Label
              content={<CustomLabel node={node} />}
              fill="#374151"
              fontSize={12}
              fontWeight="bold"
              key={index}
              textAnchor="middle"
              x={index * 200 + 100}
              y={150}
            />
          ))}
        </Layer>
      </Sankey>
    </ResponsiveContainer>
  );
}

// Custom label component for the Sankey nodes
function CustomLabel({ node, viewBox, ...rest }: any) {
  const { x, y } = viewBox || { x: 0, y: 0 };
  return (
    <text textAnchor="middle" x={x} y={y} {...rest}>
      {node.name}
    </text>
  );
}
