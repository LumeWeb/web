import { useContext } from "react";
import { AnalyticsContext } from "./AnalyticsProvider";

export function useAnalytics() {
  return useContext(AnalyticsContext);
}
