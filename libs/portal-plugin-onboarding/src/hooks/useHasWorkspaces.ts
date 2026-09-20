import { useList } from "@refinedev/core";

interface WorkspaceItem {
  id: number;
  status: string;
}

interface UseHasWorkspacesReturn {
  hasWorkspace: boolean;
  isBusy: boolean;
  hasError: boolean;
}

/**
 * Workspace existence is the first-class completion signal for website
 * deployment onboarding (instead of Website existence). A user is considered
 * to have completed the deploy step once they have created at least one
 * Workspace; readiness and publishing happen inside the Workspace.
 */
export function useHasWorkspaces(enabled = true): UseHasWorkspacesReturn {
  const { query, result } = useList<WorkspaceItem>({
    resource: "ipfs/workspaces",
    dataProviderName: "ipfs",
    pagination: { pageSize: 1 },
    queryOptions: { enabled },
  });

  const total = result?.total ?? 0;
  const hasWorkspace = total > 0;

  return {
    hasWorkspace,
    isBusy: query.isLoading,
    hasError: query.isError,
  };
}
