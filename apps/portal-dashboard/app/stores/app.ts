import { createStore } from "zustand/vanilla";
import { Sdk } from "@lumeweb/portal-sdk";
import UploadManager from "~/features/uploadManager/lib/uploadManager";
import BaseService from "~/services/base.js";
import { StoreApi, useStore } from "zustand";
import { env } from "~/env.js";

export interface PortalMeta {
  domain: string;
}

export interface AppState {
  sdk?: Sdk;
  meta?: PortalMeta;
  portalUrl?: string;
  theme: string;
  uploader: UploadManager;
  services: BaseService[];
}

export interface AppActions {
  setSdk: (sdk: Sdk) => void;
  setMeta: (meta: PortalMeta) => void;
  setPortalUrl: (portalUrl: string) => void;
  setTheme: (theme: string) => void;
  addService: (service: BaseService) => void;
  getServices: () => BaseService[];
}

export const appStore = createStore<AppState & AppActions>()((set, get) => {
  return {
    sdk: undefined,
    setSdk: (sdk) => set({ sdk }),
    meta: undefined,
    setMeta: (meta) => set({ meta }),
    theme: "theme-eclipse",
    portalUrl: env.VITE_PORTAL_DOMAIN,
    setPortalUrl: (portalUrl) => set({ portalUrl }),
    setTheme: (theme) => set({ theme }),
    uploader: new UploadManager(),
    services: [],
    addService: (service) => {
      service.register();
      set((state) => ({ services: [...state.services, service] }));
    },
    getServices: () => get().services,
  };
});

const createBoundedUseStore = ((store) => (selector) =>
  useStore(store, selector)) as <S extends StoreApi<unknown>>(
  store: S,
) => {
  (): ExtractState<S>;
  <T>(selector: (state: ExtractState<S>) => T): T;
};

type ExtractState<S> = S extends { getState: () => infer X } ? X : never;

export const useAppStore = createBoundedUseStore(appStore);
