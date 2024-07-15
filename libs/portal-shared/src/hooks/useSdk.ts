import { useEffect, useRef } from "react";
import usePortalUrl from "libs/portal-shared/src/hooks/usePortalUrl";
import { useBaseStore } from "@/store/baseStore";
import { Sdk } from "@lumeweb/portal-sdk";

// Global flag to ensure SDK is initialized only once across all instances
let isGloballyInitialized = false;

export default function useSdk() {
  const portalUrl = usePortalUrl();
  const { sdk, setSdk } = useBaseStore((state) => ({
    sdk: state.sdk,
    setSdk: state.setSdk,
  }));
  const initializationAttempted = useRef(false);

  useEffect(() => {
    if (
      portalUrl &&
      !isGloballyInitialized &&
      !initializationAttempted.current
    ) {
      initializationAttempted.current = true;
      const initializeSdk = () => {
        if (!isGloballyInitialized) {
          isGloballyInitialized = true;
          const newSdk = Sdk.create(portalUrl);
          setSdk(newSdk);
        }
      };

      initializeSdk();
    }
  }, [portalUrl, setSdk]);

  return sdk;
}
