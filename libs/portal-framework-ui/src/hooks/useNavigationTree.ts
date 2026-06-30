/**
 * Navigation Tree Hook
 *
 * Provides grouping and tree-building for navigation items by section.
 * Supports N-level nesting via both parentId chains and inline children arrays.
 */

import { type NavigationItem } from "@lumeweb/portal-framework-core";

import { useMemo } from "react";

/**
 * The shape of a navigation tree node returned by `useNavigationTree`.
 * Extends NavigationItem with a `depth` field and a non-optional `children` array.
 */
export interface NavigationTreeNode extends NavigationItem {
  children: NavigationTreeNode[];
  /** Depth in the tree. Root nodes have depth 0. */
  depth: number;
}

export interface NavigationGroup {
  items: NavigationTreeNode[];
  section: string | null;
}

/**
 * Normalize a nav item's section to a fallback string.
 */
export function normalizeSection(item: NavigationItem): string {
  return item.section ?? "default";
}

/**
 * Sort items by `order` ascending, stable for missing order values.
 */
export function sortItems<T extends { order?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
}

/**
 * Group items by their `section` field, returning an object keyed by section name.
 * Keys are sorted by the first item's order within each group.
 * The "default" section (items without a section field) always sorts last.
 */
export function groupBySection(
  items: NavigationItem[],
): Record<string, NavigationItem[]> {
  const sectionMap = new Map<string, NavigationItem[]>();

  for (const item of items) {
    const section = normalizeSection(item);
    if (!sectionMap.has(section)) {
      sectionMap.set(section, []);
    }
    sectionMap.get(section)!.push(item);
  }

  const sortedKeys = [...sectionMap.keys()].sort((a, b) => {
    const aIsDefault = a === "default";
    const bIsDefault = b === "default";
    // Default section (no section name) sorts first
    if (aIsDefault && !bIsDefault) return -1;
    if (!aIsDefault && bIsDefault) return 1;
    const aOrder = sectionMap.get(a)![0]?.order ?? Infinity;
    const bOrder = sectionMap.get(b)![0]?.order ?? Infinity;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.localeCompare(b);
  });

  const result: Record<string, NavigationItem[]> = {};
  for (const key of sortedKeys) {
    result[key] = sortItems(sectionMap.get(key)!);
  }

  return result;
}

/**
 * Resolve the effective id for an item: uses `id`, falls back to `path`, then `label`.
 */
function getItemId(item: NavigationItem): string {
  return item.id ?? item.path ?? item.label;
}

/**
 * Convert a flat list of NavigationItems into a recursive tree.
 *
 * Supports TWO hierarchy mechanisms:
 * 1. `parentId` chain — flat items with `parentId` referencing a parent's `id`
 * 2. Inline `children` array — `NavigationItem.children?: NavigationItem[]`
 *
 * Both must produce the same tree structure. When an item appears both as a
 * flat item with `parentId` AND inside an inline `children` array, the
 * `parentId` reference wins for deduplication — the item is moved under its
 * parent exactly once.
 *
 * @returns Array of root NavigationTreeNode, each with `depth` and `children`.
 */
export function buildTree(items: NavigationItem[]): NavigationTreeNode[] {
  if (items.length === 0) return [];

  const itemMap = new Map<string, NavigationTreeNode>();
  const roots: NavigationTreeNode[] = [];

  // Track which items have a parentId (to detect parent-child relationship)
  const parentIdSet = new Set<string>();

  // Pass 1: Create nodes for all flat items (dedup by id).
  // Also collect inline children into the map.
  const collectInlineChildren = (item: NavigationItem): void => {
    const id = getItemId(item);
    if (!itemMap.has(id)) {
      itemMap.set(id, { ...item, id, children: [], depth: 0 });
    }
    if (item.children) {
      for (const child of item.children) {
        collectInlineChildren(child);
      }
    }
  };

  for (const item of items) {
    const id = getItemId(item);
    if (!itemMap.has(id)) {
      itemMap.set(id, { ...item, id, children: [], depth: 0 });
    }
    // Track parentId for relationship resolution
    if (item.parentId) {
      parentIdSet.add(id);
    }
    // Collect inline children that aren't in the flat list
    if (item.children) {
      for (const child of item.children) {
        collectInlineChildren(child);
      }
    }
  }

  // Pass 2: Reset children arrays to avoid stale references from spread,
  // then resolve parentId relationships (primary hierarchy mechanism).
  // We clear children first because Pass 1 spread item.children into the node.
  for (const node of itemMap.values()) {
    node.children = [];
  }

  // Set of ids that have been attached to a parent via parentId
  const attachedViaParentId = new Set<string>();

  for (const item of items) {
    const id = getItemId(item);
    const node = itemMap.get(id)!;

    if (item.parentId && itemMap.has(item.parentId)) {
      // parentId takes precedence: attach to parent
      const parent = itemMap.get(item.parentId)!;
      if (!parent.children.some((c) => getItemId(c) === id)) {
        parent.children.push(node);
      }
      attachedViaParentId.add(id);
    }
  }

  // Pass 3: Merge inline children arrays (secondary hierarchy mechanism).
  // For items that have inline children[] on the NavigationItem, ensure those
  // children are attached. Skip any child already attached via parentId (deduplication).
  const processInlineChildren = (item: NavigationItem): void => {
    const id = getItemId(item);
    const node = itemMap.get(id);
    if (!node || !item.children) return;

    for (const child of item.children) {
      const childId = getItemId(child);
      // Skip if already attached via parentId (parentId takes precedence)
      if (attachedViaParentId.has(childId)) continue;

      const childNode = itemMap.get(childId);
      if (childNode && !node.children.some((c) => getItemId(c) === childId)) {
        node.children.push(childNode);
      }
    }

    // Recurse into inline children
    for (const child of item.children) {
      processInlineChildren(child);
    }
  };

  for (const item of items) {
    processInlineChildren(item);
  }

  // Pass 4: Determine roots — items that are NOT children of any other node.
  const childIds = new Set<string>();
  for (const node of itemMap.values()) {
    for (const child of node.children) {
      childIds.add(getItemId(child));
    }
  }

  // Roots are items from the original flat list that aren't children
  // (preserve original order)
  const seenRootIds = new Set<string>();
  for (const item of items) {
    const id = getItemId(item);
    if (childIds.has(id) || seenRootIds.has(id)) continue;
    seenRootIds.add(id);
    roots.push(itemMap.get(id)!);
  }

  // Pass 5: Assign depth recursively and sort by order.
  const assignDepth = (nodes: NavigationTreeNode[], depth: number): void => {
    for (const node of nodes) {
      node.depth = depth;
      assignDepth(node.children, depth + 1);
    }
  };
  assignDepth(roots, 0);

  const sortNodes = (nodes: NavigationTreeNode[]): void => {
    nodes.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
    for (const n of nodes) sortNodes(n.children);
  };
  sortNodes(roots);

  return roots;
}

/**
 * Hook that groups navigation items by section and builds a memoized N-level tree.
 *
 * @returns `{ sections, sectionTrees, tree }` where:
 *   - `tree`: flat array of root NavigationTreeNode[] (all sections combined)
 *   - `sections`: keyed by section name, each NavigationGroup has items + tree nodes
 *   - `sectionTrees`: section-keyed NavigationTreeNode[] for per-section rendering
 */
export function useNavigationTree(
  items: NavigationItem[] = [],
): {
  sections: Record<string, NavigationGroup>;
  sectionTrees: Record<string, NavigationTreeNode[]>;
  tree: NavigationTreeNode[];
} {
  const sectionMap: Record<string, NavigationItem[]> = useMemo(
    () => groupBySection(items),
    [items],
  );

  // Build per-section trees
  const sectionTrees = useMemo(() => {
    const result: Record<string, NavigationTreeNode[]> = {};
    for (const [section, navItems] of Object.entries(sectionMap) as [
      string,
      NavigationItem[],
    ][]) {
      result[section] = buildTree(navItems);
    }
    return result;
  }, [sectionMap]);

  // Combine all roots for the "tree" export (used by legacy consumers)
  const tree = useMemo(
    () => Object.values(sectionTrees).flat() as NavigationTreeNode[],
    [sectionTrees],
  );

  // Grouped sections with both items and tree
  const sections = useMemo(() => {
    const result: Record<string, NavigationGroup> = {};
    for (const [section, sectionTree] of Object.entries(sectionTrees) as [
      string,
      NavigationTreeNode[],
    ][]) {
      result[section] = {
        items: sectionTree,
        section: section === "default" ? null : section,
      };
    }
    return result;
  }, [sectionTrees]);

  return { sections, sectionTrees, tree };
}
