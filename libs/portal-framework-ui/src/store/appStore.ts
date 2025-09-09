import type {
  NavigationItem,
  RouteDefinition,
} from "@lumeweb/portal-framework-core";

import { createStore, useStore } from "zustand";

interface AppActions {
  addMenuItem: (item: NavigationItem, parentKey?: string) => void;
  addMenuItems: (items: NavigationItem[], parentKey?: string) => void;
  removeMenuItem: (key: string) => void;
  setError: (error: Error | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setPluginConfigs: (configs: Record<string, any>[]) => void;
  setRoutes: (routes: RouteDefinition[]) => void;
}

interface AppState {
  error: Error | null;
  isLoading: boolean;
  menuItems: NavigationItem[];
  pluginConfigs: Record<string, any>[];
  routes: RouteDefinition[];
}

// Define helpers outside the store creation
export const helpers = {
  /**
   * Adds new items as children to a parent menu item, preventing duplicates by ID.
   * @param newItems The array of NavigationItems to add.
   * @param parent The parent NavigationItem to add the items to.
   * @returns A new array with the new items added as children to the parent.
   */
  addItemsToChildren: (
    newItems: NavigationItem[],
    parent: NavigationItem,
  ): NavigationItem => {
    const existingChildIds = new Set(
      parent.children?.map((item) => item.id).filter(Boolean),
    );
    const itemsToAdd = newItems.filter(
      (item) => item.id && !existingChildIds.has(item.id),
    );
    const newChildren = [
      ...(parent.children || []),
      ...itemsToAdd.map((item) => {
        const child = { ...item, children: item.children || [] };
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
        return child;
      }),
    ];
    return { ...parent, children: newChildren };
  },

  /**
   * Adds new items to the root level of the menu, preventing duplicates by ID.
   * @param newItems The array of NavigationItems to add.
   * @param existingItems The existing array of NavigationItems.
   * @returns a new array with the new items added.
   */
  addItemsToRoot: (
    newItems: NavigationItem[],
    existingItems: NavigationItem[],
  ): NavigationItem[] => {
    // Filter out duplicate IDs within newItems
    const newItemsFiltered = newItems.filter(
      (item, index, self) =>
        item.id && self.findIndex((i) => i.id === item.id) === index,
    );

    const existingIds = new Set(
      existingItems.map((item) => item.id).filter(Boolean),
    );
    const itemsToAdd = newItemsFiltered.filter(
      (item) => item.id && !existingIds.has(item.id),
    );
    return [
      ...existingItems,
      ...itemsToAdd.map((item) => ({ ...item, children: item.children || [] })),
    ];
  },

  // Helper to find and modify a menu item recursively
  findAndModifyMenuItem: (
    items: NavigationItem[],
    key: string,
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
    id: string,
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
    key: string,
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

export const appStore = createStore<AppActions & AppState>((set) => ({
  addMenuItem: (newItem: NavigationItem, parentKey?: string) =>
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

  addMenuItems: (items: NavigationItem[], parentKey?: string) =>
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
  isLoading: false,
  menuItems: [],
  pluginConfigs: [],
  removeMenuItem: (key: string) =>
    set((state) => {
      return { menuItems: helpers.removeItemFromMenu(state.menuItems, key) };
    }),
  routes: [],
  setError: (error) => set({ error }),
  setIsLoading: (isLoading) => set({ isLoading }),

  setPluginConfigs: (pluginConfigs) => set({ pluginConfigs }),

  setRoutes: (routes) => set({ routes }),
}));

export const useAppStore = <T>(selector: (state: AppActions & AppState) => T) =>
  useStore(appStore, selector);
