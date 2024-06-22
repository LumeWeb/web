import { curveCardinal } from "@visx/curve";
import {
  AnimatedAxis,
  AnimatedLineSeries,
  XYChart,
  buildChartTheme,
} from "@visx/xychart";
import React, { useRef, useEffect, useState } from "react";
import useIsMobile from "~/hooks/useIsMobile";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };

    handleResize(); // Set initial width
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div
      ref={containerRef}
      className="p-2 lg:p-8 border border-border/30 rounded-lg w-full">
      <div className="flex items-center justify-between">
        <span className="font-bold text-lg">{label}</span>
        <InfoIcon className="text-foreground/50 cursor-pointer hover:text-foreground" />
      </div>
      <div className="text-foreground">
        <XYChart
          height={isMobile ? 300 : 400} // Adjust height for mobile devices
          width={width}
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
            strokeWidth={isMobile ? 2 : 4} // Adjust stroke width for mobile devices
            dataKey="usage"
            data={dataset}
            {...accessors}
          />
        </XYChart>
      </div>
    </div>
  );
};
