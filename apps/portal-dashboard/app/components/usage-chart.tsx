import { curveCardinal } from "@visx/curve";
import {
  AnimatedAxis, // any of these can be non-animated equivalents
  AnimatedLineSeries,
  XYChart,
  buildChartTheme,
} from "@visx/xychart";
import { InfoIcon } from "./icons";

type Coords = {
  x: string;
  y: string;
};

type UsageChartProps = {
  label: string;
  dataset: Coords[];
};

const accessors = {
  xAccessor: (d: Coords) => d.x,
  yAccessor: (d: Coords) => d.y,
};

const customTheme = buildChartTheme({
  colors: ["hsl(var(--system-color-12))"],
  backgroundColor: "hsl(var(--muted))",
  gridColor: "hsl(var(--system-color-12))",
  gridColorDark: "hsl(var(--system-color-12))",
  htmlLabel: {
    color: "hsl(var(--system-color-12))",
  },
  tickLength: 8,
  yTickLineStyles: {
    strokeWidth: 1,
  },
  xAxisLineStyles: {
    strokeWidth: 1,
  },
});

export const UsageChart = ({ label, dataset }: UsageChartProps) => {
  return (
    <div className="p-8 border rounded-lg w-full">
      <div className="flex items-center justify-between">
        <span className="font-bold text-lg">{label}</span>
        <InfoIcon className="text-foreground/50 cursor-pointer hover:text-foreground" />
      </div>
      <div className="text-foreground">
        <XYChart
          height={400}
          xScale={{ type: "band" }}
          yScale={{ type: "linear" }}
          theme={customTheme}>
          <AnimatedAxis
            orientation="bottom"
            hideTicks
            tickTransform="translate(50 0)"
            tickLabelProps={{ className: "text-sm" }}
          />
          <AnimatedAxis
            orientation="left"
            hideTicks
            tickLabelProps={{ className: "text-sm" }}
          />
          <AnimatedLineSeries
            className="stroke-ring"
            curve={curveCardinal}
            strokeWidth={4}
            dataKey="usage"
            data={dataset}
            {...accessors}
          />
        </XYChart>
      </div>
    </div>
  );
};
