import {
    AnimatedAxis, // any of these can be non-animated equivalents
    AnimatedLineSeries,
    XYChart,
    buildChartTheme,
} from "@visx/xychart";
import { curveCardinal } from "@visx/curve";

interface UsageChartProps {
    usageName: string;
    dataset: {
        x: string;
        y: number;
    }[];
}

const accessors = {
    xAccessor: (d) => d.x,
    yAccessor: (d) => d.y,
};

const customTheme = buildChartTheme({
    colors: ["hsl(var(--ring))"],
    backgroundColor: "hsl(var(--primary-2))",
    gridColor: "hsl(var(--primary-2))",
    gridColorDark: "hsl(var(--primary-2))",
    tickLength: 8,
    xAxisLineStyles: {
        strokeWidth: 1,
    }
});

export const UsageChart = ({ usageName, dataset }: UsageChartProps) => {
    return (
        <div className="p-8 border rounded-lg w-full">
            <div className="flex items-center justify-between">
                <span className="font-bold text-lg">{usageName}</span>
                <InfoIcon className="text-ring" />
            </div>
            <div>
                <XYChart
                    height={400}
                    xScale={{ type: "band" }}
                    yScale={{ type: "linear" }}
                    theme={customTheme}
                >
                    <AnimatedAxis
                        orientation="bottom"
                        hideTicks
                        tickTransform="translateX(50%)"
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

const InfoIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            width="23"
            height="24"
            viewBox="0 0 23 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <g clipPath="url(#clip0_295_884)">
                <path
                    d="M11.5067 2C6.21422 2 1.92755 6.475 1.92755 12C1.92755 17.525 6.21422 22 11.5067 22C16.7992 22 21.0859 17.525 21.0859 12C21.0859 6.475 16.7992 2 11.5067 2ZM12.4646 17H10.5488V11H12.4646V17ZM12.4646 9H10.5488V7H12.4646V9Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath id="clip0_295_884">
                    <rect width="22.99" height="24" fill="currentColor" transform="translate(0.0117188)" />
                </clipPath>
            </defs>
        </svg>
    );
};
