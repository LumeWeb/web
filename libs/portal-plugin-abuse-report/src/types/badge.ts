import { CaseType } from "@lumeweb/portal-plugin-abuse-common";

export const CASE_TYPE_THEME = {
  [CaseType.Content]: {
    base: "bg-cyan-100 text-cyan-800",
    dark: "dark:bg-cyan-900/30 dark:text-cyan-400",
    hover: "hover:bg-cyan-200",
    label: "Content",
  },
  [CaseType.Harassment]: {
    base: "bg-orange-100 text-orange-800",
    dark: "dark:bg-orange-900/30 dark:text-orange-400",
    hover: "hover:bg-orange-200",
    label: "Harassment",
  },
  [CaseType.Malware]: {
    base: "bg-red-100 text-red-800",
    dark: "dark:bg-red-900/30 dark:text-red-400",
    hover: "hover:bg-red-200",
    label: "Malware",
  },
  [CaseType.Spam]: {
    base: "bg-yellow-100 text-yellow-800",
    dark: "dark:bg-yellow-900/30 dark:text-yellow-400",
    hover: "hover:bg-yellow-200",
    label: "Spam",
  },
  [CaseType.Other]: {
    base: "bg-blue-100 text-blue-800",
    dark: "dark:bg-blue-900/30 dark:text-blue-400",
    hover: "hover:bg-blue-200",
    label: "Other",
  },
};
