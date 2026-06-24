import { describe, expect, it } from "vitest";

import { renderHook } from "@testing-library/react";
import type { NavigationItem } from "@lumeweb/portal-framework-core";

import { useNavigationFilter } from "./useNavigationFilter";

type TestItem = NavigationItem & { id: string };
const item = (o: Partial<TestItem>): TestItem => ({ id: "x", ...o }) as TestItem;

describe("useNavigationFilter", () => {
  it("returns all items when none are hidden or show() returns true", () => {
    const items = [
      item({ id: "a", label: "A", path: "/a" }),
      item({ id: "b", label: "B", path: "/b" }),
    ];
    const { result } = renderHook(() => useNavigationFilter(items));
    expect(result.current.filtered).toHaveLength(2);
  });

  it("filters out hidden items", () => {
    const items = [
      item({ id: "a", label: "A", path: "/a" }),
      item({ id: "b", label: "B", path: "/b", hidden: true }),
    ];
    const { result } = renderHook(() => useNavigationFilter(items));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].id).toBe("a");
  });

  it("filters out items where show() returns false", () => {
    const items = [
      item({ id: "a", label: "A", path: "/a" }),
      item({
        id: "b",
        label: "B",
        path: "/b",
        show: () => false,
      }),
    ];
    const { result } = renderHook(() => useNavigationFilter(items));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].id).toBe("a");
  });

  it("filters out both hidden and show()-false items", () => {
    const items = [
      item({ id: "a", label: "A", path: "/a" }),
      item({ id: "b", label: "B", path: "/b", hidden: true }),
      item({ id: "c", label: "C", path: "/c", show: () => false }),
      item({ id: "d", label: "D", path: "/d" }),
    ];
    const { result } = renderHook(() => useNavigationFilter(items));
    expect(result.current.filtered).toHaveLength(2);
    expect(result.current.filtered.map((i) => i.id)).toEqual(["a", "d"]);
  });

  it("returns empty array when all items are filtered", () => {
    const items: NavigationItem[] = [
      { id: "a", label: "A", hidden: true },
      { id: "b", label: "B", show: () => false },
    ];
    const { result } = renderHook(() => useNavigationFilter(items));
    expect(result.current.filtered).toHaveLength(0);
  });

  it("is memoized — returns same reference when items have not changed", () => {
    const items: NavigationItem[] = [
      { id: "a", label: "A" },
      { id: "b", label: "B", hidden: true },
    ];
    const { result, rerender } = renderHook(
      ({ items }: { items: NavigationItem[] }) => useNavigationFilter(items),
      { initialProps: { items } },
    );
    const first = result.current.filtered;
    rerender({ items });
    expect(result.current.filtered).toBe(first);
  });

  it("returns a new reference when items change", () => {
    const itemsV1: NavigationItem[] = [{ id: "a", label: "A" }];
    const itemsV2: NavigationItem[] = [{ id: "b", label: "B" }];
    const { result, rerender } = renderHook(
      ({ items }: { items: NavigationItem[] }) => useNavigationFilter(items),
      { initialProps: { items: itemsV1 } },
    );
    const first = result.current.filtered;
    rerender({ items: itemsV2 });
    expect(result.current.filtered).not.toBe(first);
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].id).toBe("b");
  });
});
