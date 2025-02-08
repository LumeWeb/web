import type { CaseType } from "@/types/case";

export type CaseTypeFilter = "all" | CaseType;
export type TimeRange = "all" | "7d" | "24h" | "30d";

export const ALL_TIME_RANGES: TimeRange[] = ["all", "7d", "24h", "30d"];
