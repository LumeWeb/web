import { useEffect, useRef } from "react";
import { useGetIdentity } from "@refinedev/core";
import { useAnalytics } from "@lumeweb/analytics";

/**
 * Bridges Refine's identity system with PostHog analytics.
 *
 * Call this hook ONCE inside the `<Refine>` boundary (where `useGetIdentity` works)
 * and inside `<AnalyticsProvider>` (where `useAnalytics` works).
 *
 * - When identity is available: calls `identify(userId)` once per user
 * - When identity becomes null (logout): calls `reset()` to clear the PostHog identity
 */
export function useIdentifyUser(): void {
  const { data: identity } = useGetIdentity<Record<string, unknown>>();
  const { identify, reset } = useAnalytics();
  const lastIdentifiedId = useRef<string | null>(null);

  useEffect(() => {
    const userId = identity?.id as string | undefined;

    if (userId && userId !== lastIdentifiedId.current) {
      lastIdentifiedId.current = userId;
      identify(userId);
    } else if (!userId && lastIdentifiedId.current !== null) {
      lastIdentifiedId.current = null;
      reset();
    }
  }, [identity?.id, identify, reset]);
}
