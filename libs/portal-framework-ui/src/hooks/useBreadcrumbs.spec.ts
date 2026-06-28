import { renderHook } from "@testing-library/react";
import type { NavigationItem } from "@lumeweb/portal-framework-core";

import { describe, expect, it } from "vitest";

import { buildBreadcrumbs, useBreadcrumbs } from "./useBreadcrumbs";

type TestItem = NavigationItem & { id: string };
const items = (o: Partial<TestItem>[]): TestItem[] => o as TestItem[];

describe("buildBreadcrumbs — pure function", () => {
  it("derives breadcrumbs from current path via parentId chain", () => {
    const navItems = items([
      { id: "a", label: "My Account", path: "/account" },
      { id: "b", label: "Profile", path: "/account/profile", parentId: "a" },
    ]);

    const crumbs = buildBreadcrumbs(navItems, "/account/profile");
    expect(crumbs).toHaveLength(2);
    expect(crumbs[0].label).toBe("My Account");
    expect(crumbs[1].label).toBe("Profile");
  });

  it("returns empty array when path not found", () => {
    const navItems = items([
      { id: "a", label: "Home", path: "/" },
    ]);

    const crumbs = buildBreadcrumbs(navItems, "/nonexistent");
    expect(crumbs).toHaveLength(0);
  });

  it("returns single item when path matches a root with no parentId", () => {
    const navItems = items([
      { id: "a", label: "Home", path: "/" },
      { id: "b", label: "Settings", path: "/settings", parentId: "a" },
    ]);

    const crumbs = buildBreadcrumbs(navItems, "/");
    expect(crumbs).toHaveLength(1);
    expect(crumbs[0].label).toBe("Home");
  });

  it("walks 3+ level parentId chain to root", () => {
    const navItems = items([
      { id: "a", label: "Home", path: "/" },
      { id: "b", label: "Account", path: "/account", parentId: "a" },
      { id: "c", label: "Profile", path: "/account/profile", parentId: "b" },
      { id: "d", label: "Avatar", path: "/account/profile/avatar", parentId: "c" },
    ]);

    const crumbs = buildBreadcrumbs(navItems, "/account/profile/avatar");
    expect(crumbs).toHaveLength(4);
    expect(crumbs.map((c) => c.label)).toEqual([
      "Home",
      "Account",
      "Profile",
      "Avatar",
    ]);
  });

  it("stops walking when parentId references a non-existent parent", () => {
    const navItems = items([
      { id: "a", label: "Home", path: "/" },
      { id: "b", label: "Orphan", path: "/orphan", parentId: "missing" },
    ]);

    const crumbs = buildBreadcrumbs(navItems, "/orphan");
    expect(crumbs).toHaveLength(1);
    expect(crumbs[0].label).toBe("Orphan");
  });

  it("handles circular parentId references without infinite loop", () => {
    const navItems = items([
      { id: "a", label: "A", path: "/a", parentId: "b" },
      { id: "b", label: "B", path: "/b", parentId: "a" },
    ]);

    const crumbs = buildBreadcrumbs(navItems, "/a");
    // Should break the cycle: start with 'a', find parent 'b', then 'b' has
    // parentId 'a' which is already visited — stop.
    expect(crumbs).toHaveLength(2);
    expect(crumbs[0].label).toBe("B");
    expect(crumbs[1].label).toBe("A");
  });

  it("returns empty array for empty items", () => {
    const crumbs = buildBreadcrumbs([], "/anything");
    expect(crumbs).toHaveLength(0);
  });

  it("is pure — same input produces structurally identical output", () => {
    const navItems = items([
      { id: "a", label: "Home", path: "/" },
      { id: "b", label: "Settings", path: "/settings", parentId: "a" },
    ]);

    const first = buildBreadcrumbs(navItems, "/settings");
    const second = buildBreadcrumbs(navItems, "/settings");
    expect(second).toEqual(first);
  });
});

describe("useBreadcrumbs — hook", () => {
  it("derives breadcrumbs from current path", () => {
    const navItems: NavigationItem[] = [
      { id: "a", label: "My Account", path: "/account" },
      { id: "b", label: "Profile", path: "/account/profile", parentId: "a" },
    ];

    const { result } = renderHook(() =>
      useBreadcrumbs(navItems, "/account/profile"),
    );
    expect(result.current).toHaveLength(2);
    expect(result.current[0]!.label).toBe("My Account");
    expect(result.current[1]!.label).toBe("Profile");
  });

  it("returns empty array when path not found", () => {
    const navItems: NavigationItem[] = [
      { id: "a", label: "Home", path: "/" },
    ];

    const { result } = renderHook(() =>
      useBreadcrumbs(navItems, "/nonexistent"),
    );
    expect(result.current).toHaveLength(0);
  });

  it("memoizes — returns same reference when deps unchanged", () => {
    const navItems: NavigationItem[] = [
      { id: "a", label: "Home", path: "/" },
      { id: "b", label: "Settings", path: "/settings", parentId: "a" },
    ];

    const { result, rerender } = renderHook(() =>
      useBreadcrumbs(navItems, "/settings"),
    );

    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it("returns new reference when path changes", () => {
    const navItems: NavigationItem[] = [
      { id: "a", label: "Home", path: "/" },
      { id: "b", label: "Settings", path: "/settings", parentId: "a" },
    ];

    let currentPath = "/";
    const { result, rerender } = renderHook(() =>
      useBreadcrumbs(navItems, currentPath),
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0]!.label).toBe("Home");

    currentPath = "/settings";
    rerender();

    expect(result.current).toHaveLength(2);
    expect(result.current[0]!.label).toBe("Home");
    expect(result.current[1]!.label).toBe("Settings");
  });

  it("handles empty items array", () => {
    const { result } = renderHook(() => useBreadcrumbs([], "/anything"));
    expect(result.current).toHaveLength(0);
  });
});
