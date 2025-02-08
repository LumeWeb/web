import type { CrudFilters } from "@refinedev/core";

import { BrowserLevel } from "browser-level";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// Type definitions for saved filters
export interface SavedFilter {
  createdAt: string;
  filters: CrudFilters;
  id: string;
  isDefault?: boolean;
  name: string;
  updatedAt: string;
}

export type SavedFiltersStore = Record<string, SavedFilter[]>;

// Function to generate SHA-256 hash
export async function generateHash(input: string): Promise<string> {
  // Use the Web Crypto API to generate a SHA-256 hash
  const msgUint8 = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Function to generate a storage key for a specific resource
export async function generateStorageKey(resource: string): Promise<string> {
  // Combine domain and resource for a unique key
  const domain =
    typeof window !== "undefined" ? window.location.hostname : "localhost";
  return generateHash(`${domain}:${resource}`);
}

// Create a custom storage for jotai that uses browser-level
const createBrowserLevelStorage = () => {
  // Create a browser-level instance for saved filters
  const db = new BrowserLevel("saved-filters", {
    prefix: "", // No prefix needed
    version: 1,
  });

  // Open the database when the storage is created
  const dbPromise = db.open();

  // Create a storage object compatible with atomWithStorage
  return {
    // Add a method to close the database when needed
    close: async (): Promise<void> => {
      try {
        await db.close();
      } catch (error) {
        console.error("Error closing browser-level:", error);
      }
    },

    getItem: async (
      key: string,
      initialValue: SavedFiltersStore,
    ): Promise<SavedFiltersStore> => {
      try {
        // Ensure database is open
        await dbPromise;

        try {
          // Try to get the value from the database
          const value = await db.get(key, { valueEncoding: "json" });
          // Properly handle the type - browser-level with json encoding returns the parsed object
          return value as unknown as SavedFiltersStore;
        } catch (error: any) {
          // If key not found, return initial value
          if (error.code === "LEVEL_NOT_FOUND") {
            return initialValue;
          }
          throw error;
        }
      } catch (error) {
        console.error("Error reading from browser-level:", error);
        return initialValue;
      }
    },

    removeItem: async (key: string): Promise<void> => {
      try {
        // Ensure database is open
        await dbPromise;

        // Delete the key from the database
        await db.del(key);
      } catch (error) {
        console.error("Error deleting from browser-level:", error);
      }
    },

    setItem: async (key: string, value: SavedFiltersStore): Promise<void> => {
      try {
        // Ensure database is open
        await dbPromise;

        // Store the value in the database
        await db.put(key, value, { valueEncoding: "json" });
      } catch (error) {
        console.error("Error writing to browser-level:", error);
      }
    },
  };
};

// Create the browser-level storage
const browserLevelStorage = createBrowserLevelStorage();

// Create the atom for saved filters with browser-level storage
export const savedFiltersAtom = atomWithStorage<SavedFiltersStore>(
  "savedFilters",
  {},
  browserLevelStorage,
);

// Atom for the current resource's saved filters
export const resourceFiltersAtom = atom<SavedFilter[]>([]);

// Make this a writable atom to fix the TypeScript errors
export const selectedFilterAtom = atom(
  (_) => null as null | SavedFilter,
  (_, set, update: null | SavedFilter) => {
    set(selectedFilterAtom, update);
  },
);

// Derived atom to get filters for a specific resource
export const getResourceFiltersAtom = atom(
  null,
  async (get, set, resource: string) => {
    const allFilters = get(savedFiltersAtom);
    const storageKey = await generateStorageKey(resource);
    const filters = allFilters[storageKey] || [];
    set(resourceFiltersAtom, filters);

    // Set default filter if available and no filter is selected
    const currentSelected = get(selectedFilterAtom);
    if (!currentSelected) {
      const defaultFilter = filters.find((f) => f.isDefault);
      if (defaultFilter) {
        // Now this will work with the writable atom
        set(selectedFilterAtom, defaultFilter);
      }
    }

    return filters;
  },
);

// Action atom to save a new filter
export const saveFilterAtom = atom(
  null,
  async (
    get,
    set,
    {
      filters,
      isDefault = false,
      name,
      resource,
    }: {
      filters: CrudFilters;
      isDefault?: boolean;
      name: string;
      resource: string;
    },
  ) => {
    const allFilters = get(savedFiltersAtom);
    const storageKey = await generateStorageKey(resource);

    const newFilter: SavedFilter = {
      createdAt: new Date().toISOString(),
      filters,
      id: await generateHash(`${name}:${Date.now()}`),
      isDefault,
      name,
      updatedAt: new Date().toISOString(),
    };

    // Get existing filters for this resource
    const resourceFilters = allFilters[storageKey] || [];

    // If this is set as default, remove default from others
    let updatedFilters = resourceFilters;
    if (isDefault) {
      updatedFilters = resourceFilters.map((filter) => ({
        ...filter,
        isDefault: false,
      }));
    }

    // Add the new filter
    updatedFilters = [...updatedFilters, newFilter];

    // Update the store
    const updatedStore = {
      ...allFilters,
      [storageKey]: updatedFilters,
    };

    set(savedFiltersAtom, updatedStore);
    set(resourceFiltersAtom, updatedFilters);
    set(selectedFilterAtom, newFilter);

    return newFilter;
  },
);

// Action atom to update an existing filter
export const updateFilterAtom = atom(
  null,
  async (
    get,
    set,
    {
      filterId,
      resource,
      updates,
    }: {
      filterId: string;
      resource: string;
      updates: Partial<SavedFilter>;
    },
  ) => {
    const allFilters = get(savedFiltersAtom);
    const storageKey = await generateStorageKey(resource);

    // Get existing filters for this resource
    const resourceFilters = allFilters[storageKey] || [];

    // If setting as default, remove default from others
    let updatedFilters = resourceFilters;
    if (updates.isDefault) {
      updatedFilters = resourceFilters.map((filter) => ({
        ...filter,
        isDefault: false,
      }));
    }

    // Update the specific filter
    updatedFilters = updatedFilters.map((filter) => {
      if (filter.id === filterId) {
        return {
          ...filter,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return filter;
    });

    // Update the store
    const updatedStore = {
      ...allFilters,
      [storageKey]: updatedFilters,
    };

    set(savedFiltersAtom, updatedStore);
    set(resourceFiltersAtom, updatedFilters);

    // Update selected filter if it was the one modified
    const currentSelected = get(selectedFilterAtom);
    if (currentSelected && currentSelected.id === filterId) {
      const updatedFilter = updatedFilters.find((f) => f.id === filterId);
      if (updatedFilter) {
        set(selectedFilterAtom, updatedFilter);
      }
    }

    return updatedFilters.find((f) => f.id === filterId);
  },
);

// Action atom to delete a filter
export const deleteFilterAtom = atom(
  null,
  async (
    get,
    set,
    {
      filterId,
      resource,
    }: {
      filterId: string;
      resource: string;
    },
  ) => {
    const allFilters = get(savedFiltersAtom);
    const storageKey = await generateStorageKey(resource);

    // Get existing filters for this resource
    const resourceFilters = allFilters[storageKey] || [];

    // Remove the filter
    const updatedFilters = resourceFilters.filter(
      (filter) => filter.id !== filterId,
    );

    // Update the store
    const updatedStore = {
      ...allFilters,
      [storageKey]: updatedFilters,
    };

    set(savedFiltersAtom, updatedStore);
    set(resourceFiltersAtom, updatedFilters);

    // Clear selected filter if it was the one deleted
    const currentSelected = get(selectedFilterAtom);
    if (currentSelected && currentSelected.id === filterId) {
      set(selectedFilterAtom, null);
    }

    return true;
  },
);

// Action atom to apply a saved filter
export const applyFilterAtom = atom(null, (get, set, filterId: string) => {
  const resourceFilters = get(resourceFiltersAtom);
  const filter = resourceFilters.find((f) => f.id === filterId);

  if (filter) {
    set(selectedFilterAtom, filter);
    return filter.filters;
  }

  return null;
});

// Action atom to clear the selected filter
export const clearSelectedFilterAtom = atom(null, (get, set) => {
  set(selectedFilterAtom, null);
  return true;
});
