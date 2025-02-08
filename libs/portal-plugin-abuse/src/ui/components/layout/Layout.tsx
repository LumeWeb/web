import type { ReactNode } from "react";

import { GlobalSearch } from "@/ui/components/search/GlobalSearch";
import { SearchCommand } from "@/ui/components/search/SearchCommand";
import React from "react";

interface LayoutProps {
  children?: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex">
      <div className="flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-6">
          <GlobalSearch />
        </header>
        <main className="h-full">{children}</main>
        <SearchCommand />
      </div>
    </div>
  );
}
