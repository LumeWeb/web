import { useAtom } from "jotai";
import { useEffect } from "react";
import { portalUrlAtom } from "~/atoms/portalUrl";
import fetchPortalMeta from "~/util/fetchPortalMeta.js";

export default function usePortalUrl() {
  let [portalUrl, setPortalUrl] = useAtom(portalUrlAtom);
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
