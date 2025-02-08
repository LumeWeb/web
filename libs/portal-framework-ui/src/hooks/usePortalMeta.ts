import { usePortalStore } from "@/store/portalStore";

export function usePortalMeta() {
  // This hook now only reads the meta state from the store.
  // The fetching logic has been moved to usePortalUrl.
  return usePortalStore((state) => state.meta);
}
