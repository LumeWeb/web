import { create } from "zustand";
import { Sdk } from "@lumeweb/portal-sdk";

interface PortalMeta {
  domain: string;
}

export interface SdkState {
  sdk?: Sdk;
}

export interface SdkActions {
  setSdk: (sdk: Sdk) => void;
}

export interface PortalMetaState {
  meta?: PortalMeta;
}

export type AppState = SdkState & PortalMetaState & PortalThemeState;

export interface PortalMetaActions {
  setMeta: (meta: PortalMeta) => void;
}

export interface PortalThemeState {
  theme: string;
}

export interface PortalThemeActions {
  setTheme: (theme: string) => void;
}

export type AppActions = SdkActions & PortalMetaActions & PortalThemeActions;

const useAppStore = create<AppState & AppActions>()((set) => ({
  sdk: undefined,
  setSdk: (sdk) => set({ sdk }),
  meta: undefined,
  setMeta: (meta) => set({ meta }),
  theme: "theme-eclipse",
  setTheme: (theme) => set({ theme }),
}));

export default useAppStore;
