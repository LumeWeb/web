import { type SearchResult, useGlobalSearch } from "@/hooks/useGlobalSearch";
import { CommandDialog, CommandList } from "@lumeweb/portal-framework-ui-core";
import { useGo } from "@refinedev/core";
import { Search } from "lucide-react";
import React from "react";
import { useEffect, useState } from "react";

import { SearchResults } from "./SearchResults";

export function SearchCommand() {
  const go = useGo();
  const [open, setOpen] = useState(false);
  const { isSearching, query, results, setQuery } = useGlobalSearch("", open);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");

    go({
      to: {
        action: "show",
        id: result.id,
        resource: result.type,
      },
    });
  };

  return (
    <>
      <p className="fixed bottom-0 left-0 right-0 hidden border-t bg-background p-1 text-center text-xs text-muted-foreground md:block">
        Press{" "}
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>{" "}
        to search
      </p>
      <CommandDialog
        className="overflow-hidden"
        onOpenChange={setOpen}
        open={open}>
        <div className="flex items-center border-b px-3 py-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="flex h-8 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Global search"
            value={query}
          />
        </div>
        <CommandList className="max-h-[400px] overflow-auto p-1">
          <SearchResults
            emptyMessage="Start typing to search cases, reporters, and subjects..."
            isSearching={isSearching}
            loadingMessage="Searching..."
            noResultsMessage="No results found."
            onSelect={handleSelect}
            query={query}
            results={results}
          />
        </CommandList>
      </CommandDialog>
    </>
  );
}
