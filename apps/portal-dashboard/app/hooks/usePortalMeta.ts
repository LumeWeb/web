import { useAppStore } from "~/stores/app.js";
import { useEffect } from "react";
import fetchPortalMeta from "~/util/fetchPortalMeta";
import usePortalUrl from "~/hooks/usePortalUrl";

export default function usePortalMeta() {
  const portalUrl = usePortalUrl();
  const portalMeta = useAppStore((state) => state.meta);
  const setPortalMeta = useAppStore((set) => set.setMeta);
  useEffect(() => {
    fetchPortalMeta(portalUrl).then((data) => {
      setPortalMeta(data);
    });
  }, [portalUrl]);

  return portalMeta;
}
