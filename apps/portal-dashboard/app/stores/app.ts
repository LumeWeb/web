import { createStore } from "zustand/vanilla";
import { Sdk } from "@lumeweb/portal-sdk";
import UploadManager from "@/features/uploadManager/lib/uploadManager";
import BaseService from "@/services/base.js";
import { StoreApi, useStore } from "zustand";
import { env } from "@/env.js";
import { MenuItem } from "@/types.js";
import { menuConfig } from "@/menuConfig.js";

export interface PortalMeta {
  domain: string;
  plugins: PortalMetaPlugins;
  feature_flags: Record<string, boolean>;
}

export type PortalMetaPlugins = Record<string, PortalMetaPlugin>;

type PortalPluginMeta = Record<string, any>;

export interface PortalMetaPlugin {
  meta: PortalPluginMeta;
}
export interface AppState {
  sdk?: Sdk;
  meta?: PortalMeta;
  portalUrl?: string;
  theme: string;
  uploader: UploadManager;
  services: BaseService[];
  menuItems: MenuItem[];
}

export interface AppActions {
  setSdk: (sdk: Sdk) => void;
  setMeta: (meta: PortalMeta) => void;
  setPortalUrl: (portalUrl: string) => void;
  setTheme: (theme: string) => void;
  addService: (service: BaseService) => void;
  getServices: () => BaseService[];
  getServiceById: <S extends BaseService = BaseService>(
    id: string,
  ) => S | undefined;
  resetServices: () => void;
  addMenuItem: (item: MenuItem, parentKey?: string) => void;
  removeMenuItem: (key: string) => void;
  getMenuItems: () => MenuItem[];
}

const findAndModifyMenuItem = (
  items: MenuItem[],
  key: string,
  modifier: (item: MenuItem) => MenuItem,
): MenuItem[] => {
  return items.map((item) => {
    if (item.key === key) {
      return modifier(item);
    }
    if (item.children) {
      return {
        ...item,
        children: findAndModifyMenuItem(item.children, key, modifier),
      };
    }
    return item;
  });
};

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
    menuItems: menuConfig,
    addService: (service) => {
      service.register();
      set((state) => ({ services: [...state.services, service] }));
    },
    getServices: () => get().services,
    getServiceById: <S extends BaseService = BaseService>(
      id: string,
    ): S | undefined => get().services.find((svc): svc is S => svc.id() === id),
    resetServices: () => set({ services: [] }),
    addMenuItem: (newItem: MenuItem, parentKey?: string) =>
      set((state) => {
        if (!parentKey) {
          return { menuItems: [...state.menuItems, newItem] };
        }

        const updatedMenuItems = findAndModifyMenuItem(
          state.menuItems,
          parentKey,
          (item) => ({
            ...item,
            children: [...(item.children || []), newItem],
          }),
        );

        return { menuItems: updatedMenuItems };
      }),

    removeMenuItem: (key: string) =>
      set((state) => {
        const removeItem = (items: MenuItem[]): MenuItem[] =>
          items.filter((item) => {
            if (item.key === key) return false;
            if (item.children) {
              item.children = removeItem(item.children);
            }
            return true;
          });

        return { menuItems: removeItem(state.menuItems) };
      }),
    getMenuItems: () => get().menuItems,
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
