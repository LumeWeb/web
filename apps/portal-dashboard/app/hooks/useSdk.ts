import { useEffect, useCallback } from "react";
import usePortalUrl from "./usePortalUrl";
import useAppStore, { AppState } from "~/stores/app.js";
import { Sdk } from "@lumeweb/portal-sdk";
import { useShallow } from "zustand/react/shallow";

export default function useSdk() {
  const portalUrl = usePortalUrl();

  // Memoize the selector function
  const selector = useCallback(
    (state: AppState) => ({
      sdk: state.sdk,
      setSdk: state.setSdk,
    }),
    [],
  );

  const { sdk, setSdk } = useAppStore(useShallow<AppState, AppState>(selector));

  useEffect(() => {
    if (portalUrl) {
      setSdk(Sdk.create(portalUrl));
    }
  }, [portalUrl, setSdk]);

  return sdk;
}
