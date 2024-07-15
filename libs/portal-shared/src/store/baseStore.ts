import { createStore, StoreApi, useStore } from "zustand";
import { Sdk } from "@lumeweb/portal-sdk";
import { MenuItem } from "@/types";
import { env } from "@/env";

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

export interface BaseState {
  sdk?: Sdk;
  meta?: PortalMeta;
  portalUrl?: string;
  theme: string;
  menuItems: MenuItem[];
}

export interface BaseActions {
  setSdk: (sdk: Sdk) => void;
  setMeta: (meta: PortalMeta) => void;
  portalUrl?: string;
  setTheme: (theme: string) => void;
  setPortalUrl: (portalUrl: string) => void;
  addMenuItem: (item: MenuItem, parentKey?: string) => void;
  removeMenuItem: (key: string) => void;
  getMenuItems: () => MenuItem[];
}

export const baseStore = createStore<BaseState & BaseActions>((set, get) => ({
  sdk: undefined,
  meta: undefined,
  setMeta: (meta) => set({ meta }),
  theme: "theme-eclipse",
  menuItems: [],
  setSdk: (sdk) => set({ sdk }),
  portalUrl: env.VITE_PORTAL_DOMAIN,
  setPortalUrl: (portalUrl) => set({ portalUrl }),
  setTheme: (theme) => set({ theme }),
  addMenuItem: (newItem: MenuItem, parentKey?: string) =>
    set((state) => {
      if (!parentKey) {
        // Check if the item already exists at the root level
        if (!state.menuItems.some((item) => item.key === newItem.key)) {
          return { menuItems: [...state.menuItems, newItem] };
        }
        return state; // If it exists, don't add it again
      }

      const updatedMenuItems = findAndModifyMenuItem(
        state.menuItems,
        parentKey,
        (item) => {
          // Check if the child item already exists
          if (!item.children?.some((child) => child.key === newItem.key)) {
            return {
              ...item,
              children: [...(item.children || []), newItem],
            };
          }
          return item; // If it exists, don't add it again
        },
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
}));

export const useBaseStore = <T>(
  selector: (state: BaseState & BaseActions) => T,
) => useStore(baseStore, selector);

function findAndModifyMenuItem(
  items: MenuItem[],
  key: string,
  modifier: (item: MenuItem) => MenuItem,
): MenuItem[] {
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
}
