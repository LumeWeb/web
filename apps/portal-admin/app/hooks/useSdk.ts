import { useEffect, useCallback } from "react";
import usePortalUrl from "./usePortalUrl";
import useAppStore, {
  AppActions,
  AppState,
  SdkActions,
  SdkState,
} from "~/stores/app.js";
import { Sdk } from "@lumeweb/portal-sdk";
import { useShallow } from "zustand/react/shallow";

type SdkStore = SdkState & SdkActions;

export default function useSdk() {
  const portalUrl = usePortalUrl();

  const selector = useCallback(
    (state: SdkStore) => ({
      sdk: state.sdk,
      setSdk: state.setSdk,
    }),
    [],
  );

  const { sdk, setSdk } = useAppStore(useShallow<SdkStore, SdkStore>(selector));

  useEffect(() => {
    if (portalUrl) {
      setSdk(Sdk.create(portalUrl));
    }
  }, [portalUrl]);

  return sdk;
}
