import { createContext, useCallback, type ReactNode } from "react";

export interface AnalyticsContextValue {
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (distinctId: string, properties?: Record<string, unknown>) => void;
  reset: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue>({
  capture: () => {},
  identify: () => {},
  reset: () => {},
});

interface AnalyticsProviderProps {
  children: ReactNode;
  /** Properties merged into every capture() call. Event props override. */
  baseProperties?: Record<string, unknown>;
  /** When true, all capture calls become no-ops. Useful for CI/dev. */
  disabled?: boolean;
}

function AnalyticsProvider({
  children,
  baseProperties,
  disabled = false,
}: AnalyticsProviderProps) {
  const capture = useCallback(
    (event: string, properties?: Record<string, unknown>) => {
      if (disabled) return;

      const posthog =
        typeof window !== "undefined" ? window.posthog : undefined;

      if (!posthog) {
        if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
          console.warn(
            `[analytics] window.posthog not available. Event not captured: "${event}"`
          );
        }
        return;
      }

      const merged = baseProperties
        ? { ...baseProperties, ...properties }
        : properties;

      posthog.capture(event, merged);
    },
    [baseProperties, disabled]
  );

  const identify = useCallback(
    (distinctId: string, properties?: Record<string, unknown>) => {
      if (disabled) return;

      const posthog =
        typeof window !== "undefined" ? window.posthog : undefined;

      if (!posthog) {
        if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
          console.warn(
            `[analytics] window.posthog not available. Identify not called for: "${distinctId}"`
          );
        }
        return;
      }

      posthog.identify(distinctId, properties);
    },
    [disabled]
  );

  const reset = useCallback(() => {
    if (disabled) return;

    const posthog =
      typeof window !== "undefined" ? window.posthog : undefined;

    if (!posthog) return;

    posthog.reset();
  }, [disabled]);

  return (
    <AnalyticsContext.Provider value={{ capture, identify, reset }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export { AnalyticsContext, AnalyticsProvider };
export type { AnalyticsProviderProps };
