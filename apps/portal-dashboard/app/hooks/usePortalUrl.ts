import { useEffect } from "react";
import fetchPortalMeta from "@/util/fetchPortalMeta.js";
import { useAppStore } from "@/stores/app.js";

export default function usePortalUrl() {
  let portalUrl = useAppStore((state) => state.portalUrl);
  const setPortalUrl = useAppStore((state) => state.setPortalUrl);
  useEffect(() => {
    fetchPortalMeta(portalUrl).then((data) => {
      if (!portalUrl) {
        setPortalUrl(`https://${data.domain}`);
      }
    });
  }, []);

  if (!portalUrl?.startsWith("http")) {
    portalUrl = `https://${portalUrl}`;
  }

  return portalUrl;
}
