export type BadgeConfig<T extends string> = Record<
  T,
  {
    base: string;
    dark: string;
    hover?: string;
    label?: string;
  }
>;

export type BadgeVariant =
  | "critical"
  | "default"
  | "destructive"
  | "info"
  | "secondary"
  | "success"
  | "warning";

export const BADGE_THEME: Record<
  BadgeVariant,
  {
    base: string;
    dark: string;
    hover: string;
  }
> = {
  critical: {
    base: "bg-orange-100 text-orange-800",
    dark: "dark:bg-orange-900/30 dark:text-orange-400",
    hover: "hover:bg-orange-200",
  },
  default: {
    base: "bg-gray-100 text-gray-800",
    dark: "dark:bg-gray-800 dark:text-gray-200",
    hover: "hover:bg-gray-200",
  },
  destructive: {
    base: "bg-red-100 text-red-800",
    dark: "dark:bg-red-900/30 dark:text-red-400",
    hover: "hover:bg-red-200",
  },
  info: {
    base: "bg-cyan-100 text-cyan-800",
    dark: "dark:bg-cyan-900/30 dark:text-cyan-400",
    hover: "hover:bg-cyan-200",
  },
  secondary: {
    base: "bg-blue-100 text-blue-800",
    dark: "dark:bg-blue-900/30 dark:text-blue-400",
    hover: "hover:bg-blue-200",
  },
  success: {
    base: "bg-green-100 text-green-800",
    dark: "dark:bg-green-900/30 dark:text-green-400",
    hover: "hover:bg-green-200",
  },
  warning: {
    base: "bg-yellow-100 text-yellow-800",
    dark: "dark:bg-yellow-900/30 dark:text-yellow-400",
    hover: "hover:bg-yellow-200",
  },
};
