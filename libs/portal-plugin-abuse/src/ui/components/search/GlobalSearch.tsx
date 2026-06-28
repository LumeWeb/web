import { type SearchResult, useGlobalSearch } from "@/hooks/useGlobalSearch";
import { useGo } from "@refinedev/core";
import { lazyIcon } from "@lumeweb/portal-framework-ui-core";

import { useEffect, useRef, useState } from "react";
import React from "react";

import { SearchResults } from "./SearchResults";
const Search = lazyIcon("Search");
const X = lazyIcon("X");


export function GlobalSearch() {
  const go = useGo();
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { isSearching, query, results, setQuery } = useGlobalSearch();

  // Handle clicks outside the search component to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (result: SearchResult) => {
    setIsFocused(false);
    setQuery("");

    go({
      to: {
        action: "show",
        id: result.id,
        resource: result.type,
      },
    });
  };

  const clearSearch = () => {
    setQuery("");
  };

  const showResults = isFocused && (!!query || results.length > 0);

  return (
    <div className="relative w-1/4 min-w-[250px]" ref={searchRef}>
      <div className="relative">
        <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Global search"
            type="text"
            value={query}
          />
          {query && (
            <button
              aria-label="Clear search"
              className="ml-1 rounded-full p-1 hover:bg-muted"
              onClick={clearSearch}
              type="button">
              <X className="h-4 w-4 opacity-50" />
            </button>
          )}
        </div>
      </div>

      {showResults && (
        <div className="absolute top-[calc(100%+4px)] left-0 z-50 w-full overflow-hidden rounded-md border bg-popover shadow-md animate-in fade-in-0 zoom-in-95">
          <div className="max-h-[300px] overflow-auto p-1">
            <SearchResults
              isSearching={isSearching}
              onSelect={handleSelect}
              query={query}
              results={results}
            />
          </div>
        </div>
      )}
    </div>
  );
}
