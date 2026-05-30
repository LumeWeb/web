import { cn } from "@/lib/utils";

interface ComparisonColumn {
  label: string;
  highlight?: boolean;
}

interface ComparisonRow {
  factor: string;
  values: string[];
}

interface ComparisonTableProps {
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
  variant?: "dark" | "light";
  className?: string;
}

const darkStyles = {
  wrapperBg: "bg-home-card-bg",
  cellBg: "bg-home-card-bg",
  altBg: "bg-home-section-dark",
  highlightBg: "bg-home-card-bg/60",
  text: "text-home-text",
  muted: "text-home-text-muted",
  border: "border-home-text/20",
};

const lightStyles = {
  wrapperBg: "bg-white",
  cellBg: "bg-white",
  altBg: "bg-gray-50",
  highlightBg: "bg-white",
  text: "text-content-text",
  muted: "text-content-text-muted",
  border: "border-content-divider/50",
};

export default function ComparisonTable({
  columns,
  rows,
  variant = "light",
  className,
}: ComparisonTableProps) {
  const s = variant === "dark" ? darkStyles : lightStyles;

  return (
    <div className={cn("overflow-x-auto rounded-lg border -mx-4 px-4 sm:mx-0 sm:px-0", s.border, s.wrapperBg, className)}>
      <table className="w-full min-w-[540px]">
        <thead>
          <tr className={cn(s.border, "border-b")}>
            <th
              className={cn(
                s.cellBg,
                s.muted,
                "px-4 pt-4 pb-4 text-left text-sm font-semibold"
              )}
            >
              Factor
            </th>
            {columns.map((col, i) => {
              const isAlt = i % 2 === 0;
              const bgClass = col.highlight ? s.highlightBg : isAlt ? s.altBg : s.cellBg;
              return (
                <th
                  key={i}
                  className={cn(
                    bgClass,
                    col.highlight ? s.text : s.muted,
                    "px-4 pt-4 pb-4 text-left text-sm font-semibold"
                  )}
                >
                  {col.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.factor}
              className={cn(s.border, "border-b last:border-0")}
            >
              <td
                className={cn(
                  s.cellBg,
                  s.text,
                  "px-4 py-4 text-sm font-medium"
                )}
              >
                {row.factor}
              </td>
              {row.values.map((val, i) => {
                const col = columns[i];
                const isAlt = i % 2 === 0;
                const bgClass = col?.highlight ? s.highlightBg : isAlt ? s.altBg : s.cellBg;
                return (
                  <td
                    key={i}
                    className={cn(
                      bgClass,
                      col?.highlight ? s.text : s.muted,
                      "px-4 py-4 text-sm"
                    )}
                  >
                    {val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
