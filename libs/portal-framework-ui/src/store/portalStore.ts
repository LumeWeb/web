import type { PortalMeta } from "@lumeweb/portal-framework-core";
import { derive } from "derive-zustand";
import { useStore } from "zustand";
import { shallow } from "zustand/shallow";
import { useStoreWithEqualityFn } from "zustand/traditional";

import { appStore } from "./appStore";

export interface PortalActions {
  setIsMetaLoading: (isMetaLoading: boolean) => void;
  setMeta: (meta: PortalMeta | undefined) => void;
  setPortalUrl: (portalUrl: string) => void;
  setSdk: (sdk: any) => void;
}

export interface PortalState {
  isMetaLoading: boolean;
  meta: PortalMeta | undefined;
  portalUrl: string;
  sdk: any;
}

// Re-export portal state selectors/actions from the unified appStore.
export const portalStore = appStore;

// Export actions separately for hooks that only need actions
export const usePortalActions = () => {
  return useStoreWithEqualityFn(
    appStore,
    (state) => ({
      setIsMetaLoading: state.setIsMetaLoading,
      setMeta: state.setMeta,
      setPortalUrl: state.setPortalUrl,
      setSdk: state.setSdk,
    }),
    shallow,
  );
};

// Hook to select state from the portal store
export const usePortalStore = <T>(
  selector: (state: PortalState) => T,
  equalityFn: (a: T, b: T) => boolean = shallow,
): T => {
  return useStoreWithEqualityFn(
    appStore,
    (state) => selector(state as unknown as PortalState),
    equalityFn,
  );
};

// Effect to sync framework state with the portal store
export function useFrameworkSync() {
  return undefined;
}

// Main hook to use the portal store state and actions
export const usePortal = <T>(
  selector: (state: PortalState) => T,
  equalityFn?: (a: T, b: T) => boolean,
): PortalActions & T => {
  const state = usePortalStore(selector, equalityFn);
  const actions = usePortalActions();
  return { ...state, ...actions };
};

// Create a derived store for the portal metadata
export const metaStore = derive<PortalMeta | undefined>((get) => {
  const portalState = get(appStore);
  const portalUrl = portalState.portalUrl;
  const isMetaLoading = portalState.isMetaLoading;

  if (!portalUrl || isMetaLoading) {
    return undefined;
  }

  return portalState.meta;
});

export const useMetaStore = () => useStore(metaStore);
