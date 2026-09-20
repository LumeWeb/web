import { useList } from "@refinedev/core";
import type { WebsiteItem, WorkspaceResponse } from "@lumeweb/pinner";

import {
  normalizeSites,
  type SiteRow,
} from "../components/sites/sitesModel";

export interface UseSitesReturn {
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  refetch: () => void;
  rows: SiteRow[];
  websites: WebsiteItem[];
  workspaces: WorkspaceResponse[];
}

/**
 * Backend maximum for the portal list API page size (`ipfs/workspaces`,
 * `ipfs/websites`). The API rejects any `pageSize` above this with HTTP 400
 * "error parsing pagination: pageSize: cannot exceed 100".
 */
export const SITES_MAX_PAGE_SIZE = 100;

/**
 * Page size used by the unified Sites queries. Must stay at or below
 * {@link SITES_MAX_PAGE_SIZE} — the backend rejects larger values.
 */
export const SITES_PAGE_SIZE = SITES_MAX_PAGE_SIZE;

/**
 * Refine pagination config for the unified Sites list queries. The page size
 * is capped at {@link SITES_MAX_PAGE_SIZE} because the portal backend rejects
 * any `pageSize` above it with an HTTP 400.
 */
export function sitesPagination() {
  return { mode: "server", pageSize: SITES_PAGE_SIZE } as const;
}

/**
 * Composes the unified Sites list from the `ipfs/workspaces` and
 * `ipfs/websites` Refine resources.
 *
 * All Workspace and Website pages are fetched so that Website rows are never
 * mis-classified as external based only on the current Workspace page.
 * Normalization is presentation-only (see sitesModel).
 */
export function useSites(enabled = true): UseSitesReturn {
  const workspacesQuery = useList<WorkspaceResponse>({
    dataProviderName: "ipfs",
    // Fetch the first page of Workspaces (up to the backend max pageSize of
    // 100) so a Website attached to a later page of Workspaces is never
    // mis-classified as external. `mode: "off"` falls back to server mode with
    // pageSize 10. The backend rejects pageSize > SITES_MAX_PAGE_SIZE.
    pagination: sitesPagination(),
    queryOptions: { enabled, retry: false },
    resource: "ipfs/workspaces",
  });

  const websitesQuery = useList<WebsiteItem>({
    dataProviderName: "ipfs",
    pagination: sitesPagination(),
    queryOptions: { enabled, retry: false },
    resource: "ipfs/websites",
  });

  const workspaces = (workspacesQuery.result?.data ?? []) as WorkspaceResponse[];
  const websites = (websitesQuery.result?.data ?? []) as WebsiteItem[];

  const isLoading =
    workspacesQuery.query?.isLoading || websitesQuery.query?.isLoading;
  const isError = workspacesQuery.query?.isError || websitesQuery.query?.isError;
  const error = workspacesQuery.query?.error ?? websitesQuery.query?.error;

  const rows: SiteRow[] = normalizeSites(workspaces, websites);

  return {
    error,
    isError,
    isLoading,
    refetch: () => {
      workspacesQuery.query?.refetch();
      websitesQuery.query?.refetch();
    },
    rows,
    websites,
    workspaces,
  };
}
