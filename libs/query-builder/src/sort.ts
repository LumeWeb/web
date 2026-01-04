import type { CrudSort } from "@refinedev/core";

/**
 * Creates a sort configuration
 */
export function createSort(field: string, order: "asc" | "desc"): CrudSort {
  return { field, order };
}

/**
 * Creates an ascending sort
 */
export function createAscSort(field: string): CrudSort {
  return { field, order: "asc" };
}

/**
 * Creates a descending sort
 */
export function createDescSort(field: string): CrudSort {
  return { field, order: "desc" };
}

/**
 * Toggles the order of a sort
 */
export function toggleSort(sort: CrudSort): CrudSort {
  return {
    field: sort.field,
    order: sort.order === "asc" ? "desc" : "asc",
  };
}

/**
 * Checks if a sorter exists for a specific field
 */
export function hasSorter(sorters: CrudSort[], field: string): boolean {
  return sorters.some((s) => s.field === field);
}

/**
 * Finds a sorter for a specific field
 */
export function findSorter(
  sorters: CrudSort[],
  field: string,
): CrudSort | undefined {
  return sorters.find((s) => s.field === field);
}

/**
 * Removes a sorter for a specific field
 */
export function removeSorter(sorters: CrudSort[], field: string): CrudSort[] {
  return sorters.filter((s) => s.field !== field);
}

/**
 * Updates the order of a sorter for a specific field
 */
export function updateSorterOrder(
  sorters: CrudSort[],
  field: string,
  order: "asc" | "desc",
): CrudSort[] {
  return sorters.map((s) => {
    if (s.field === field) {
      return { ...s, order };
    }
    return s;
  });
}

/**
 * Reverses all sorters
 */
export function reverseSorters(sorters: CrudSort[]): CrudSort[] {
  return sorters.map((s) => ({
    field: s.field,
    order: s.order === "asc" ? "desc" : "asc",
  }));
}

/**
 * Adds a sorter to the sorters array (immutable)
 */
export function addSorter(sorters: CrudSort[], sorter: CrudSort): CrudSort[] {
  return [...sorters, sorter];
}

/**
 * Adds multiple sorters to the sorters array (immutable)
 */
export function addSorters(
  sorters: CrudSort[],
  newSorters: CrudSort[],
): CrudSort[] {
  return [...sorters, ...newSorters];
}

/**
 * Sets a sorter for a specific field (replaces existing if present, immutable)
 */
export function setSorter(
  sorters: CrudSort[],
  field: string,
  order: "asc" | "desc",
): CrudSort[] {
  const withoutField = removeSorter(sorters, field);
  return [...withoutField, { field, order }];
}

/**
 * Toggles a sorter for a specific field (adds or toggles, immutable)
 */
export function toggleSorter(sorters: CrudSort[], field: string): CrudSort[] {
  const existing = findSorter(sorters, field);
  if (existing) {
    return updateSorterOrder(
      sorters,
      field,
      existing.order === "asc" ? "desc" : "asc",
    );
  }
  return [...sorters, createAscSort(field)];
}

/**
 * Clears all sorters (immutable)
 */
export function clearSorters(sorters: CrudSort[]): CrudSort[] {
  return [];
}

/**
 * Gets all sort field names
 */
export function getSortFields(sorters: CrudSort[]): string[] {
  return sorters.map((s) => s.field);
}
