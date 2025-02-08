import {
  BlockAction,
  BlockReason,
  BlockSeverity,
  BlockSource,
} from "./blocklist";
import { CasePriority, CaseStatus } from "./case";
import { BadgeVariant } from "@lumeweb/portal-framework-ui";

type BadgeConfig<T extends string> = Record<
  T,
  {
    base: string;
    hover?: string;
    dark: string;
    label?: string;
  }
>;

export const VERIFICATION_BADGE_CONFIG: BadgeConfig<BadgeVariant> = {
  pending: {
    base: "bg-amber-100 text-amber-800",
    hover: "hover:bg-amber-100",
    dark: "dark:bg-amber-900/30 dark:text-amber-400",
    label: "Pending Review",
  },
  verified: {
    base: "bg-green-100 text-green-800",
    hover: "hover:bg-green-100",
    dark: "dark:bg-green-900/30 dark:text-green-400",
    label: "Verified",
  },
  destructive: {
    base: "bg-red-100 text-red-800",
    hover: "hover:bg-red-100",
    dark: "dark:bg-red-900/30 dark:text-red-400",
    label: "Rejected",
  },
};

export const STATUS_BADGE_CONFIG: BadgeConfig<CaseStatus> = {
  [CaseStatus.closed]: {
    base: "bg-purple-100 text-purple-800",
    hover: "hover:bg-purple-100",
    dark: "dark:bg-purple-900/30 dark:text-purple-400",
    label: "Archived",
  },
  [CaseStatus.in_progress]: {
    base: "bg-yellow-100 text-yellow-800",
    hover: "hover:bg-yellow-100",
    dark: "dark:bg-yellow-900/30 dark:text-yellow-400",
    label: "In Progress",
  },
  [CaseStatus.new]: {
    base: "bg-blue-100 text-blue-800",
    hover: "hover:bg-blue-100",
    dark: "dark:bg-blue-900/30 dark:text-blue-400",
    label: "New",
  },
  [CaseStatus.resolved]: {
    base: "bg-green-100 text-green-800",
    hover: "hover:bg-green-100",
    dark: "dark:bg-green-900/30 dark:text-green-400",
    label: "Resolved",
  },
};

export const PRIORITY_BADGE_CONFIG: BadgeConfig<CasePriority> = {
  [CasePriority.low]: {
    base: "bg-red-100 text-red-800",
    hover: "hover:bg-red-100",
    dark: "dark:bg-red-900/30 dark:text-red-400",
    label: "Critical",
  },
  [CasePriority.high]: {
    base: "bg-orange-100 text-orange-800",
    hover: "hover:bg-orange-100",
    dark: "dark:bg-orange-900/30 dark:text-orange-400",
    label: "High",
  },
  [CasePriority.critical]: {
    base: "bg-gray-100 text-gray-800",
    hover: "hover:bg-gray-100",
    dark: "dark:bg-gray-800 dark:text-gray-400",
    label: "Low",
  },
  [CasePriority.medium]: {
    base: "bg-blue-100 text-blue-800",
    hover: "hover:bg-blue-100",
    dark: "dark:bg-blue-900/30 dark:text-blue-400",
    label: "Medium",
  },
};

export const ACTION_BADGE_CONFIG: BadgeConfig<BlockAction> = {
  [BlockAction.log]: {
    base: "bg-blue-100 text-blue-800",
    dark: "dark:bg-blue-900/30 dark:text-blue-400",
    label: "Log",
  },
  [BlockAction.quarantine]: {
    base: "bg-orange-100 text-orange-800",
    dark: "dark:bg-orange-900/30 dark:text-orange-400",
    label: "Quarantine",
  },
  [BlockAction.reject]: {
    base: "bg-red-100 text-red-800",
    dark: "dark:bg-red-900/30 dark:text-red-400",
    label: "Reject",
  },
  [BlockAction.warn]: {
    base: "bg-yellow-100 text-yellow-800",
    dark: "dark:bg-yellow-900/30 dark:text-yellow-400",
    label: "Warn",
  },
};

export const REASON_BADGE_CONFIG: BadgeConfig<BlockReason> = {
  [BlockReason.Copyright]: {
    base: "bg-blue-100 text-blue-800",
    dark: "dark:bg-blue-900/30 dark:text-blue-400",
    label: "Copyright",
  },
  [BlockReason.Csam]: {
    base: "bg-purple-100 text-purple-800",
    dark: "dark:bg-purple-900/30 dark:text-purple-400",
    label: "CSAM",
  },
  [BlockReason.Harassment]: {
    base: "bg-orange-100 text-orange-800",
    dark: "dark:bg-orange-900/30 dark:text-orange-400",
    label: "Harassment",
  },
  [BlockReason.HateSpeech]: {
    base: "bg-pink-100 text-pink-800",
    dark: "dark:bg-pink-900/30 dark:text-pink-400",
    label: "Hate Speech",
  },
  [BlockReason.Malware]: {
    base: "bg-red-100 text-red-800",
    dark: "dark:bg-red-900/30 dark:text-red-400",
    label: "Malware",
  },
  [BlockReason.Manual]: {
    base: "bg-gray-100 text-gray-800",
    dark: "dark:bg-gray-800 dark:text-gray-400",
    label: "Manual",
  },
  [BlockReason.Policy]: {
    base: "bg-green-100 text-green-800",
    dark: "dark:bg-green-900/30 dark:text-green-400",
    label: "Policy",
  },
  [BlockReason.Spam]: {
    base: "bg-yellow-100 text-yellow-800",
    dark: "dark:bg-yellow-900/30 dark:text-yellow-400",
    label: "Spam",
  },
};

export const SEVERITY_BADGE_CONFIG: BadgeConfig<BlockSeverity> = {
  [BlockSeverity.Critical]: {
    base: "bg-red-100 text-red-800",
    dark: "dark:bg-red-900/30 dark:text-red-400",
    label: "Critical",
  },
  [BlockSeverity.High]: {
    base: "bg-orange-100 text-orange-800",
    dark: "dark:bg-orange-900/30 dark:text-orange-400",
    label: "High",
  },
  [BlockSeverity.Low]: {
    base: "bg-gray-100 text-gray-800",
    dark: "dark:bg-gray-800 dark:text-gray-400",
    label: "Low",
  },
  [BlockSeverity.Medium]: {
    base: "bg-blue-100 text-blue-800",
    dark: "dark:bg-blue-900/30 dark:text-blue-400",
    label: "Medium",
  },
};

export const SOURCE_BADGE_CONFIG: BadgeConfig<BlockSource> = {
  [BlockSource.Admin]: {
    base: "bg-green-100 text-green-800",
    dark: "dark:bg-green-900/30 dark:text-green-400",
    label: "Admin",
  },
  [BlockSource.External]: {
    base: "bg-orange-100 text-orange-800",
    dark: "dark:bg-orange-900/30 dark:text-orange-400",
    label: "External",
  },
  [BlockSource.Report]: {
    base: "bg-blue-100 text-blue-800",
    dark: "dark:bg-blue-900/30 dark:text-blue-400",
    label: "Report",
  },
  [BlockSource.Scanner]: {
    base: "bg-purple-100 text-purple-800",
    dark: "dark:bg-purple-900/30 dark:text-purple-400",
    label: "Scanner",
  },
};
