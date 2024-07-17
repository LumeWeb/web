import useAppStore from "~/stores/app.js";
import { useEffect } from "react";
import fetchPortalMeta from "~/util/fetchPortalMeta.js";
import usePortalUrl from "~/hooks/usePortalUrl.js";

export default function usePortalMeta() {
  const portalUrl = usePortalUrl();
  const setPortalMeta = useAppStore((set) => set.setMeta);
  const portalMeta = useAppStore((set) => set.meta);
  useEffect(() => {
    fetchPortalMeta(portalUrl).then((data) => {
      setPortalMeta(data);
    });
  }, [portalUrl]);

  return portalMeta;
}
