"use client";

import type { CasePriority, CaseResponse, CaseStatus } from "@/types/case";

import { useDebounce } from "@/hooks/useDebounce";
import { RefineResource } from "@/types/resources";
import { useList } from "@refinedev/core";
import { useEffect, useState } from "react";

export interface BaseSearchResult {
  id: number;
  priority?: CasePriority;
  status?: CaseStatus;
  subtitle?: string;
  title: string;
  type: SearchResultType;
}

export interface CaseSearchResult extends BaseSearchResult {
  priority: CasePriority;
  referenceNumber: string;
  status: CaseStatus;
  type: "case";
}

export interface ReporterSearchResult extends BaseSearchResult {
  email: string;
  type: "reporter";
}

export type SearchResult =
  | CaseSearchResult
  | ReporterSearchResult
  | SubjectSearchResult;

// Define the search result types
export type SearchResultType = "case" | "reporter" | "subject";

export interface SubjectSearchResult extends BaseSearchResult {
  identifier: string;
  type: "subject";
}

export function useGlobalSearch(initialQuery = "", enabled = true) {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResult[]>([]);

  // Use Refine's useList hook for cases
  const { data: casesData, isLoading: isLoadingCases } = useList({
    filters: debouncedQuery
      ? [
          {
            field: "search",
            operator: "contains",
            value: debouncedQuery,
          },
        ]
      : [],
    pagination: {
      current: 1,
      pageSize: 5,
    },
    queryOptions: {
      enabled: !!debouncedQuery && enabled, // Only run when there's a query and enabled
    },
    resource: RefineResource.Case,
  });

  // Use Refine's useList hook for reporters
  const { data: reportersData, isLoading: isLoadingReporters } = useList({
    filters: debouncedQuery
      ? [
          {
            field: "q",
            operator: "contains",
            value: debouncedQuery,
          },
        ]
      : [],
    pagination: {
      current: 1,
      pageSize: 5,
    },
    //@ts-ignore
    queryOptions: {
      enabled: !!debouncedQuery && enabled, // Only run when there's a query and enabled
    },
    resource: RefineResource.Reporter,
  });

  // Use Refine's useList hook for subjects
  const { data: subjectsData, isLoading: isLoadingSubjects } = useList({
    filters: debouncedQuery
      ? [
          {
            field: "q",
            operator: "contains",
            value: debouncedQuery,
          },
        ]
      : [],
    pagination: {
      current: 1,
      pageSize: 5,
    },
    //@ts-ignore
    queryOptions: {
      enabled: !!debouncedQuery && enabled, // Only run when there's a query and enabled
    },
    resource: RefineResource.Subject,
  });

  const isSearching = isLoadingCases || isLoadingReporters || isLoadingSubjects;

  // Combine results when data changes
  useEffect(() => {
    if (!isSearching && debouncedQuery && enabled) {
      const caseResults: CaseSearchResult[] = (casesData?.data || []).map(
        (caseItem: CaseResponse) => ({
          id: caseItem.id,
          priority: caseItem.priority,
          referenceNumber: caseItem.referenceNumber,
          status: caseItem.status,
          subtitle:
            caseItem.description.substring(0, 60) +
            (caseItem.description.length > 60 ? "..." : ""),
          title: `Case ${caseItem.referenceNumber}`,
          type: "case",
        }),
      );

      const reporterResults: ReporterSearchResult[] = (
        reportersData?.data || []
      ).map((reporter: any) => ({
        email: reporter.email,
        id: reporter.id,
        subtitle: `${reporter.totalReportedCases} reported cases`,
        title: reporter.name,
        type: "reporter",
      }));

      const subjectResults: SubjectSearchResult[] = (
        subjectsData?.data || []
      ).map((subject: any) => ({
        id: subject.id,
        identifier: subject.identifier,
        subtitle: `${subject.totalAssociatedCases || 0} associated cases`,
        title: subject.identifier,
        type: "subject",
      }));

      setResults([...caseResults, ...reporterResults, ...subjectResults]);
    } else if (!debouncedQuery) {
      setResults([]);
    }
  }, [
    casesData,
    reportersData,
    subjectsData,
    isSearching,
    debouncedQuery,
    enabled,
  ]);

  return {
    debouncedQuery,
    isSearching,
    query,
    results,
    setQuery,
  };
}
