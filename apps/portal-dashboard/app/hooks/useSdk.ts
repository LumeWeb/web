import { useEffect } from "react";
import usePortalUrl from "./usePortalUrl";
import { useAppStore } from "@/stores/app.js";
import { Sdk } from "@lumeweb/portal-sdk";

export default function useSdk() {
  const portalUrl = usePortalUrl();

  const sdk = useAppStore((state) => state.sdk);
  const setSdk = useAppStore((state) => state.setSdk);

  useEffect(() => {
    if (portalUrl) {
      setSdk(Sdk.create(portalUrl));
    }
  }, [portalUrl]);

  return sdk;
}
