/**
 * Breadcrumbs Hook
 *
 * Derives breadcrumb data from the navigation tree by walking the `parentId`
 * chain from the current path back to the root.
 *
 * The pure `buildBreadcrumbs` function is exported for testability and
 * direct use outside React. The `useBreadcrumbs` hook wraps it in `useMemo`
 * for reactive component use.
 */

import { type NavigationItem } from "@lumeweb/portal-framework-core";

import { useMemo } from "react";

/**
 * Resolve an item's effective id: uses `id`, falls back to `path`, then `label`.
 * This mirrors the id resolution logic in `buildTree` (useNavigationTree.ts).
 */
function getItemId(item: NavigationItem): string {
  return item.id ?? item.path ?? item.label;
}

/**
 * Build a breadcrumb trail from the current path by walking the `parentId`
 * chain from the matching item back to the root.
 *
 * The returned array is ordered root-first (ancestors before descendants):
 *   [Root, ..., Parent, Current]
 *
 * Safety:
 * - If no item matches `currentPath`, returns an empty array.
 * - If `parentId` references a non-existent parent, the walk stops at the
 *   last found item.
 * - Circular `parentId` references are detected via a visited-set and broken
 *   without infinite looping.
 *
 * @param items       - Flat list of NavigationItem (with optional `parentId` chains).
 * @param currentPath - The route path to derive breadcrumbs for.
 * @returns Ordered breadcrumb array (root → current).
 */
export function buildBreadcrumbs(
  items: NavigationItem[],
  currentPath: string,
): NavigationItem[] {
  // Find the item matching the current path.
  const item = items.find((i) => i.path === currentPath);
  if (!item) return [];

  const crumbs: NavigationItem[] = [item];
  const visited = new Set<string>([getItemId(item)]);

  let current = item;
  while (current.parentId) {
    const parentId = current.parentId;

    // Break cycles: if we've already visited this parent, stop walking.
    if (visited.has(parentId)) break;

    const parent = items.find((i) => getItemId(i) === parentId);
    if (!parent) break;

    visited.add(getItemId(parent));
    crumbs.unshift(parent);
    current = parent;
  }

  return crumbs;
}

/**
 * Hook that derives breadcrumb data from the navigation tree by walking the
 * `parentId` chain from the current path to the root.
 *
 * Memoized via `useMemo` — returns a stable reference when `items` and
 * `currentPath` are unchanged across re-renders.
 *
 * @param items       - Flat list of NavigationItem.
 * @param currentPath - The route path to derive breadcrumbs for.
 * @returns Ordered breadcrumb array (root → current), or empty array if
 *          no item matches the path.
 */
export function useBreadcrumbs(
  items: NavigationItem[],
  currentPath: string,
): NavigationItem[] {
  return useMemo(
    () => buildBreadcrumbs(items, currentPath),
    [items, currentPath],
  );
}
