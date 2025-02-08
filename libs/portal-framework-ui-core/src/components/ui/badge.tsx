import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../lib/utils";

export type BadgeVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "success"
  | "warning"
  | "info";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default:
          "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200/80 dark:hover:bg-gray-700/80",
        destructive:
          "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200/80 dark:hover:bg-red-800/80",
        outline: "text-foreground",
        secondary:
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200/80 dark:hover:bg-blue-800/80",
        success:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200/80 dark:hover:bg-green-800/80",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-200/80 dark:hover:bg-yellow-800/80",
        info:
          "border-transparent bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400 hover:bg-cyan-200/80 dark:hover:bg-cyan-800/80",
      },
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children?: React.ReactNode; // Explicitly add children
}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
