import type { SearchResult, SearchResultType } from "@/hooks/useGlobalSearch";

import { CasePriorityBadge } from "@/ui/components/case-management/CasePriorityBadge";
import { CaseStatusBadge } from "@/ui/components/case-management/CaseStatusBadge";
import { AlertTriangle, FileText, User } from "lucide-react";
import React from "react";

interface SearchResultsProps {
  className?: string;
  emptyMessage?: string;
  groupClassName?: string;
  isSearching: boolean;
  itemClassName?: string;
  loadingMessage?: string;
  noResultsMessage?: string;
  onSelect: (result: SearchResult) => void;
  query: string;
  results: SearchResult[];
}

export function SearchResults({
  className = "",
  emptyMessage = "Start typing to search...",
  groupClassName = "mb-2",
  isSearching,
  itemClassName = "flex flex-col w-full cursor-pointer rounded-md px-2 py-2 hover:bg-accent",
  loadingMessage = "Searching...",
  noResultsMessage = "No results found.",
  onSelect,
  query,
  results,
}: SearchResultsProps) {
  const getIcon = (type: SearchResultType) => {
    switch (type) {
      case "case":
        return <FileText className="mr-2 h-4 w-4 text-muted-foreground" />;
      case "reporter":
        return <User className="mr-2 h-4 w-4 text-muted-foreground" />;
      case "subject":
        return <AlertTriangle className="mr-2 h-4 w-4 text-muted-foreground" />;
    }
  };

  if (isSearching) {
    return (
      <div className="py-6 text-center">
        <div className="h-6 w-6 animate-spin mx-auto text-muted-foreground">
          ⟳
        </div>
        <p className="text-sm text-muted-foreground mt-2">{loadingMessage}</p>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="py-6 px-2 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  if (query && results.length === 0) {
    return (
      <div className="py-6 px-2 text-center">
        <p className="text-sm text-muted-foreground">{noResultsMessage}</p>
      </div>
    );
  }

  // Group results by type
  const caseResults = results.filter((r) => r.type === "case");
  const reporterResults = results.filter((r) => r.type === "reporter");
  const subjectResults = results.filter((r) => r.type === "subject");

  return (
    <div className={className}>
      {/* Case */}
      {caseResults.length > 0 && (
        <div className={groupClassName}>
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Cases
          </div>
          <div className="space-y-1">
            {caseResults.map((result) => (
              <div
                className={itemClassName}
                key={`case-${result.id}`}
                onClick={() => onSelect(result)}>
                <div className="flex items-center">
                  {getIcon(result.type)}
                  <span className="font-medium">{result.title}</span>
                  <div className="ml-auto flex gap-2">
                    <CaseStatusBadge status={result.status} />
                    <CasePriorityBadge priority={result.priority} />
                  </div>
                </div>
                {result.subtitle && (
                  <p className="text-xs text-muted-foreground ml-6 mt-1 line-clamp-1">
                    {result.subtitle}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reporter */}
      {reporterResults.length > 0 && (
        <div className={groupClassName}>
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Reporters
          </div>
          <div className="space-y-1">
            {reporterResults.map((result) => (
              <div
                className={itemClassName}
                key={`reporter-${result.id}`}
                onClick={() => onSelect(result)}>
                <div className="flex items-center">
                  {getIcon(result.type)}
                  <span className="font-medium">{result.title}</span>
                </div>
                <p className="text-xs text-muted-foreground ml-6 mt-1">
                  {result.email} • {result.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subject */}
      {subjectResults.length > 0 && (
        <div className={groupClassName}>
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Subjects
          </div>
          <div className="space-y-1">
            {subjectResults.map((result) => (
              <div
                className={itemClassName}
                key={`subject-${result.id}`}
                onClick={() => onSelect(result)}>
                <div className="flex items-center">
                  {getIcon(result.type)}
                  <span className="font-medium">{result.title}</span>
                </div>
                <p className="text-xs text-muted-foreground ml-6 mt-1">
                  {result.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
