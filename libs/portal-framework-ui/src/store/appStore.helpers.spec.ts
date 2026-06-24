import { createNamespacedId, NavigationItem } from "@lumeweb/portal-framework-core";
import { describe, expect, it } from "vitest";

import { appStore, helpers } from "./appStore";

const CORE_NS = "core";
const core = (name: string) => createNamespacedId(CORE_NS, name);

describe("appStore helpers", () => {
  describe("addMenuItems", () => {
    it("should handle complex nested menu structures correctly", () => {
      // Add parent items first
      appStore.getState().addMenuItems([
        { id: core("parent1"), label: "Parent 1" },
        { id: core("parent2"), label: "Parent 2" },
      ]);

      // Add mixed items with different parent relationships
      appStore.getState().addMenuItems([
        { id: core("child1"), label: "Child 1", parentId: core("parent1") },
        { id: core("child2"), label: "Child 2", parentId: core("parent2") },
        { id: core("grandchild1"), label: "Grandchild 1", parentId: core("child1") }, // Parent doesn't exist yet
        { id: core("root1"), label: "Root 1" },
      ]);

      // Verify initial placement
      const parent1 = helpers.findMenuItem(
        appStore.getState().menuItems,
        core("parent1"),
      );
      const parent2 = helpers.findMenuItem(
        appStore.getState().menuItems,
        core("parent2"),
      );

      expect(parent1?.children).toHaveLength(1);
      expect(parent1?.children?.[0].id).toBe(core("child1"));
      expect(parent2?.children).toHaveLength(1);
      expect(parent2?.children?.[0].id).toBe(core("child2"));
      expect(
        appStore.getState().menuItems.some((item) => item.id === core("root1")),
      ).toBe(true);
      // Grandchild should be under child1 immediately since we process items individually
      const initialChild1 = helpers.findMenuItem(
        appStore.getState().menuItems,
        core("child1"),
      );
      expect(initialChild1?.children).toHaveLength(1);
      expect(initialChild1?.children?.[0].id).toBe(core("grandchild1"));
      expect(
        appStore.getState().menuItems.some((item) => item.id === core("grandchild1")),
      ).toBe(false);

      // Add the missing parent relationship in a second batch
      appStore
        .getState()
        .addMenuItems([
          { id: core("grandchild1"), label: "Grandchild 1", parentId: core("child1") },
        ]);

      // Verify grandchild was moved under child1
      const updatedChild1 = helpers.findMenuItem(
        appStore.getState().menuItems,
        core("child1"),
      );
      expect(updatedChild1?.children).toHaveLength(1);
      expect(updatedChild1?.children?.[0].id).toBe(core("grandchild1"));
      expect(
        appStore.getState().menuItems.some((item) => item.id === core("grandchild1")),
      ).toBe(false);
    });

    it("should add multiple items to the root when no parentKey is provided", () => {
      const itemsToAdd: NavigationItem[] = [
        { id: core("item1"), label: "Item 1" },
        { id: core("item2"), label: "Item 2" },
      ];
      appStore.getState().addMenuItems(itemsToAdd);
      expect(appStore.getState().menuItems).toHaveLength(2);
      expect(appStore.getState().menuItems[0].id).toBe(core("item1"));
      expect(appStore.getState().menuItems[1].id).toBe(core("item2"));
    });

    it("should add multiple items as children to a parent when parentKey is provided", () => {
      appStore.getState().addMenuItem({ id: core("parent"), label: "Parent" });
      const itemsToAdd: NavigationItem[] = [
        { id: core("child1"), label: "Child 1" },
        { id: core("child2"), label: "Child 2" },
      ];
      appStore.getState().addMenuItems(itemsToAdd, core("parent"));
      const parentItem = helpers.findMenuItem(
        appStore.getState().menuItems,
        core("parent"),
      );
      expect(parentItem?.children).toHaveLength(2);
      expect(parentItem?.children?.[0].id).toBe(core("child1"));
      expect(parentItem?.children?.[1].id).toBe(core("child2"));
    });

    it("should handle items with parentId when no parentKey is provided", () => {
      appStore.getState().addMenuItem({ id: core("parent1"), label: "Parent 1" });
      appStore.getState().addMenuItem({ id: core("parent2"), label: "Parent 2" });
      const itemsToAdd: NavigationItem[] = [
        { id: core("child1"), label: "Child 1", parentId: core("parent1") },
        { id: core("child2"), label: "Child 2", parentId: core("parent2") },
        { id: core("root1"), label: "Root 1" },
      ];
      appStore.getState().addMenuItems(itemsToAdd);
      const parent1 = helpers.findMenuItem(
        appStore.getState().menuItems,
        core("parent1"),
      );
      const parent2 = helpers.findMenuItem(
        appStore.getState().menuItems,
        core("parent2"),
      );
      expect(parent1?.children).toHaveLength(1);
      expect(parent1?.children?.[0].id).toBe(core("child1"));
      expect(parent2?.children).toHaveLength(1);
      expect(parent2?.children?.[0].id).toBe(core("child2"));
      expect(
        appStore.getState().menuItems.some((item) => item.id === core("root1")),
      ).toBe(true);
    });

    it("should fall back to root when parentId is not found", () => {
      const itemsToAdd: NavigationItem[] = [
        { id: core("child1"), label: "Child 1", parentId: createNamespacedId(CORE_NS, "nonexistent") },
      ];
      appStore.getState().addMenuItems(itemsToAdd);
      expect(
        appStore.getState().menuItems.some((item) => item.id === core("child1")),
      ).toBe(true);
    });
  });

  const mockMenuItems: NavigationItem[] = [
    { children: [], id: core("dashboard"), label: "Dashboard", path: "/dashboard" },
    {
      children: [
        {
          children: [],
          id: core("profile"),
          label: "Profile",
          path: "/settings/profile",
        },
        {
          children: [],
          id: core("account"),
          label: "Account",
          path: "/settings/account",
        },
      ],
      id: core("settings"),
      label: "Settings",
    },
    { children: [], id: core("plugins"), label: "Plugins" },
  ];

  describe("addItemsToRoot", () => {
    it("should add new items to the root level", () => {
      const existingItems: NavigationItem[] = [
        { id: core("item1"), label: "Item 1" },
      ];
      const newItems: NavigationItem[] = [
        { id: core("item2"), label: "Item 2" },
        { id: core("item3"), label: "Item 3" },
      ];
      const result = helpers.addItemsToRoot(newItems, existingItems);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ id: core("item1"), label: "Item 1" });
      expect(result[1]).toEqual({ children: [], id: core("item2"), label: "Item 2" });
      expect(result[2]).toEqual({ children: [], id: core("item3"), label: "Item 3" });
    });

    it("should not add duplicate items to the root level", () => {
      const existingItems: NavigationItem[] = [
        { id: core("item1"), label: "Item 1" },
      ];
      const newItems: NavigationItem[] = [
        { id: core("item1"), label: "Item 1" }, // Duplicate
        { id: core("item2"), label: "Item 2" },
      ];
      const result = helpers.addItemsToRoot(newItems, existingItems);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: core("item1"), label: "Item 1" });
      expect(result[1]).toEqual({ children: [], id: core("item2"), label: "Item 2" });
    });
  });

  describe("addItemsToChildren", () => {
    it("should add new items to the children of a parent item", () => {
      const parent: NavigationItem = {
        children: [],
        id: core("parent1"),
        label: "Parent 1",
      };
      const newItems: NavigationItem[] = [
        { id: core("child1"), label: "Child 1" },
        { id: core("child2"), label: "Child 2" },
      ];
      const result = helpers.addItemsToChildren(newItems, parent);
      expect(result.children).toHaveLength(2);
      expect(result.children![0]).toEqual({
        children: [],
        id: core("child1"),
        label: "Child 1",
      });
      expect(result.children![1]).toEqual({
        children: [],
        id: core("child2"),
        label: "Child 2",
      });
    });

    it("should not add duplicate items to the children of a parent item", () => {
      const parent: NavigationItem = {
        children: [{ id: core("child1"), label: "Child 1" }],
        id: core("parent1"),
        label: "Parent 1",
      };
      const newItems: NavigationItem[] = [
        { id: core("child1"), label: "Child 1" }, // Duplicate
        { id: core("child2"), label: "Child 2" },
      ];
      const result = helpers.addItemsToChildren(newItems, parent);
      expect(result.children).toHaveLength(2);
      expect(result.children![0]).toEqual({ id: core("child1"), label: "Child 1" });
      expect(result.children![1]).toEqual({
        children: [],
        id: core("child2"),
        label: "Child 2",
      });
    });
  });

  describe("findMenuItem", () => {
    it("should find a menu item by ID in a flat structure", () => {
      const items: NavigationItem[] = [
        { id: core("item1"), label: "Item 1" },
        { id: core("item2"), label: "Item 2" },
      ];
      const result = helpers.findMenuItem(items, core("item2"));
      expect(result).toEqual({ id: core("item2"), label: "Item 2" });
    });

    it("should find a menu item by ID in a nested structure", () => {
      const items: NavigationItem[] = [
        {
          children: [{ id: core("item2"), label: "Item 2" }],
          id: core("item1"),
          label: "Item 1",
        },
      ];
      const result = helpers.findMenuItem(items, core("item2"));
      expect(result).toEqual({ id: core("item2"), label: "Item 2" });
    });

    it("should return undefined if the menu item is not found", () => {
      const items: NavigationItem[] = [{ id: core("item1"), label: "Item 1" }];
      const result = helpers.findMenuItem(items, core("item2"));
      expect(result).toBeUndefined();
    });
  });

  describe("findAndModifyMenuItem", () => {
    it("should modify a root level item", () => {
      const modifier = (item: NavigationItem) => ({
        ...item,
        label: "Modified Dashboard",
      });
      const result = helpers.findAndModifyMenuItem(
        [...mockMenuItems],
        core("dashboard"),
        modifier,
      );
      expect(result).toHaveLength(3);
      const modifiedItem = result.find((item: NavigationItem) => item.id === core("dashboard"));
      expect(modifiedItem?.label).toBe("Modified Dashboard");
    });

    it("should modify a nested item", () => {
      const modifier = (item: NavigationItem) => ({
        ...item,
        label: "Modified Profile",
      });
      const result = helpers.findAndModifyMenuItem(
        [...mockMenuItems],
        core("profile"),
        modifier,
      );
      expect(result).toHaveLength(3);
      const settingsItem = result.find((item: NavigationItem) => item.id === core("settings"));
      expect(settingsItem?.children).toBeDefined();
      expect(settingsItem?.children).toHaveLength(2);
      const modifiedChild = settingsItem?.children!.find(
        (item: NavigationItem) => item.id === core("profile"),
      );
      expect(modifiedChild?.label).toBe("Modified Profile");
      const otherChild = settingsItem?.children!.find(
        (item: NavigationItem) => item.id === core("account"),
      );
      expect(otherChild?.label).toBe("Account"); // Ensure other children are untouched
    });

    it("should return the original array if no item is found", () => {
      const modifier = (item: NavigationItem) => ({
        ...item,
        label: "Should Not Happen",
      });
      const originalItems = [...mockMenuItems];
      const result = helpers.findAndModifyMenuItem(
        originalItems,
        core("non-existent"),
        modifier,
      );
      expect(result).toBe(originalItems); // Should return the exact same array reference for efficiency
    });

    it("should return the original array if no modification occurs in children", () => {
      const modifier = (item: NavigationItem) => item; // Modifier that does nothing
      const originalItems = [...mockMenuItems];
      const result = helpers.findAndModifyMenuItem(
        originalItems,
        core("non-existent-child"),
        modifier,
      );
      expect(result).toBe(originalItems); // Should return the exact same array reference
    });

    it("should return a new array if modification occurs in children", () => {
      const modifier = (item: NavigationItem) => ({
        ...item,
        label: "Modified Profile",
      });
      const originalItems = [...mockMenuItems];
      const result = helpers.findAndModifyMenuItem(
        originalItems,
        core("profile"),
        modifier,
      );
      expect(result).not.toBe(originalItems); // Should return a new array reference
      const settingsItem = result.find((item: NavigationItem) => item.id === core("settings"));
      const originalSettingsItem = originalItems.find(
        (item: NavigationItem) => item.id === core("settings"),
      );
      expect(settingsItem).not.toBe(originalSettingsItem); // The parent should also be a new object
      expect(settingsItem?.children).not.toBe(originalSettingsItem?.children); // The children array should be new
    });
  });

  describe("removeItemFromMenu", () => {
    it("should remove a root level item", () => {
      const result = helpers.removeItemFromMenu(
        [...mockMenuItems],
        core("dashboard"),
      );
      expect(result).toHaveLength(2);
      expect(result.find((item: NavigationItem) => item.id === core("dashboard"))).toBeUndefined();
      expect(result.find((item: NavigationItem) => item.id === core("settings"))).toBeDefined();
      expect(result.find((item: NavigationItem) => item.id === core("plugins"))).toBeDefined();
    });

    it("should remove a nested item", () => {
      const result = helpers.removeItemFromMenu([...mockMenuItems], core("profile"));
      expect(result).toHaveLength(3); // Root level items remain
      const settingsItem = result.find((item: NavigationItem) => item.id === core("settings"));
      expect(settingsItem?.children).toBeDefined();
      expect(settingsItem?.children).toHaveLength(1); // One child removed
      expect(
        settingsItem?.children!.find((item: NavigationItem) => item.id === core("profile")),
      ).toBeUndefined();
      expect(
        settingsItem?.children!.find((item: NavigationItem) => item.id === core("account")),
      ).toBeDefined(); // Other child remains
    });

    it("should return the original array if key is not found", () => {
      const originalItems = [...mockMenuItems];
      const result = helpers.removeItemFromMenu(originalItems, core("non-existent"));
      expect(result).toBe(originalItems); // Should return the exact same array reference for efficiency
    });

    it("should return the original array if key is not found in children", () => {
      const originalItems = [...mockMenuItems];
      const result = helpers.removeItemFromMenu(
        originalItems,
        core("non-existent-child"),
      );
      expect(result).toBe(originalItems); // Should return the exact same array reference
    });

    it("should return a new array if an item is removed from children", () => {
      const originalItems = [...mockMenuItems];
      const result = helpers.removeItemFromMenu(originalItems, core("profile"));
      expect(result).not.toBe(originalItems); // Should return a new array reference
      const settingsItem = result.find((item: NavigationItem) => item.id === core("settings"));
      const originalSettingsItem = originalItems.find(
        (item: NavigationItem) => item.id === core("settings"),
      );
      expect(settingsItem).not.toBe(originalSettingsItem); // The parent should also be a new object
      expect(settingsItem?.children).not.toBe(originalSettingsItem?.children); // The children array should be new
    });
  });
});
