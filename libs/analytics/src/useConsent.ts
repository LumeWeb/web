import { useStore } from "zustand";
import { useConsentStore } from "./consentStore";
import type { ConsentState } from "./consentStore";

export function useConsent(): ConsentState {
  return useStore(useConsentStore);
}
