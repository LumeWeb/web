import { useAppStore } from "@/store/appStore";

export function usePortalMeta() {
  // This hook now only reads the meta state from the store.
  return useAppStore((state) => state.meta);
}
