import { usePortalStore } from "@/store/portalStore";

export function usePortalUrl(): string {
  const portalUrl = usePortalStore((state) => state.portalUrl);
  
  // Ensure valid URL format before returning
  return isValidUrl(portalUrl) ? portalUrl : `https://${portalUrl}`;
}

// Helper function to validate URL format
function isValidUrl(url: string): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
