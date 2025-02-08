import type { Meta, StoryObj } from "@storybook/react";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
} from "recharts";

const multiSeriesData = [
  { desktop: 186, mobile: 80, month: "January" },
  { desktop: 305, mobile: 200, month: "February" },
  { desktop: 237, mobile: 120, month: "March" },
  { desktop: 73, mobile: 190, month: "April" },
  { desktop: 209, mobile: 130, month: "May" },
  { desktop: 214, mobile: 140, month: "June" },
];

const multiSeriesConfig = {
  desktop: {
    color: "var(--chart-1)",
    label: "Desktop",
  },
  mobile: {
    color: "var(--chart-2)",
    label: "Mobile",
  },
} satisfies ChartConfig;

const singleSeriesData = [
  { browser: "chrome", fill: "var(--color-chrome)", visitors: 275 },
  { browser: "safari", fill: "var(--color-safari)", visitors: 200 },
  { browser: "other", fill: "var(--color-other)", visitors: 190 },
];

const singleSeriesConfig = {
  chrome: {
    color: "var(--chart-1)",
    label: "Chrome",
  },
  other: {
    color: "var(--chart-5)",
    label: "Other",
  },
  safari: {
    color: "var(--chart-2)",
    label: "Safari",
  },
  visitors: {
    label: "Visitors",
  },
} satisfies ChartConfig;

/**
 * Beautiful charts. Built using Recharts. Copy and paste into your apps.
 */
const meta = {
  args: {
    children: <div />,
  },
  argTypes: {},
  component: ChartContainer,
  tags: ["autodocs"],
  title: "ui/Chart",
} satisfies Meta<typeof ChartContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Combine multiple Area components to create a stacked area chart.
 */
export const StackedAreaChart: Story = {
  args: {
    config: multiSeriesConfig,
  },
  render: (args) => (
    <ChartContainer {...args}>
      <AreaChart
        accessibilityLayer
        data={multiSeriesData}
        margin={{
          left: 12,
          right: 12,
        }}>
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="month"
          tickFormatter={(value) => value.slice(0, 3)}
          tickLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          content={<ChartTooltipContent indicator="dot" />}
          cursor={false}
        />
        <Area
          dataKey="mobile"
          fill="var(--color-mobile)"
          fillOpacity={0.4}
          stackId="a"
          stroke="var(--color-mobile)"
          type="natural"
        />
        <Area
          dataKey="desktop"
          fill="var(--color-desktop)"
          fillOpacity={0.4}
          stackId="a"
          stroke="var(--color-desktop)"
          type="natural"
        />
      </AreaChart>
    </ChartContainer>
  ),
};

/**
 * Combine multiple Bar components to create a stacked bar chart.
 */
export const StackedBarChart: Story = {
  args: {
    config: multiSeriesConfig,
  },
  render: (args) => (
    <ChartContainer {...args}>
      <BarChart accessibilityLayer data={multiSeriesData}>
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="month"
          tickFormatter={(value) => value.slice(0, 3)}
          tickLine={false}
          tickMargin={10}
        />
        <ChartTooltip
          content={<ChartTooltipContent indicator="dashed" />}
          cursor={false}
        />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
};

/**
 * Combine multiple Line components to create a single line chart.
 */
export const MultiLineChart: Story = {
  args: {
    config: multiSeriesConfig,
  },
  render: (args) => (
    <ChartContainer {...args}>
      <LineChart
        accessibilityLayer
        data={multiSeriesData}
        margin={{
          left: 12,
          right: 12,
        }}>
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="month"
          tickFormatter={(value) => value.slice(0, 3)}
          tickLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          content={<ChartTooltipContent hideLabel />}
          cursor={false}
        />
        <Line
          dataKey="desktop"
          dot={false}
          stroke="var(--color-desktop)"
          strokeWidth={2}
          type="natural"
        />
        <Line
          dataKey="mobile"
          dot={false}
          stroke="var(--color-mobile)"
          strokeWidth={2}
          type="natural"
        />
      </LineChart>
    </ChartContainer>
  ),
};

/**
 * Combine Pie and Label components to create a doughnut chart.
 */
export const DoughnutChart: Story = {
  args: {
    config: singleSeriesConfig,
  },
  render: (args) => {
    const totalVisitors = useMemo(() => {
      return singleSeriesData.reduce((acc, curr) => acc + curr.visitors, 0);
    }, []);
    return (
      <ChartContainer {...args}>
        <PieChart>
          <ChartTooltip
            content={<ChartTooltipContent hideLabel />}
            cursor={false}
          />
          <Pie
            data={singleSeriesData}
            dataKey="visitors"
            innerRadius={48}
            nameKey="browser"
            strokeWidth={5}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      dominantBaseline="middle"
                      textAnchor="middle"
                      x={viewBox.cx}
                      y={viewBox.cy}>
                      <tspan
                        className="fill-foreground text-3xl font-bold"
                        x={viewBox.cx}
                        y={viewBox.cy}>
                        {totalVisitors.toLocaleString()}
                      </tspan>
                      <tspan
                        className="fill-muted-foreground"
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}>
                        Visitors
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    );
  },
};
