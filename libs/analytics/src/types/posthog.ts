/** Minimal PostHog API surface — only methods used by @lumeweb/analytics */
export interface PostHog {
  capture(event: string, properties?: Record<string, unknown>): void;
  identify(distinctId: string, properties?: Record<string, unknown>): void;
  register_for_session(properties: Record<string, unknown>): void;
  reset(): void;
}

declare global {
  interface Window {
    posthog?: PostHog;
  }
}

export {};
