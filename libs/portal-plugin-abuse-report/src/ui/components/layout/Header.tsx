import { FlagIcon } from "@/ui/components/icons";
import React from "react";
import { Link } from "react-router";

export function Header({ rightContent }: { rightContent?: React.ReactNode }) {
  return (
    <nav className="border-b border-border py-4">
      <div className="container flex items-center justify-between">
        <Link
          to={{
            pathname: "/",
          }}>
          <div className="flex items-center gap-2">
            <FlagIcon className="h-6 w-6 text-primary" />
            <span className="text-2xl font-semibold text-foreground">
              abuse
            </span>
          </div>
        </Link>
        {rightContent}
      </div>
    </nav>
  );
}
