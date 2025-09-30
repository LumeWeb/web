import React, { useEffect, useState } from "react";
import { ChevronRight, Home, Folder, ChevronDown } from "lucide-react";
import { useBreadcrumbs } from "@/ui/hooks";
import { SkeletonLoader } from "@lumeweb/portal-framework-ui";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
} from "@lumeweb/portal-framework-ui-core";
import { useFileManagerContext } from "@/ui/context/FileManager";

const ROOT_PATH = "/";

export const Breadcrumbs: React.FC = () => {
  const { currentPath, navigateToPath } = useFileManagerContext();
  const { breadcrumbs, isLoading, error } = useBreadcrumbs({
    path: currentPath,
  });
  const [history, setHistory] = useState<string[]>([]);

  // Add current path to history when it changes
  useEffect(() => {
    if (currentPath) {
      setHistory((prev) => {
        // Remove duplicates and filter out home path if it exists
        const uniqueHistory = prev.filter(
          (path, index) => prev.indexOf(path) === index && path !== ROOT_PATH,
        );
        // Add home path at the beginning if it's not the current path
        if (currentPath !== ROOT_PATH) {
          return [currentPath, ROOT_PATH, ...uniqueHistory.slice(0, 8)]; // Keep only last 10 items (including home)
        } else {
          return [ROOT_PATH, ...uniqueHistory.slice(0, 9)]; // Keep only last 10 items
        }
      });
    }
  }, [currentPath]);

  const getVisibleHistory = () => {
    // Deduplicate history and limit to 10 items
    const uniqueHistory = history.filter(
      (path, index) => history.indexOf(path) === index,
    );

    return uniqueHistory.slice(0, 10).map((path, index) => ({
      path,
      index,
      isCurrent: path === currentPath,
    }));
  };

  const formatPathName = (path: string) => {
    if (path === ROOT_PATH) return "Home";
    return path.split("/").pop() || path;
  };

  if (isLoading) {
    return <SkeletonLoader layout="custom" cols={5} rows={1} className="h-6" />;
  }

  if (error) {
    return (
      <div className="text-muted-foreground">Failed to load breadcrumbs</div>
    );
  }

  // Always show home even if there are no breadcrumbs
  const displayBreadcrumbs =
    breadcrumbs && breadcrumbs.length > 0
      ? breadcrumbs
      : [{ path: ROOT_PATH, name: "Home" }];

  return (
    <nav
      aria-label="Breadcrumb navigation"
      className="flex items-center space-x-1 text-sm">
      <ol aria-label="Breadcrumbs" className="flex items-center">
        {/* Dedicated Home button */}
        <li className="flex items-center">
          <button
            onClick={() => {
              if (ROOT_PATH !== currentPath) {
                navigateToPath(ROOT_PATH);
              }
            }}
            aria-label="Navigate to Home"
            className="hover:bg-muted flex items-center rounded px-3 py-1.5 text-base font-semibold transition-colors">
            <Home
              aria-hidden="true"
              className="text-muted-foreground mr-2 h-5 w-5"
            />
            Home
          </button>
          {currentPath !== ROOT_PATH && (
            <ChevronRight
              aria-hidden="true"
              className="text-muted-foreground mx-1 h-4 w-4"
            />
          )}
        </li>

        {/* Show breadcrumbs only when not at home */}
        {currentPath !== ROOT_PATH &&
          displayBreadcrumbs.map((crumb, index) => (
            <li key={crumb.path} className="flex items-center">
              <button
                onClick={() => {
                  if (crumb.path !== currentPath) {
                    navigateToPath(crumb.path);
                  }
                }}
                aria-label={`Navigate to ${crumb.name}`}
                aria-current={
                  index === displayBreadcrumbs.length - 1
                    ? "page"
                    : undefined
                }
                className={`hover:bg-muted flex items-center rounded px-3 py-1.5 transition-colors ${
                  index === displayBreadcrumbs.length - 1
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}>
                <Folder
                  aria-hidden="true"
                  className="text-muted-foreground mr-2 h-4 w-4"
                />
                {crumb.name}
              </button>
              {index < displayBreadcrumbs.length - 1 && (
                <ChevronRight
                  aria-hidden="true"
                  className="text-muted-foreground mx-1 h-4 w-4"
                />
              )}
            </li>
          ))}
      </ol>

      {/* History Dropdown */}
      {history.length > 1 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-muted px-2"
              title="View history">
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="bg-background border-border w-64">
            <div className="p-2">
              <div className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                Navigation History
              </div>
              <div className="max-h-64 space-y-1 overflow-auto">
                {getVisibleHistory().map(({ path, index, isCurrent }) => (
                  <DropdownMenuItem
                    key={`${path}-${index}`}
                    onClick={() => {
                      if (path !== currentPath) {
                        navigateToPath(path);
                      }
                    }}
                    className={`flex cursor-pointer items-center gap-2 px-2 py-2 ${
                      isCurrent
                        ? "bg-muted text-accent font-medium"
                        : "text-foreground hover:bg-muted"
                    }`}>
                    {path === ROOT_PATH ? (
                      <Home className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <Folder className="h-4 w-4 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{formatPathName(path)}</div>
                      {path !== ROOT_PATH && (
                        <div className="text-muted-foreground truncate text-xs">
                          {path}
                        </div>
                      )}
                    </div>
                    {isCurrent && (
                      <div className="bg-accent text-foreground flex-shrink-0 rounded px-1.5 py-0.5 text-xs">
                        Current
                      </div>
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
              {history.length > 10 && (
                <div className="text-muted-foreground mt-2 px-2 text-center text-xs">
                  Showing recent {Math.min(10, history.length)} of{" "}
                  {history.length} locations
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
};
