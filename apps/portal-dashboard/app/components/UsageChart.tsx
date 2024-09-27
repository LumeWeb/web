import React, { useMemo } from "react";
import { InfoIcon } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  useChart,
} from "@/components/ui/chart";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useIsMobile from "@/hooks/useIsMobile";
import filesize from "@/util/filesize.js";
import { cn } from "@/lib/utils.js";

type InputCoords = {
  x: string;
  y: string | number;
};

type ProcessedCoords = {
  x: string;
  y: number;
};

type UsageChartProps = {
  label: string;
  dataset: InputCoords[];
  tooltip: React.ReactNode;
};

export const UsageChart = ({ label, dataset, tooltip }: UsageChartProps) => {
  const isMobile = useIsMobile();

  let processedData = useMemo(() => {
    return dataset
      .map((d) => {
        const date = new Date(d.x);
        const value = typeof d.y === "string" ? parseFloat(d.y) : d.y;
        if (isNaN(date.getTime()) || isNaN(value)) {
          console.error("Invalid data point:", d);
          return null;
        }
        return { x: date.toISOString(), y: value };
      })
      .filter((d): d is ProcessedCoords => d !== null)
      .sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());
  }, [dataset]);

  const formatYAxisTick = (value: number) => {
    return filesize(value, 1, "jedec");
  };

  const formatXAxisTick = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-normal">{label}</CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="h-4 w-4 text-muted-foreground cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-2 max-w-xs">{tooltip}</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            usageArea: {},
            usageLine: {},
          }}>
          <ResponsiveContainer>
            <AreaChart data={processedData}>
              <defs>
                <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopOpacity={0.5} />
                  <stop offset="95%" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="x"
                tickFormatter={formatXAxisTick}
                tick={{ fontSize: 12 }}
                tickMargin={8}
                tickCount={isMobile ? 4 : 6}
              />
              <YAxis
                tickFormatter={formatYAxisTick}
                tick={{ fontSize: 12 }}
                tickMargin={8}
                tickCount={5}
              />
              <Area
                type="monotone"
                dataKey="y"
                stroke="var(--color-usageLine)"
                fillOpacity={1}
                fill="url(#usageGradient)"
              />
              <ChartTooltip content={<CustomTooltip />} />
            </AreaChart>
            {processedData.length === 0 && (
              <p className="text-muted-foreground">No data available</p>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const CustomTooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ChartTooltipContent>
>(({ active, payload, className }, ref) => {
  const { config } = useChart();

  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;
  const date = new Date(data.x).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const value = filesize(data.y, 1);

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}>
      <div className="grid gap-1.5">
        <div className="flex w-full flex-wrap items-center gap-2">
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
            style={{ backgroundColor: config.usageLine.theme?.light }}
          />
          <div className="flex flex-1 justify-between leading-none">
            <span className="text-muted-foreground">Usage</span>
            <span className="font-mono font-medium tabular-nums text-foreground">
              {value}
            </span>
          </div>
        </div>
      </div>
      <div className="text-xs font-medium text-muted-foreground">{date}</div>
    </div>
  );
});

CustomTooltip.displayName = "CustomTooltip";

export default UsageChart;
