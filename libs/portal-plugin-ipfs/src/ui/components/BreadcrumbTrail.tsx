import React from "react";
import { Folder, ChevronRight } from "lucide-react";
import { cn } from "@lumeweb/portal-framework-ui-core";
import { BreadcrumbItem } from "./Breadcrumbs";

export interface BreadcrumbTrailProps {
  breadcrumbs: BreadcrumbItem[];
  currentPath: string;
  navigateToPath: (path: string) => void;
  isMobile?: boolean;
}

export const BreadcrumbTrail: React.FC<BreadcrumbTrailProps> = ({
  breadcrumbs,
  currentPath,
  navigateToPath,
  isMobile = false,
}) => {
  // Mobile collapsing logic: show first 1-2 items, ellipsis, then last item
  const MobileCollapsedBreadcrumbs: React.FC<BreadcrumbTrailProps> = ({
    breadcrumbs,
    currentPath,
    navigateToPath,
    isMobile = false,
  }) => {
    const firstItems = breadcrumbs.slice(0, isMobile ? 1 : 2);
    const lastItem = breadcrumbs[breadcrumbs.length - 1];

    return (
      <div className="scrollbar-hide flex items-center overflow-x-auto">
        {firstItems.map((crumb, index) => (
          <div key={crumb.path} className="flex flex-shrink-0 items-center">
            <button
              onClick={() => {
                if (crumb.path !== currentPath) {
                  navigateToPath(crumb.path);
                }
              }}
              aria-label={`Navigate to ${crumb.name}`}
              aria-current={
                crumb.path === breadcrumbs[breadcrumbs.length - 1].path
                  ? "page"
                  : undefined
              }
              className={cn(
                "hover:bg-muted flex min-h-[2.25em] min-w-[2.25em] items-center rounded transition-colors",
                {
                  "px-1.5 py-1.5 text-xs": isMobile,
                  "px-2 py-2 text-sm": !isMobile,
                },
                {
                  "text-foreground font-medium":
                    crumb.path === breadcrumbs[breadcrumbs.length - 1].path,
                  "text-muted-foreground hover:text-foreground":
                    crumb.path !== breadcrumbs[breadcrumbs.length - 1].path,
                },
              )}>
              <Folder
                aria-hidden="true"
                className={cn("text-muted-foreground", {
                  "mr-1 h-3 w-3": isMobile,
                  "mr-1 h-4 w-4": !isMobile,
                })}
              />
              <span
                className={cn("truncate", {
                  "max-w-56": isMobile,
                  "max-w-full": !isMobile,
                })}
                title={crumb.name}>
                {crumb.name}
              </span>
            </button>
            <ChevronRight
              aria-hidden="true"
              className="text-muted-foreground mx-1 h-4 w-4"
            />
          </div>
        ))}

        <div className="flex flex-shrink-0 items-center">
          <span
            className={`text-muted-foreground ${isMobile ? "mx-0.5 text-xs" : "mx-1 text-sm"} `}>
            ...
          </span>
          <ChevronRight
            aria-hidden="true"
            className={cn("text-muted-foreground", {
              "mx-0.5 h-3 w-3": isMobile,
              "mx-1 h-4 w-4": !isMobile,
            })}
          />
        </div>

        <div className="flex flex-shrink-0 items-center">
          <button
            onClick={() => {
              if (lastItem.path !== currentPath) {
                navigateToPath(lastItem.path);
              }
            }}
            aria-label={`Navigate to ${lastItem.name}`}
            aria-current="page"
            className={cn(
              "hover:bg-muted text-foreground flex min-h-[2.25em] min-w-[2.25em] items-center rounded font-medium transition-colors",
              {
                "px-1.5 py-1.5 text-xs": isMobile,
                "px-2 py-2 text-sm": !isMobile,
              },
            )}>
            <Folder
              aria-hidden="true"
              className={cn("text-muted-foreground", {
                "mr-1 h-3 w-3": isMobile,
                "mr-1 h-4 w-4": !isMobile,
              })}
            />
            <span
              className={cn("truncate", {
                "max-w-56": isMobile,
                "max-w-full": !isMobile,
              })}
              title={lastItem.name}>
              {lastItem.name}
            </span>
          </button>
        </div>
      </div>
    );
  };

  // Desktop or mobile with few breadcrumbs - show all
  const FullBreadcrumbs: React.FC<BreadcrumbTrailProps> = ({
    breadcrumbs,
    currentPath,
    navigateToPath,
    isMobile = false,
  }) => {
    return (
      <div className="scrollbar-hide flex items-center overflow-x-auto">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex flex-shrink-0 items-center">
            <button
              onClick={() => {
                if (crumb.path !== currentPath) {
                  navigateToPath(crumb.path);
                }
              }}
              aria-label={`Navigate to ${crumb.name}`}
              aria-current={
                index === breadcrumbs.length - 1 ? "page" : undefined
              }
              className={cn(
                "hover:bg-muted flex min-h-[2.75em] min-w-[2.75em] items-center rounded transition-colors",
                {
                  "px-2 py-2 text-sm": isMobile,
                  "px-3 py-3 text-base": !isMobile,
                },
                {
                  "text-foreground font-medium":
                    index === breadcrumbs.length - 1,
                  "text-muted-foreground hover:text-foreground":
                    index !== breadcrumbs.length - 1,
                },
              )}>
              <Folder
                aria-hidden="true"
                className={cn("text-muted-foreground", {
                  "mr-1.5 h-3.5 w-3.5": isMobile,
                  "mr-2 h-4 w-4": !isMobile,
                })}
              />
              <span
                className={cn("truncate", {
                  "max-w-56": isMobile,
                  "max-w-full": !isMobile,
                })}
                title={crumb.name}>
                {crumb.name}
              </span>
            </button>
            {index < breadcrumbs.length - 1 && (
              <ChevronRight
                aria-hidden="true"
                className={`text-muted-foreground ${isMobile ? "mx-0.5 h-3 w-3" : "mx-1 h-4 w-4"} `}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (isMobile && breadcrumbs.length > 3) {
    return (
      <MobileCollapsedBreadcrumbs
        breadcrumbs={breadcrumbs}
        currentPath={currentPath}
        navigateToPath={navigateToPath}
        isMobile={isMobile}
      />
    );
  }

  return (
    <FullBreadcrumbs
      breadcrumbs={breadcrumbs}
      currentPath={currentPath}
      navigateToPath={navigateToPath}
      isMobile={isMobile}
    />
  );
};
