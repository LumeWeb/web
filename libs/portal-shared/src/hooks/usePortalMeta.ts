import { useEffect } from "react";
import fetchPortalMeta from "@/util/fetchPortalMeta";
import usePortalUrl from "@/hooks/usePortalUrl";
import { useBaseStore } from "@/store/baseStore";

export default function usePortalMeta() {
  const portalUrl = usePortalUrl();
  const portalMeta = useBaseStore((state) => state.meta);
  const setPortalMeta = useBaseStore((set) => set.setMeta);
  useEffect(() => {
    fetchPortalMeta(portalUrl).then((data) => {
      setPortalMeta(data);
    });
  }, [portalUrl]);

  return portalMeta;
}
