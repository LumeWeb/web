import React from "react";
import { ChevronDown, Home, Folder } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
  cn,
} from "@lumeweb/portal-framework-ui-core";

export interface HistoryDropdownProps {
  history: string[];
  currentPath: string;
  navigateToPath: (path: string) => void;
  formatPathName: (path: string) => string;
  isMobile?: boolean;
}

export const HistoryDropdown: React.FC<HistoryDropdownProps> = ({
  history,
  currentPath,
  navigateToPath,
  formatPathName,
  isMobile = false,
}) => {
  const ROOT_PATH = "/";

  if (history.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center flex-shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-muted-foreground hover:text-foreground hover:bg-muted min-h-[2.75em] min-w-[2.75em]",
              {
                "px-1 py-2 text-xs": isMobile,
                "px-2 py-3 text-sm": !isMobile,
              }
            )}
            title="View history">
            <ChevronDown 
              className={cn({
                "h-3 w-3": isMobile,
                "h-4 w-4": !isMobile,
              })} 
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={cn(
            "bg-background border-border max-w-[90vw]",
            {
              "w-48 py-1 text-xs": isMobile,
              "w-64 p-2 text-sm": !isMobile,
            }
          )}>
          <div className={cn({ "px-2 py-1": isMobile, "p-2": !isMobile })}>
            <div className={cn(
              "font-medium uppercase tracking-wide text-gray-400",
              {
                "mb-1 px-2 text-[10px]": isMobile,
                "mb-2 px-2 text-xs": !isMobile,
              }
            )}>
              Navigation History
            </div>
            <div className={cn(
              "overflow-auto",
              {
                "max-h-48 space-y-0": isMobile,
                "max-h-64 space-y-1": !isMobile,
              }
            )}>
              {history.slice(0, 10).map((path, index) => {
                const isCurrent = path === currentPath;
                return (
                  <DropdownMenuItem
                    key={`${path}-${index}`}
                    onClick={() => {
                      if (path !== currentPath) {
                        navigateToPath(path);
                      }
                    }}
                    className={cn(
                      "flex cursor-pointer items-center min-w-[0]",
                      {
                        "px-2 py-1.5 text-xs gap-1": isMobile,
                        "px-2 py-3 text-sm gap-2": !isMobile,
                      },
                      {
                        "bg-muted text-accent font-medium": isCurrent,
                        "text-foreground hover:bg-muted": !isCurrent,
                      }
                    )}>
                    {path === ROOT_PATH ? (
                      <Home 
                        className={cn(
                          "flex-shrink-0",
                          {
                            "h-3 w-3": isMobile,
                            "h-4 w-4": !isMobile,
                          }
                        )} 
                      />
                    ) : (
                      <Folder 
                        className={cn(
                          "flex-shrink-0",
                          {
                            "h-3 w-3": isMobile,
                            "h-4 w-4": !isMobile,
                          }
                        )} 
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div 
                        className="truncate"
                        title={formatPathName(path)}
                      >
                        {formatPathName(path)}
                      </div>
                      {path !== ROOT_PATH && (
                        <div 
                          className={cn(
                            "text-muted-foreground truncate",
                            {
                              "text-[9px] mt-0.5": isMobile,
                              "text-xs": !isMobile,
                            }
                          )}
                          title={path}
                        >
                          {path}
                        </div>
                      )}
                    </div>
                    {isCurrent && (
                      <div className={cn(
                        "bg-accent text-foreground flex-shrink-0 rounded text-xs",
                        {
                          "px-1 py-0.5": isMobile,
                          "px-1.5 py-0.5": !isMobile,
                        }
                      )}>
                        Current
                      </div>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </div>
            {history.length > 10 && (
              <div className={cn(
                "text-muted-foreground text-center",
                {
                  "mt-1 px-2 text-[9px]": isMobile,
                  "mt-2 px-2 text-xs": !isMobile,
                }
              )}>
                Showing recent {Math.min(10, history.length)} of{" "}
                {history.length} locations
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
