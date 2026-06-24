import type { NavigationItem } from "@lumeweb/portal-framework-core";

import { describe, expect, it } from "vitest";

import {
  buildTree,
  groupBySection,
  normalizeSection,
  sortItems,
} from "./useNavigationTree";

const core = (n: string) => `core:${n}` as const;

type TestItem = NavigationItem & { id: string };
const items = (o: Partial<TestItem>[]): TestItem[] => o as TestItem[];

describe("normalizeSection", () => {
  it("returns item.section when set", () => {
    const item = { id: "1", label: "x", section: "Settings" } as NavigationItem;
    expect(normalizeSection(item)).toBe("Settings");
  });

  it("returns 'default' when section is undefined", () => {
    const item = { id: "1", label: "x" } as NavigationItem;
    expect(normalizeSection(item)).toBe("default");
  });
});

describe("sortItems", () => {
  it("sorts items by order ascending", () => {
    const list: TestItem[] = [
      { id: core("a"), label: "A", order: 2 },
      { id: core("b"), label: "B", order: 0 },
      { id: core("c"), label: "C" }, // no order -> Infinity
    ];
    const result = sortItems(list);
    expect(result.map((i) => i.id)).toEqual([core("b"), core("a"), core("c")]);
  });

  it("is stable for missing order (keeps input order)", () => {
    const list: TestItem[] = [
      { id: core("x"), label: "X" },
      { id: core("y"), label: "Y" },
    ];
    const result = sortItems(list);
    expect(result.map((i) => i.id)).toEqual([core("x"), core("y")]);
  });
});

describe("groupBySection", () => {
  it("groups items into sections with 'default' fallback", () => {
    const list: TestItem[] = [
      { id: core("a"), label: "A" },
      { id: core("b"), label: "B", section: "Settings" },
      { id: core("c"), label: "C", section: "Settings" },
      { id: core("d"), label: "D", section: "Appearance" },
    ];
    const result = groupBySection(list);
    expect(Object.keys(result)).toEqual([
      "Appearance",
      "Settings",
      "default",
    ]);
    expect(result["default"]).toHaveLength(1);
    expect(result["Settings"]).toHaveLength(2);
    expect(result["Appearance"]).toHaveLength(1);
  });

  it("returns single 'default' section when all items lack section", () => {
    const list: TestItem[] = [
      { id: core("a"), label: "A" },
      { id: core("b"), label: "B" },
    ];
    const result = groupBySection(list);
    expect(Object.keys(result)).toEqual(["default"]);
    expect(result["default"]).toHaveLength(2);
  });

  it("sorts items within each section by order", () => {
    const list: TestItem[] = [
      { id: core("a"), label: "A", order: 2, section: "X" },
      { id: core("b"), label: "B", order: 1, section: "X" },
      { id: core("c"), label: "C", order: 0, section: "X" },
    ];
    const result = groupBySection(list);
    expect(result["X"]![0].id).toBe(core("c"));
    expect(result["X"]![1].id).toBe(core("b"));
    expect(result["X"]![2].id).toBe(core("a"));
  });

  it("returns object with sections sorted by their first item order", () => {
    const list: TestItem[] = [
      { id: core("a"), label: "A", section: "Beta" },
      { id: core("b"), label: "B", order: 0, section: "Alpha" },
      { id: core("c"), label: "C", order: 1 },
    ];
    const result = groupBySection(list);
    expect(Object.keys(result)).toEqual(["Alpha", "Beta", "default"]);
  });
});

describe("buildTree — N-level nesting", () => {
  it("builds nested tree from flat items via parentId", () => {
    const flat = [
      { id: "a", label: "A", path: "/a", order: 0 },
      { id: "b", label: "B", path: "/b", order: 1, parentId: "a" },
    ] as NavigationItem[];

    const tree = buildTree(flat);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe("a");
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].id).toBe("b");
  });

  it("supports 3+ level nesting via parentId chain", () => {
    const flat = [
      { id: "a", label: "A", path: "/a", order: 0 },
      { id: "b", label: "B", path: "/a/b", order: 0, parentId: "a" },
      { id: "c", label: "C", path: "/a/b/c", order: 0, parentId: "b" },
      { id: "d", label: "D", path: "/a/b/c/d", order: 0, parentId: "c" },
    ] as NavigationItem[];

    const tree = buildTree(flat);
    const root = tree[0];
    expect(root.id).toBe("a");
    expect(root.children[0].id).toBe("b");
    expect(root.children[0].children[0].id).toBe("c");
    expect(root.children[0].children[0].children[0].id).toBe("d");
  });

  it("supports inline children arrays to arbitrary depth", () => {
    const navItems = [
      {
        id: "a",
        label: "A",
        path: "/a",
        order: 0,
        children: [
          {
            id: "b",
            label: "B",
            path: "/a/b",
            order: 0,
            children: [
              { id: "c", label: "C", path: "/a/b/c", order: 0 },
            ],
          },
        ],
      },
    ] as NavigationItem[];

    const tree = buildTree(navItems);
    expect(tree[0].children[0].children[0].id).toBe("c");
  });

  it("parentId takes precedence over inline children for deduplication", () => {
    // 'b' appears both as inline child of 'a' AND as a flat item with parentId: 'a'
    // The hook should not produce a duplicate 'b' node.
    const navItems = [
      {
        id: "a",
        label: "A",
        path: "/a",
        order: 0,
        children: [{ id: "b", label: "B", path: "/a/b", order: 0 }],
      },
      { id: "b", label: "B", path: "/a/b", order: 0, parentId: "a" },
    ] as NavigationItem[];

    const tree = buildTree(navItems);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe("a");
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].id).toBe("b");
  });

  it("assigns correct depth to each node (parentId chain)", () => {
    const flat = [
      { id: "a", label: "A", path: "/a", order: 0 },
      { id: "b", label: "B", path: "/a/b", order: 0, parentId: "a" },
      { id: "c", label: "C", path: "/a/b/c", order: 0, parentId: "b" },
    ] as NavigationItem[];

    const tree = buildTree(flat);
    expect(tree[0].depth).toBe(0);
    expect(tree[0].children[0].depth).toBe(1);
    expect(tree[0].children[0].children[0].depth).toBe(2);
  });

  it("assigns depth correctly for inline children", () => {
    const navItems = [
      {
        id: "a",
        label: "A",
        path: "/a",
        order: 0,
        children: [
          {
            id: "b",
            label: "B",
            path: "/a/b",
            order: 0,
            children: [
              { id: "c", label: "C", path: "/a/b/c", order: 0 },
            ],
          },
        ],
      },
    ] as NavigationItem[];

    const tree = buildTree(navItems);
    expect(tree[0].depth).toBe(0);
    expect(tree[0].children[0].depth).toBe(1);
    expect(tree[0].children[0].children[0].depth).toBe(2);
  });

  it("produces identical structure for same input (purity for memoization)", () => {
    const navItems = [
      { id: "a", label: "A", path: "/a" },
    ] as NavigationItem[];
    const first = buildTree(navItems);
    const second = buildTree(navItems);
    // buildTree is pure — same input produces structurally identical output.
    // The hook's useMemo wraps this, returning the same reference on re-render.
    expect(second).toEqual(first);
  });

  it("returns empty tree for empty items", () => {
    const tree = buildTree([]);
    expect(tree).toHaveLength(0);
  });

  it("handles mixed parentId and inline children within sections", () => {
    const navItems = [
      { id: "x", label: "X", path: "/x", order: 0, section: "Main" },
      { id: "y", label: "Y", path: "/x/y", order: 0, parentId: "x", section: "Main" },
      {
        id: "z",
        label: "Z",
        path: "/z",
        order: 1,
        section: "Main",
        children: [{ id: "w", label: "W", path: "/z/w", order: 0, section: "Main" }],
      },
    ] as NavigationItem[];

    const tree = buildTree(navItems);
    // Both 'x' and 'z' should be root nodes
    expect(tree).toHaveLength(2);
    const xNode = tree.find((n) => n.id === "x");
    const zNode = tree.find((n) => n.id === "z");
    expect(xNode?.children).toHaveLength(1);
    expect(xNode?.children[0].id).toBe("y");
    expect(zNode?.children).toHaveLength(1);
    expect(zNode?.children[0].id).toBe("w");
  });

  it("sorts nodes by order at each level", () => {
    const flat = [
      { id: "a", label: "A", path: "/a", order: 2 },
      { id: "b", label: "B", path: "/b", order: 0 },
      { id: "c", label: "C", path: "/c", order: 1 },
    ] as NavigationItem[];

    const tree = buildTree(flat);
    expect(tree.map((n) => n.id)).toEqual(["b", "c", "a"]);
  });
});
