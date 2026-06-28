import { useMemo } from "react";

import type { NavigationItem } from "@lumeweb/portal-framework-core";

export interface UseNavigationFilterReturn {
  /** Filtered items: items where `!hidden` and `show is undefined or show() === true` */
  filtered: NavigationItem[];
}

/**
 * Filter visibility from a flat `NavigationItem[]`.
 *
 * An item is kept when:
 *  - `hidden` is not truthy
 *  - `show` is not provided, or `show()` returns `true`
 *
 * Returns a memoized result that changes reference only when the input array
 * reference changes (shallow equality), so consumers can safely use the return
 * value in dependency lists.
 */
export function useNavigationFilter(items: NavigationItem[]): UseNavigationFilterReturn {
  const filtered = useMemo(() => {
    const result: NavigationItem[] = [];
    for (const item of items) {
      if ("hidden" in item && item.hidden) continue;
      const showType = typeof (item as NavigationItem & { show?: () => boolean }).show;
      if (showType === "function") {
        const showFn = (item as NavigationItem & { show?: () => boolean }).show;
        if (showFn && !showFn()) continue;
      }
      result.push(item);
    }
    return result;
  }, [items]);

  return { filtered };
}
