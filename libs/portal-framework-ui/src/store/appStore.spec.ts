import { type Framework } from "@lumeweb/portal-framework-core";
import { createNamespacedId } from "@lumeweb/portal-framework-core";
import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { storeResetFns } from "@/../__mocks__/zustand"; // Import the reset function set

import { appStore } from "./appStore"; // Import the store

const CORE_NS = "core";
const core = (name: string) => createNamespacedId(CORE_NS, name);

// Mock the helpers if they had external dependencies or complex side effects.
// In this case, the helpers seem pure and self-contained, so testing the actions
// that use them is sufficient.

describe("appStore", () => {
  // Reset the store BEFORE each test using the mock's reset functionality
  beforeEach(() => {
    act(() => {
      storeResetFns.forEach((resetFn) => resetFn());
    });
  });

  it("should have correct initial state", () => {
    const state = appStore.getState();
    expect(state.error).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.menuItems).toEqual([]);
    expect(state.pluginConfigs).toEqual([]);
    expect(state.routes).toEqual([]);
  });

  it("should set error", () => {
    const testError = new Error("Something went wrong");
    act(() => {
      appStore.getState().setError(testError);
    });
    expect(appStore.getState().error).toBe(testError);

    act(() => {
      appStore.getState().setError(null);
    });
    expect(appStore.getState().error).toBeNull();
  });

  it("should set loading state", () => {
    act(() => {
      appStore.getState().setIsLoading(true);
    });
    expect(appStore.getState().isLoading).toBe(true);

    act(() => {
      appStore.getState().setIsLoading(false);
    });
    expect(appStore.getState().isLoading).toBe(false);
  });

  it("should set plugin configs", () => {
    const configs = [{ config: { setting: true }, id: "plugin1" }];
    act(() => {
      appStore.getState().setPluginConfigs(configs);
    });
    expect(appStore.getState().pluginConfigs).toEqual(configs);
  });

  it("should set routes", () => {
    const routes = [
      { component: "TestComponent", id: createNamespacedId(CORE_NS, "route1"), path: "/test" },
    ];
    act(() => {
      appStore.getState().setRoutes(routes);
    });
    expect(appStore.getState().routes).toEqual(routes);
  });

  it("should add a menu item to the root", () => {
    const newItem = { id: core("item1"), label: "Item 1", path: "/item1" };
    act(() => {
      appStore.getState().addMenuItem(newItem);
    });
    const state = appStore.getState();
    expect(state.menuItems).toHaveLength(1);
    // Ensure children is initialized even if not provided in input
    expect(state.menuItems[0]).toEqual({ ...newItem, children: [] });
  });

  describe("menu item operations", () => {
    it("should add menu items to store", () => {
      const item = { id: core("test"), label: "Test" };
      act(() => {
        appStore.getState().addMenuItem(item);
      });
      expect(appStore.getState().menuItems).toContainEqual({
        ...item,
        children: [],
      });
    });

    it("should remove menu items from store", () => {
      const item = { id: core("test"), label: "Test" };
      act(() => {
        appStore.getState().addMenuItem(item);
        appStore.getState().removeMenuItem(core("test"));
      });
      expect(appStore.getState().menuItems).not.toContainEqual(
        expect.objectContaining({ id: core("test") }),
      );
    });

    it("should batch add menu items", () => {
      const items = [
        { id: core("test1"), label: "Test 1" },
        { id: core("test2"), label: "Test 2" },
      ];
      act(() => {
        appStore.getState().addMenuItems(items);
      });
      expect(appStore.getState().menuItems).toEqual([
        expect.objectContaining({ id: core("test1") }),
        expect.objectContaining({ id: core("test2") }),
      ]);
    });
  });

  it("should add multiple menu items to the root", () => {
    const items = [
      { id: core("item1"), label: "Item 1" },
      { id: core("item2"), label: "Item 2" },
    ];
    act(() => {
      appStore.getState().addMenuItems(items);
    });
    const state = appStore.getState();
    expect(state.menuItems).toHaveLength(2);
    expect(state.menuItems[0]).toEqual({ ...items[0], children: [] });
    expect(state.menuItems[1]).toEqual({ ...items[1], children: [] });
  });

  describe("adding multiple items", () => {
    it("should add multiple menu items to an existing parent (nested)", () => {
      const parentItem = { children: [], id: core("parent1"), label: "Parent 1" };
      const childItems = [
        { id: core("child1"), label: "Child 1" },
        { id: core("child2"), label: "Child 2" },
      ];

      act(() => {
        appStore.getState().addMenuItem(parentItem);
      });
      expect(appStore.getState().menuItems).toHaveLength(1);

      act(() => {
        appStore.getState().addMenuItems(childItems, core("parent1"));
      });
      const state = appStore.getState();
      expect(state.menuItems).toHaveLength(1);
      expect(state.menuItems[0].id).toBe(core("parent1"));
      expect(state.menuItems[0].children).toBeDefined();
      expect(state.menuItems[0].children).toHaveLength(2);
      expect(state.menuItems[0].children![0]).toEqual({
        ...childItems[0],
        children: [],
      });
      expect(state.menuItems[0].children![1]).toEqual({
        ...childItems[1],
        children: [],
      });
    });

    it("should add multiple menu items with parentId (flat)", () => {
      const parentItem = { id: core("parent1"), label: "Parent 1" };
      const childItems = [
        { id: core("child1"), label: "Child 1", parentId: core("parent1") },
        { id: core("child2"), label: "Child 2", parentId: core("parent1") },
      ];

      act(() => {
        appStore.getState().addMenuItem(parentItem);
        appStore.getState().addMenuItems(childItems);
      });

      const state = appStore.getState();
      expect(state.menuItems).toHaveLength(1); // Only parent at root level
      const parent = state.menuItems[0];
      expect(parent).toEqual({
        ...parentItem,
        children: [
          {
            ...childItems[0],
            children: [],
          },
          {
            ...childItems[1],
            children: [],
          },
        ],
      });
    });
  });

  it("should replace an existing item when using addMenuItem", () => {
    const item1 = { id: core("item1"), label: "Item 1" };
    const item1Updated = { id: core("item1"), label: "Item 1 Updated" };

    act(() => {
      appStore.getState().addMenuItem(item1);
    });
    expect(appStore.getState().menuItems).toHaveLength(1);
    expect(appStore.getState().menuItems[0].label).toBe("Item 1");

    act(() => {
      appStore.getState().addMenuItem(item1Updated);
    });
    expect(appStore.getState().menuItems).toHaveLength(1);
    expect(appStore.getState().menuItems[0].label).toBe("Item 1 Updated");
  });

  it("should not add duplicate menu items (by id) to the same level when using addMenuItem", () => {
    const item1 = { id: core("item1"), label: "Item 1" };
    const item1Duplicate = { id: core("item1"), label: "Item 1" }; // Same ID, same label

    act(() => {
      appStore.getState().addMenuItem(item1);
    });
    expect(appStore.getState().menuItems).toHaveLength(1);
    expect(appStore.getState().menuItems[0].label).toBe("Item 1"); // Check initial label

    act(() => {
      appStore.getState().addMenuItem(item1Duplicate); // Add duplicate ID
    });
    // Expect no change in length and the original item to remain
    expect(appStore.getState().menuItems).toHaveLength(1);
    expect(appStore.getState().menuItems[0].label).toBe("Item 1"); // Label should not be updated by addMenuItem
  });

  it("should not add duplicate menu items (by id) to the same level when using addMenuItems", () => {
    const item1 = { id: core("item1"), label: "Item 1" };
    const item1Duplicate = { id: core("item1"), label: "Item 1" }; // Same ID, same label
    const item2 = { id: core("item2"), label: "Item 2" };

    act(() => {
      appStore.getState().addMenuItems([item1, item2, item1Duplicate]);
    });
    // Expect only item1 and item2 to be added
    expect(appStore.getState().menuItems).toHaveLength(2);
    expect(
      appStore.getState().menuItems.find((item) => item.id === core("item1"))?.label,
    ).toBe("Item 1");
    expect(
      appStore.getState().menuItems.find((item) => item.id === core("item2"))?.label,
    ).toBe("Item 2");
  });

  it("should remove a root menu item", () => {
    const item1 = { id: core("item1"), label: "Item 1" };
    const item2 = { id: core("item2"), label: "Item 2" };

    act(() => {
      appStore.getState().addMenuItems([item1, item2]);
    });
    expect(appStore.getState().menuItems).toHaveLength(2);

    act(() => {
      appStore.getState().removeMenuItem(core("item1"));
    });
    const state = appStore.getState();
    expect(state.menuItems).toHaveLength(1);
    expect(state.menuItems[0].id).toBe(core("item2"));
  });

  it("should remove a child menu item", () => {
    const parentItem = { children: [], id: core("parent1"), label: "Parent 1" };
    const childItem1 = { id: core("child1"), label: "Child 1" };
    const childItem2 = { id: core("child2"), label: "Child 2" };

    act(() => {
      appStore.getState().addMenuItem(parentItem);
    });
    act(() => {
      appStore.getState().addMenuItems([childItem1, childItem2], core("parent1"));
    });
    // Add check for children before accessing length
    expect(appStore.getState().menuItems[0].children).toBeDefined();
    expect(appStore.getState().menuItems[0].children).toHaveLength(2);

    act(() => {
      appStore.getState().removeMenuItem(core("child1"));
    });
    const state = appStore.getState();
    expect(state.menuItems).toHaveLength(1);
    expect(state.menuItems[0].id).toBe(core("parent1"));
    // Add checks for children before accessing index
    expect(state.menuItems[0].children).toBeDefined();
    expect(state.menuItems[0].children).toHaveLength(1);
    expect(state.menuItems[0].children![0].id).toBe(core("child2"));
  });

  it("should not remove anything if key is not found", () => {
    const item1 = { id: core("item1"), label: "Item 1" };
    const parentItem = { children: [], id: core("parent1"), label: "Parent 1" };
    const childItem1 = { id: core("child1"), label: "Child 1" };

    act(() => {
      appStore.getState().addMenuItem(item1);
      appStore.getState().addMenuItem(parentItem);
    });
    act(() => {
      appStore.getState().addMenuItem(childItem1, core("parent1"));
    });
    const initialState = appStore.getState();
    expect(initialState.menuItems).toHaveLength(2);
    // Add check for children before accessing length
    expect(
      initialState.menuItems.find((item) => item.id === core("parent1"))?.children,
    ).toBeDefined();
    expect(
      initialState.menuItems.find((item) => item.id === core("parent1"))?.children!,
    ).toHaveLength(1);

    act(() => {
      appStore.getState().removeMenuItem(core("non-existent-key"));
    });
    const stateAfterRemovalAttempt = appStore.getState();
    expect(stateAfterRemovalAttempt.menuItems).toHaveLength(2);
    // Add check for children before accessing length
    expect(
      stateAfterRemovalAttempt.menuItems.find((item) => item.id === core("parent1"))
        ?.children,
    ).toBeDefined();
    expect(
      stateAfterRemovalAttempt.menuItems.find((item) => item.id === core("parent1"))
        ?.children!,
    ).toHaveLength(1);
    // Deep equality check to ensure no unintended changes
    expect(stateAfterRemovalAttempt).toEqual(initialState);
  });

  it("should add a deeply nested menu item", () => {
    const rootItem = { id: core("root"), label: "Root" };
    const child1Item = { id: core("child1"), label: "Child 1" };
    const child2Item = { id: core("child2"), label: "Child 2" };
    const child3Item = { id: core("child3"), label: "Child 3", path: "/child3" };

    act(() => {
      appStore.getState().addMenuItem(rootItem);
    });
    act(() => {
      appStore.getState().addMenuItem(child1Item, core("root"));
    });
    act(() => {
      appStore.getState().addMenuItem(child2Item, core("child1"));
    });
    act(() => {
      appStore.getState().addMenuItem(child3Item, core("child2"));
    });

    const state = appStore.getState();
    expect(state.menuItems).toHaveLength(1);
    expect(state.menuItems[0].id).toBe(core("root"));
    expect(state.menuItems[0].children).toBeDefined();
    expect(state.menuItems[0].children).toHaveLength(1);
    expect(state.menuItems[0].children![0].id).toBe(core("child1"));
    expect(state.menuItems[0].children![0].children).toBeDefined();
    expect(state.menuItems[0].children![0].children).toHaveLength(1);
    expect(state.menuItems[0].children![0].children![0].id).toBe(core("child2"));
    expect(state.menuItems[0].children![0].children![0].children).toBeDefined();
    expect(state.menuItems[0].children![0].children![0].children).toHaveLength(
      1,
    );
    expect(state.menuItems[0].children![0].children![0].children![0]).toEqual({
      ...child3Item,
      children: [],
    });
  });

  it("should remove a deeply nested menu item", () => {
    const rootItem = { id: core("root"), label: "Root" };
    const child1Item = { id: core("child1"), label: "Child 1" };
    const child2Item = { id: core("child2"), label: "Child 2" };
    const child3Item = { id: core("child3"), label: "Child 3" };

    act(() => {
      appStore.getState().addMenuItem(rootItem);
    });
    act(() => {
      appStore.getState().addMenuItem(child1Item, core("root"));
    });
    act(() => {
      appStore.getState().addMenuItem(child2Item, core("child1"));
    });
    act(() => {
      appStore.getState().addMenuItem(child3Item, core("child2"));
    });

    act(() => {
      appStore.getState().removeMenuItem(core("child2"));
    });

    const state = appStore.getState();
    expect(state.menuItems).toHaveLength(1);
    expect(state.menuItems[0].id).toBe(core("root"));
    expect(state.menuItems[0].children).toBeDefined();
    expect(state.menuItems[0].children).toHaveLength(1);
    expect(state.menuItems[0].children![0].id).toBe(core("child1"));
    expect(state.menuItems[0].children![0].children).toBeDefined();
    expect(state.menuItems[0].children![0].children).toHaveLength(0);
  });

  it("should handle adding a menu item to a non-existent parent", () => {
    const newItem = { id: core("item1"), label: "Item 1", path: "/item1" };

    act(() => {
      appStore.getState().addMenuItem(newItem, core("nonexistent-parent"));
    });

    const state = appStore.getState();
    expect(state.menuItems).toHaveLength(1); // Should add to root
    expect(state.menuItems[0]).toEqual({ ...newItem, children: [] });
  });

  it("should handle adding multiple menu items to a non-existent parent", () => {
    const items = [
      { id: core("item1"), label: "Item 1" },
      { id: core("item2"), label: "Item 2" },
    ];

    act(() => {
      appStore.getState().addMenuItems(items, core("nonexistent-parent"));
    });

    const state = appStore.getState();
    expect(state.menuItems).toHaveLength(2); // Should add to root
    expect(state.menuItems[0]).toEqual({ ...items[0], children: [] });
    expect(state.menuItems[1]).toEqual({ ...items[1], children: [] });
  });

  it("should properly handle nested menu items with parent paths", () => {
    const menuItems = [
      {
        id: core("home"),
        label: "Home",
        order: -1,
        path: "/",
      },
      {
        id: core("abuse"),
        label: "Abuse",
        path: "/abuse",
      },
      {
        id: core("abuse-cases"),
        label: "Cases",
        parentId: core("abuse"),
        path: "cases",
      },
      {
        id: core("abuse-reporters"),
        label: "Reporters",
        parentId: core("abuse"),
        path: "reporters",
      },
      {
        id: core("abuse-subjects"),
        label: "Subjects",
        parentId: core("abuse"),
        path: "subjects",
      },
      {
        id: core("abuse-blocklist"),
        label: "Blocklist",
        parentId: core("abuse"),
        path: "blocklist",
      },
    ];

    act(() => {
      appStore.getState().addMenuItems(menuItems);
    });

    const state = appStore.getState();
    expect(state.menuItems).toHaveLength(2); // Home and Abuse

    const abuseItem = state.menuItems.find((item) => item.id === core("abuse"));
    expect(abuseItem).toBeDefined();
    expect(abuseItem?.children).toHaveLength(4);

    // Verify child paths are properly prefixed with parent path
    expect(abuseItem?.children).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: core("abuse-reporters"),
          path: "/abuse/reporters", // Should be prefixed with parent path
        }),
        expect.objectContaining({
          id: core("abuse-cases"),
          path: "/abuse/cases",
        }),
        expect.objectContaining({
          id: core("abuse-subjects"),
          path: "/abuse/subjects",
        }),
        expect.objectContaining({
          id: core("abuse-blocklist"),
          path: "/abuse/blocklist",
        }),
      ]),
    );
  });

  describe("setMenuItems", () => {
    it("replaces all menu items at once", () => {
      act(() => {
        appStore.getState().setMenuItems([
          { id: core("a"), label: "A", path: "/a" },
          { id: core("b"), label: "B", path: "/b" },
        ]);
      });
      expect(appStore.getState().menuItems).toHaveLength(2);

      act(() => {
        appStore.getState().setMenuItems([
          { id: core("c"), label: "C", path: "/c" },
        ]);
      });
      expect(appStore.getState().menuItems).toHaveLength(1);
      expect(appStore.getState().menuItems[0].id).toBe(core("c"));
    });
  });

  describe("appStore unified state", () => {
    it("holds framework instance", () => {
      const mockFramework = { getFeature: vi.fn() } as unknown as Framework;
      act(() => {
        appStore.getState().setFramework(mockFramework);
      });
      expect(appStore.getState().framework).toBe(mockFramework);
    });

    it("syncs routes and nav items from framework", async () => {
      const mockRoutes = [{ id: createNamespacedId(CORE_NS, "route1"), path: "/test" }];
      const mockNavigation = [{ id: createNamespacedId(CORE_NS, "nav1"), label: "Nav 1" }];
      const mockFramework = {
        getFeature: vi.fn().mockResolvedValue({
          getNavigation: vi.fn().mockResolvedValue(mockNavigation),
          getRoutes: vi.fn().mockResolvedValue(mockRoutes),
        }),
      } as unknown as Framework;

      act(() => {
        appStore.getState().setFramework(mockFramework);
      });
      await act(async () => {
        await appStore.getState().syncFromFramework();
      });

      expect(appStore.getState().routes).toEqual(mockRoutes);
      expect(appStore.getState().menuItems).toEqual(mockNavigation);
    });

    it("returns early when no framework is set", async () => {
      await act(async () => {
        await appStore.getState().syncFromFramework();
      });
      expect(appStore.getState().routes).toEqual([]);
      expect(appStore.getState().menuItems).toEqual([]);
    });

    it("returns early when navigation feature is missing", async () => {
      const mockFramework = {
        getFeature: vi.fn().mockResolvedValue(undefined),
      } as unknown as Framework;

      act(() => {
        appStore.getState().setFramework(mockFramework);
      });
      await act(async () => {
        await appStore.getState().syncFromFramework();
      });

      expect(appStore.getState().routes).toEqual([]);
      expect(appStore.getState().menuItems).toEqual([]);
    });
  });

  describe("setMenuItems", () => {
    it("replaces all menu items at once", () => {
      appStore.getState().setMenuItems([
        { id: "a", label: "A", path: "/a" },
        { id: "b", label: "B", path: "/b" },
      ]);
      expect(appStore.getState().menuItems).toHaveLength(2);

      appStore.getState().setMenuItems([
        { id: "c", label: "C", path: "/c" },
      ]);
      expect(appStore.getState().menuItems).toHaveLength(1);
      expect(appStore.getState().menuItems[0].id).toBe("c");
    });
  });
});
