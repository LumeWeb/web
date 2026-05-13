import { createStore } from "zustand";
import { persist } from "zustand/middleware";

export type ConsentCategory = "analytics" | "marketing" | "functional";
export type ConsentStatus = "pending" | "accepted" | "rejected" | "customized";

export const CONSENT_VERSION = 1;
export const CONSENT_EXPIRY_MS = 6 * 30 * 24 * 60 * 60 * 1000; // 6 months

interface ConsentActions {
  acceptAll: () => void;
  rejectAll: () => void;
  customize: (categories: Record<ConsentCategory, boolean>) => void;
  withdrawConsent: () => void;
  isConsentExpired: () => boolean;
}

export interface ConsentState extends ConsentActions {
  status: ConsentStatus;
  categories: Record<ConsentCategory, boolean>;
  timestamp: number | null;
  version: number;
}

const defaultCategories: Record<ConsentCategory, boolean> = {
  analytics: false,
  marketing: false,
  functional: false,
};

export const useConsentStore = createStore<ConsentState>()(
  persist(
    (set, get) => ({
      status: "pending" as ConsentStatus,
      categories: { ...defaultCategories },
      timestamp: null as number | null,
      version: CONSENT_VERSION,

      acceptAll: () =>
        set({
          status: "accepted",
          categories: { analytics: true, marketing: true, functional: true },
          timestamp: Date.now(),
        }),

      rejectAll: () =>
        set({
          status: "rejected",
          categories: { ...defaultCategories },
          timestamp: Date.now(),
        }),

      customize: (categories: Record<ConsentCategory, boolean>) =>
        set({
          status: "customized",
          categories,
          timestamp: Date.now(),
        }),

      withdrawConsent: () =>
        set({
          status: "pending",
          categories: { ...defaultCategories },
          timestamp: null,
        }),

      isConsentExpired: () => {
        const { timestamp } = get();
        if (timestamp === null) return false;
        return Date.now() - timestamp > CONSENT_EXPIRY_MS;
      },
    }),
    {
      name: "lumeweb-consent",
      version: CONSENT_VERSION,
      migrate: (persistedState: unknown, version: number) => {
        if (version < CONSENT_VERSION) {
          return persistedState;
        }
        return persistedState;
      },
    },
  ),
);

// Cross-tab sync: rehydrate when another tab changes consent
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === "lumeweb-consent") {
      useConsentStore.persist.rehydrate();
    }
  });
}
