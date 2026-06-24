import {
  CORE_NS,
  createNamespacedId,
  type Framework,
  type NamespacedId,
  NavigationFeature,
  type NavigationItem,
  type PortalMeta,
  type RouteDefinition,
} from "@lumeweb/portal-framework-core";

import { createStore, useStore } from "zustand";

export interface AppActions {
  addMenuItem: (item: NavigationItem, parentKey?: NamespacedId) => void;
  addMenuItems: (items: NavigationItem[], parentKey?: NamespacedId) => void;
  removeMenuItem: (key: NamespacedId) => void;
  setError: (error: Error | null) => void;
  setFramework: (framework: Framework) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsMetaLoading: (isMetaLoading: boolean) => void;
  setMenuItems: (items: NavigationItem[]) => void;
  setMeta: (meta: PortalMeta | undefined) => void;
  setPluginConfigs: (configs: Record<string, any>[]) => void;
  setPortalUrl: (portalUrl: string) => void;
  setRoutes: (routes: RouteDefinition[]) => void;
  setSdk: (sdk: any) => void;
  syncFromFramework: () => Promise<void>;
}

const emptyFrameworkFeatureId = createNamespacedId(CORE_NS, "navigation");

export interface AppState {
  error: Error | null;
  framework: Framework | null;
  isLoading: boolean;
  isMetaLoading: boolean;
  menuItems: NavigationItem[];
  meta?: PortalMeta;
  pluginConfigs: Record<string, any>[];
  portalUrl: string;
  routes: RouteDefinition[];
  sdk: any;
}

const navigationFeatureId = createNamespacedId(CORE_NS, "navigation");

export const helpers = {
  /**
   * Adds new items as children to a parent menu item, replacing any child with
   * the same ID.
   * @param newItems The array of NavigationItems to add.
   * @param parent The parent NavigationItem to add the items to.
   * @returns A new parent item with the new items added or replaced as children.
   */
  addItemsToChildren: (
    newItems: NavigationItem[],
    parent: NavigationItem,
  ): NavigationItem => {
    let children = [...(parent.children || [])];

    for (const newItem of newItems) {
      const index = children.findIndex(
        (item) => item.id && item.id === newItem.id,
      );

      const child = { ...newItem, children: newItem.children || [] };
      // Only prefix path if:
      // 1. Parent has a path
      // 2. Child has a path
      // 3. Child path isn't already absolute (doesn't start with /)
      if (parent.path && child.path && !child.path.startsWith("/")) {
        // Ensure parent path doesn't end with / and child path doesn't start with /
        const parentPath = parent.path.endsWith("/")
          ? parent.path.slice(0, -1)
          : parent.path;
        const childPath = child.path.startsWith("/")
          ? child.path.slice(1)
          : child.path;
        child.path = `${parentPath}/${childPath}`;
      }

      if (index === -1) {
        children = [...children, child];
      } else {
        children = [...children.slice(0, index), child, ...children.slice(index + 1)];
      }
    }

    return { ...parent, children };
  },

  /**
   * Adds new items to the root level of the menu, replacing any existing item
   * with the same ID.
   * @param newItems The array of NavigationItems to add.
   * @param existingItems The existing array of NavigationItems.
   * @returns a new array with the new items added or replaced.
   */
  addItemsToRoot: (
    newItems: NavigationItem[],
    existingItems: NavigationItem[],
  ): NavigationItem[] => {
    let result = [...existingItems];

    for (const newItem of newItems) {
      const index = result.findIndex((item) => item.id === newItem.id);
      const normalizedItem = {
        ...newItem,
        children: newItem.children || [],
      };

      if (index === -1) {
        result = [...result, normalizedItem];
      } else {
        result = [
          ...result.slice(0, index),
          normalizedItem,
          ...result.slice(index + 1),
        ];
      }
    }

    return result;
  },

  // Helper to find and modify a menu item recursively
  findAndModifyMenuItem: (
    items: NavigationItem[],
    key: NamespacedId,
    modifier: (item: NavigationItem) => NavigationItem,
  ): NavigationItem[] => {
    let changed = false;

    const newItems = items.map((item) => {
      if (item.id === key) {
        changed = true;
        return modifier(item);
      }

      if (item.children) {
        const updatedChildren = helpers.findAndModifyMenuItem(
          item.children,
          key,
          modifier,
        );
        if (updatedChildren !== item.children) {
          changed = true;
          return {
            ...item,
            children: updatedChildren,
          };
        }
      }

      return item;
    });

    return changed ? newItems : items;
  },

  /**
   * Finds a menu item by its ID in a flat or nested menu structure.
   * @param items The array of NavigationItems to search.
   * @param id The ID of the item to find.
   * @returns The NavigationItem if found, otherwise undefined.
   */
  findMenuItem: (
    items: NavigationItem[],
    id: NamespacedId,
  ): NavigationItem | undefined => {
    for (const item of items) {
      if (item.id === id) {
        return item;
      }
      if (item.children) {
        const found = helpers.findMenuItem(item.children, id);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  },

  // Immutable helper for removing items recursively
  removeItemFromMenu: (
    items: NavigationItem[],
    key: NamespacedId,
  ): NavigationItem[] => {
    let removed = false;

    const newItems = items
      .map((item) => {
        if (item.children) {
          const updatedChildren = helpers.removeItemFromMenu(
            item.children,
            key,
          );
          if (updatedChildren !== item.children) {
            removed = true;
            return { ...item, children: [...updatedChildren] };
          }
        }
        return item;
      })
      .filter((item) => {
        if (item.id === key) {
          removed = true;
          return false;
        }
        return true;
      });

    return removed ? newItems : items;
  },
};

export const appStore = createStore<AppActions & AppState>((set, get) => ({
  addMenuItem: (newItem: NavigationItem, parentKey?: NamespacedId) =>
    set((state) => {
      if (parentKey) {
        const parent = helpers.findMenuItem(state.menuItems, parentKey);
        if (parent) {
          return {
            menuItems: helpers.findAndModifyMenuItem(
              state.menuItems,
              parentKey,
              (parent) => helpers.addItemsToChildren([newItem], parent),
            ),
          };
        } else {
          return {
            menuItems: helpers.addItemsToRoot([newItem], state.menuItems),
          };
        }
      } else {
        return {
          menuItems: helpers.addItemsToRoot([newItem], state.menuItems),
        };
      }
    }),

  addMenuItems: (items: NavigationItem[], parentKey?: NamespacedId) =>
    set((state) => {
      let newMenuItems = [...state.menuItems];

      // First pass: Add all items that have no parentId
      const itemsWithoutParents = items.filter((item) => !item.parentId);
      if (itemsWithoutParents.length > 0) {
        newMenuItems = helpers.addItemsToRoot(
          itemsWithoutParents,
          newMenuItems,
        );
      }

      // Second pass: Add items with parentId or parentKey
      const itemsWithParents = items.filter(
        (item) => item.parentId || parentKey,
      );
      for (const item of itemsWithParents) {
        const targetParentKey = parentKey ?? item.parentId;
        if (targetParentKey) {
          const parent = helpers.findMenuItem(newMenuItems, targetParentKey);
          if (parent) {
            newMenuItems = helpers.findAndModifyMenuItem(
              newMenuItems,
              targetParentKey,
              (parent) => helpers.addItemsToChildren([item], parent),
            );
            // Remove any root-level items that were successfully added to parent
            newMenuItems = newMenuItems.filter((i) => i.id !== item.id);
          } else {
            // Parent not found, add to root
            newMenuItems = helpers.addItemsToRoot([item], newMenuItems);
          }
        }
      }

      return { menuItems: newMenuItems };
    }),
  error: null,
  framework: null,
  isLoading: false,
  isMetaLoading: false,
  menuItems: [],
  pluginConfigs: [],
  portalUrl: "",
  removeMenuItem: (key: NamespacedId) =>
    set((state) => {
      return { menuItems: helpers.removeItemFromMenu(state.menuItems, key) };
    }),
  routes: [],
  setError: (error) => set({ error }),
  setFramework: (framework) => set({ framework }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsMetaLoading: (isMetaLoading) => set({ isMetaLoading }),
  setMenuItems: (items) => set({ menuItems: items }),
  setMeta: (meta) => set({ meta }),
  setPluginConfigs: (pluginConfigs) => set({ pluginConfigs }),
  setPortalUrl: (portalUrl) => set({ portalUrl }),
  setRoutes: (routes) => set({ routes }),
  setSdk: (sdk) => set({ sdk }),
  sdk: null,
  syncFromFramework: async () => {
    const framework = get().framework;
    if (!framework) {
      return;
    }

    const navigationFeature = await framework.getFeature<NavigationFeature>(
      navigationFeatureId,
    );

    if (!navigationFeature) {
      return;
    }

    const [routes, menuItems] = await Promise.all([
      navigationFeature.getRoutes(),
      navigationFeature.getNavigation(),
    ]);

    set({ menuItems, routes });
  },
}));

export const useAppStore = <T>(selector: (state: AppActions & AppState) => T) =>
  useStore(appStore, selector);
