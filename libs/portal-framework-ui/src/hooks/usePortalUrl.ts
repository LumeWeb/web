import type { PortalMeta } from "@lumeweb/portal-framework-core";
import { fetchPortalMeta, getCurrentLocation } from "@lumeweb/portal-framework-core";
import { useEffect, useRef } from "react";

import { useAppStore } from "@/store/appStore";

export function usePortalUrl(): string {
  const portalUrl = useAppStore((state) => state.portalUrl);
  const setPortalUrl = useAppStore((state) => state.setPortalUrl);
  const setMeta = useAppStore((state) => state.setMeta);
  const setIsMetaLoading = useAppStore((state) => state.setIsMetaLoading);

  const initialFetchAttempted = useRef(false);

  useEffect(() => {
    let abortController: AbortController | undefined;

    async function fetchMeta(effectiveUrl: string | undefined) {
      setIsMetaLoading(true);
      abortController = new AbortController();
      try {
        const meta = await fetchPortalMeta(effectiveUrl, {
          signal: abortController.signal,
        });
        if (!meta?.domain) {
          setPortalUrl(getCurrentLocation().origin);
          setMeta(meta);
        } else {
          setPortalUrl(`https://${meta.domain}`);
          setMeta(meta);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        if (!isValidUrl(portalUrl)) {
          setPortalUrl(getCurrentLocation().origin);
        }
        setMeta(undefined);
        console.error("Error fetching portal meta from", effectiveUrl, err);
      } finally {
        setIsMetaLoading(false);
        abortController = undefined;
      }
    }

    if (initialFetchAttempted.current) {
      return;
    }

    initialFetchAttempted.current = true;
    const effectiveUrl = isValidUrl(portalUrl) ? portalUrl : undefined;
    fetchMeta(effectiveUrl);

    return () => {
      abortController?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
