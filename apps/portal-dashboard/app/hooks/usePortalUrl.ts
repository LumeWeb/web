import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { env } from "~/env.js";

const portalAtom = atom(env.VITE_PORTAL_URL);

export default function usePortalUrl() {
  const [portalUrl, setPortalUrl] = useAtom(portalAtom);
  useEffect(() => {
    if (!portalUrl) {
      fetch("/api/meta")
        .then((response) => response.json())
        .then((data) => {
          setPortalUrl(`https://${data.domain}`);
        })
        .catch((error) => {
          console.error("Failed to fetch portal url:", error);
        });
    }
  }, []);

  return portalUrl;
}
