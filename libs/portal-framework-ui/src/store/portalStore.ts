import {
  env,
  type PortalMeta,
  useFramework,
} from "@lumeweb/portal-framework-core";
import { Sdk } from "@lumeweb/portal-sdk";
import { derive } from "derive-zustand";
import { useEffect } from "react";
import { createStore, useStore } from "zustand";
import { shallow } from "zustand/shallow";
import { useStoreWithEqualityFn } from "zustand/traditional";

export interface PortalActions {
  setIsMetaLoading: (isMetaLoading: boolean) => void;
  setMeta: (meta: PortalMeta | undefined) => void;
  setPortalUrl: (portalUrl: string) => void;
  setSdk: (sdk: null | Sdk) => void;
}

export interface PortalState {
  isMetaLoading: boolean;
  meta: PortalMeta | undefined;
  portalUrl: string;
  sdk: null | Sdk;
}

type PortalStore = PortalActions & PortalState;

export const portalStore = createStore<PortalStore>((set) => ({
  isMetaLoading: false,
  meta: undefined,
  portalUrl: env.VITE_PORTAL_DOMAIN ?? "",
  sdk: null,
  setIsMetaLoading: (isMetaLoading: boolean) => set({ isMetaLoading }),
  setMeta: (meta: PortalMeta | undefined) => set({ meta }),
  setPortalUrl: (portalUrl: string) => set({ portalUrl }),
  setSdk: (sdk: null | Sdk) => set({ sdk }),
}));

// Export actions separately for hooks that only need actions
export const usePortalActions = () => {
  return useStoreWithEqualityFn(
    portalStore,
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
  return useStoreWithEqualityFn(portalStore, selector, equalityFn);
};

// Effect to sync framework state with the portal store
export const useFrameworkSync = () => {
  const framework = useFramework();
  const actions = usePortalActions();

  useEffect(() => {
    if (!framework) return;
    if (!framework?.framework) return;

    // Initial sync
    // Read directly from the framework instance
    if (framework?.framework) {
      actions.setPortalUrl(framework.framework.portalUrl);
    }

    if (framework?.framework?.meta) {
      actions.setMeta(framework.framework.meta);
    }
  }, [framework?.framework, actions]);
};

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
  const portalUrl = get(portalStore).portalUrl;
  const isMetaLoading = get(portalStore).isMetaLoading;

  if (!portalUrl || isMetaLoading) {
    return undefined;
  }

  return get(portalStore).meta;
});

export const useMetaStore = () => useStore(metaStore);
