import React, { useEffect, useState } from "react";
import { useBreadcrumbs } from "@/ui/hooks";
import { SkeletonLoader } from "@lumeweb/portal-framework-ui";
import { useMobileDetection } from "@lumeweb/portal-framework-ui-core";
import { useFileManagerContext } from "@/ui/context/FileManager";
import { HomeButton } from "./HomeButton";
import { BreadcrumbTrail } from "./BreadcrumbTrail";
import { HistoryDropdown } from "./HistoryDropdown";

export const ROOT_PATH = "/";

export interface BreadcrumbItem {
  path: string;
  name: string;
}

export const Breadcrumbs: React.FC = () => {
  const { currentPath, navigateToPath } = useFileManagerContext();
  const { breadcrumbs, isLoading, error } = useBreadcrumbs({
    path: currentPath,
  });
  const { isMobile: isMobileView } = useMobileDetection({ breakpoint: 768 });
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
      <div className="flex items-center w-full">
        <HomeButton 
          currentPath={currentPath} 
          navigateToPath={navigateToPath} 
          isMobile={isMobileView} 
        />
        
        {currentPath !== ROOT_PATH && (
          <BreadcrumbTrail 
            breadcrumbs={displayBreadcrumbs} 
            currentPath={currentPath} 
            navigateToPath={navigateToPath} 
            isMobile={isMobileView}
          />
        )}
        
        <HistoryDropdown
          history={history}
          currentPath={currentPath}
          navigateToPath={navigateToPath}
          formatPathName={formatPathName}
          isMobile={isMobileView}
        />
      </div>
    </nav>
  );
};
