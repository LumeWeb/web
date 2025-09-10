import { NavigationItem } from "@lumeweb/portal-framework-core";
import { describe, expect, it } from "vitest";

import { appStore, helpers } from "./appStore";

describe("appStore helpers", () => {
  describe("addMenuItems", () => {
    it("should handle complex nested menu structures correctly", () => {
      // Add parent items first
      appStore.getState().addMenuItems([
        { id: "parent1", label: "Parent 1" },
        { id: "parent2", label: "Parent 2" },
      ]);

      // Add mixed items with different parent relationships
      appStore.getState().addMenuItems([
        { id: "child1", label: "Child 1", parentId: "parent1" },
        { id: "child2", label: "Child 2", parentId: "parent2" },
        { id: "grandchild1", label: "Grandchild 1", parentId: "child1" }, // Parent doesn't exist yet
        { id: "root1", label: "Root 1" },
      ]);

      // Verify initial placement
      const parent1 = helpers.findMenuItem(
        appStore.getState().menuItems,
        "parent1",
      );
      const parent2 = helpers.findMenuItem(
        appStore.getState().menuItems,
        "parent2",
      );

      expect(parent1?.children).toHaveLength(1);
      expect(parent1?.children?.[0].id).toBe("child1");
      expect(parent2?.children).toHaveLength(1);
      expect(parent2?.children?.[0].id).toBe("child2");
      expect(
        appStore.getState().menuItems.some((item) => item.id === "root1"),
      ).toBe(true);
      // Grandchild should be under child1 immediately since we process items individually
      const initialChild1 = helpers.findMenuItem(
        appStore.getState().menuItems,
        "child1",
      );
      expect(initialChild1?.children).toHaveLength(1);
      expect(initialChild1?.children?.[0].id).toBe("grandchild1");
      expect(
        appStore.getState().menuItems.some((item) => item.id === "grandchild1"),
      ).toBe(false);

      // Add the missing parent relationship in a second batch
      appStore
        .getState()
        .addMenuItems([
          { id: "grandchild1", label: "Grandchild 1", parentId: "child1" },
        ]);

      // Verify grandchild was moved under child1
      const updatedChild1 = helpers.findMenuItem(
        appStore.getState().menuItems,
        "child1",
      );
      expect(updatedChild1?.children).toHaveLength(1);
      expect(updatedChild1?.children?.[0].id).toBe("grandchild1");
      expect(
        appStore.getState().menuItems.some((item) => item.id === "grandchild1"),
      ).toBe(false);
    });

    it("should add multiple items to the root when no parentKey is provided", () => {
      const initialState = { menuItems: [] };
      const itemsToAdd: NavigationItem[] = [
        { id: "item1", label: "Item 1" },
        { id: "item2", label: "Item 2" },
      ];
      appStore.getState().addMenuItems(itemsToAdd);
      expect(appStore.getState().menuItems).toHaveLength(2);
      expect(appStore.getState().menuItems[0].id).toBe("item1");
      expect(appStore.getState().menuItems[1].id).toBe("item2");
    });

    it("should add multiple items as children to a parent when parentKey is provided", () => {
      appStore.getState().addMenuItem({ id: "parent", label: "Parent" });
      const itemsToAdd: NavigationItem[] = [
        { id: "child1", label: "Child 1" },
        { id: "child2", label: "Child 2" },
      ];
      appStore.getState().addMenuItems(itemsToAdd, "parent");
      const parentItem = helpers.findMenuItem(
        appStore.getState().menuItems,
        "parent",
      );
      expect(parentItem?.children).toHaveLength(2);
      expect(parentItem?.children?.[0].id).toBe("child1");
      expect(parentItem?.children?.[1].id).toBe("child2");
    });

    it("should handle items with parentId when no parentKey is provided", () => {
      appStore.getState().addMenuItem({ id: "parent1", label: "Parent 1" });
      appStore.getState().addMenuItem({ id: "parent2", label: "Parent 2" });
      const itemsToAdd = [
        { id: "child1", label: "Child 1", parentId: "parent1" },
        { id: "child2", label: "Child 2", parentId: "parent2" },
        { id: "root1", label: "Root 1" },
      ];
      appStore.getState().addMenuItems(itemsToAdd);
      const parent1 = helpers.findMenuItem(
        appStore.getState().menuItems,
        "parent1",
      );
      const parent2 = helpers.findMenuItem(
        appStore.getState().menuItems,
        "parent2",
      );
      expect(parent1?.children).toHaveLength(1);
      expect(parent1?.children?.[0].id).toBe("child1");
      expect(parent2?.children).toHaveLength(1);
      expect(parent2?.children?.[0].id).toBe("child2");
      expect(
        appStore.getState().menuItems.some((item) => item.id === "root1"),
      ).toBe(true);
    });

    it("should fall back to root when parentId is not found", () => {
      const itemsToAdd = [
        { id: "child1", label: "Child 1", parentId: "nonexistent" },
      ];
      appStore.getState().addMenuItems(itemsToAdd);
      expect(
        appStore.getState().menuItems.some((item) => item.id === "child1"),
      ).toBe(true);
    });
  });

  const mockMenuItems: NavigationItem[] = [
    { children: [], id: "dashboard", label: "Dashboard", path: "/dashboard" },
    {
      children: [
        {
          children: [],
          id: "profile",
          label: "Profile",
          path: "/settings/profile",
        },
        {
          children: [],
          id: "account",
          label: "Account",
          path: "/settings/account",
        },
      ],
      id: "settings",
      label: "Settings",
    },
    { children: [], id: "plugins", label: "Plugins" },
  ];

  describe("addItemsToRoot", () => {
    it("should add new items to the root level", () => {
      const existingItems: NavigationItem[] = [
        { id: "item1", label: "Item 1" },
      ];
      const newItems: NavigationItem[] = [
        { id: "item2", label: "Item 2" },
        { id: "item3", label: "Item 3" },
      ];
      const result = helpers.addItemsToRoot(newItems, existingItems);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ id: "item1", label: "Item 1" });
      expect(result[1]).toEqual({ children: [], id: "item2", label: "Item 2" });
      expect(result[2]).toEqual({ children: [], id: "item3", label: "Item 3" });
    });

    it("should not add duplicate items to the root level", () => {
      const existingItems: NavigationItem[] = [
        { id: "item1", label: "Item 1" },
      ];
      const newItems: NavigationItem[] = [
        { id: "item1", label: "Item 1" }, // Duplicate
        { id: "item2", label: "Item 2" },
      ];
      const result = helpers.addItemsToRoot(newItems, existingItems);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: "item1", label: "Item 1" });
      expect(result[1]).toEqual({ children: [], id: "item2", label: "Item 2" });
    });
  });

  describe("addItemsToChildren", () => {
    it("should add new items to the children of a parent item", () => {
      const parent: NavigationItem = {
        children: [],
        id: "parent1",
        label: "Parent 1",
      };
      const newItems: NavigationItem[] = [
        { id: "child1", label: "Child 1" },
        { id: "child2", label: "Child 2" },
      ];
      const result = helpers.addItemsToChildren(newItems, parent);
      expect(result.children).toHaveLength(2);
      expect(result.children![0]).toEqual({
        children: [],
        id: "child1",
        label: "Child 1",
      });
      expect(result.children![1]).toEqual({
        children: [],
        id: "child2",
        label: "Child 2",
      });
    });

    it("should not add duplicate items to the children of a parent item", () => {
      const parent: NavigationItem = {
        children: [{ id: "child1", label: "Child 1" }],
        id: "parent1",
        label: "Parent 1",
      };
      const newItems: NavigationItem[] = [
        { id: "child1", label: "Child 1" }, // Duplicate
        { id: "child2", label: "Child 2" },
      ];
      const result = helpers.addItemsToChildren(newItems, parent);
      expect(result.children).toHaveLength(2);
      expect(result.children![0]).toEqual({ id: "child1", label: "Child 1" });
      expect(result.children![1]).toEqual({
        children: [],
        id: "child2",
        label: "Child 2",
      });
    });
  });

  describe("findMenuItem", () => {
    it("should find a menu item by ID in a flat structure", () => {
      const items: NavigationItem[] = [
        { id: "item1", label: "Item 1" },
        { id: "item2", label: "Item 2" },
      ];
      const result = helpers.findMenuItem(items, "item2");
      expect(result).toEqual({ id: "item2", label: "Item 2" });
    });

    it("should find a menu item by ID in a nested structure", () => {
      const items: NavigationItem[] = [
        {
          children: [{ id: "item2", label: "Item 2" }],
          id: "item1",
          label: "Item 1",
        },
      ];
      const result = helpers.findMenuItem(items, "item2");
      expect(result).toEqual({ id: "item2", label: "Item 2" });
    });

    it("should return undefined if the menu item is not found", () => {
      const items: NavigationItem[] = [{ id: "item1", label: "Item 1" }];
      const result = helpers.findMenuItem(items, "item2");
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
        "dashboard",
        modifier,
      );
      expect(result).toHaveLength(3);
      const modifiedItem = result.find((item) => item.id === "dashboard");
      expect(modifiedItem?.label).toBe("Modified Dashboard");
    });

    it("should modify a nested item", () => {
      const modifier = (item: NavigationItem) => ({
        ...item,
        label: "Modified Profile",
      });
      const result = helpers.findAndModifyMenuItem(
        [...mockMenuItems],
        "profile",
        modifier,
      );
      expect(result).toHaveLength(3);
      const settingsItem = result.find((item) => item.id === "settings");
      expect(settingsItem?.children).toBeDefined();
      expect(settingsItem?.children).toHaveLength(2);
      const modifiedChild = settingsItem?.children!.find(
        (item) => item.id === "profile",
      );
      expect(modifiedChild?.label).toBe("Modified Profile");
      const otherChild = settingsItem?.children!.find(
        (item) => item.id === "account",
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
        "non-existent",
        modifier,
      );
      expect(result).toBe(originalItems); // Should return the exact same array reference for efficiency
    });

    it("should return the original array if no modification occurs in children", () => {
      const modifier = (item: NavigationItem) => item; // Modifier that does nothing
      const originalItems = [...mockMenuItems];
      const result = helpers.findAndModifyMenuItem(
        originalItems,
        "non-existent-child",
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
        "profile",
        modifier,
      );
      expect(result).not.toBe(originalItems); // Should return a new array reference
      const settingsItem = result.find((item) => item.id === "settings");
      const originalSettingsItem = originalItems.find(
        (item) => item.id === "settings",
      );
      expect(settingsItem).not.toBe(originalSettingsItem); // The parent should also be a new object
      expect(settingsItem?.children).not.toBe(originalSettingsItem?.children); // The children array should be new
    });
  });

  describe("removeItemFromMenu", () => {
    it("should remove a root level item", () => {
      const result = helpers.removeItemFromMenu(
        [...mockMenuItems],
        "dashboard",
      );
      expect(result).toHaveLength(2);
      expect(result.find((item) => item.id === "dashboard")).toBeUndefined();
      expect(result.find((item) => item.id === "settings")).toBeDefined();
      expect(result.find((item) => item.id === "plugins")).toBeDefined();
    });

    it("should remove a nested item", () => {
      const result = helpers.removeItemFromMenu([...mockMenuItems], "profile");
      expect(result).toHaveLength(3); // Root level items remain
      const settingsItem = result.find((item) => item.id === "settings");
      expect(settingsItem?.children).toBeDefined();
      expect(settingsItem?.children).toHaveLength(1); // One child removed
      expect(
        settingsItem?.children!.find((item) => item.id === "profile"),
      ).toBeUndefined();
      expect(
        settingsItem?.children!.find((item) => item.id === "account"),
      ).toBeDefined(); // Other child remains
    });

    it("should return the original array if key is not found", () => {
      const originalItems = [...mockMenuItems];
      const result = helpers.removeItemFromMenu(originalItems, "non-existent");
      expect(result).toBe(originalItems); // Should return the exact same array reference for efficiency
    });

    it("should return the original array if key is not found in children", () => {
      const originalItems = [...mockMenuItems];
      const result = helpers.removeItemFromMenu(
        originalItems,
        "non-existent-child",
      );
      expect(result).toBe(originalItems); // Should return the exact same array reference
    });

    it("should return a new array if an item is removed from children", () => {
      const originalItems = [...mockMenuItems];
      const result = helpers.removeItemFromMenu(originalItems, "profile");
      expect(result).not.toBe(originalItems); // Should return a new array reference
      const settingsItem = result.find((item) => item.id === "settings");
      const originalSettingsItem = originalItems.find(
        (item) => item.id === "settings",
      );
      expect(settingsItem).not.toBe(originalSettingsItem); // The parent should also be a new object
      expect(settingsItem?.children).not.toBe(originalSettingsItem?.children); // The children array should be new
    });
  });
});
