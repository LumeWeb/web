import { useEffect } from "react";
import fetchPortalMeta from "@/util/fetchPortalMeta";
import { useBaseStore } from "@/store/baseStore";

export default function usePortalUrl() {
  let portalUrl = useBaseStore((state) => state.portalUrl);
  const setPortalUrl = useBaseStore((state) => state.setPortalUrl);
  useEffect(() => {
    fetchPortalMeta(portalUrl).then((data) => {
      if (!portalUrl) {
        setPortalUrl(`https://${data.domain}`);
      }
    });
  }, []);

  if (portalUrl && !portalUrl?.startsWith("http")) {
    portalUrl = `https://${portalUrl}`;
  }

  return portalUrl;
}
