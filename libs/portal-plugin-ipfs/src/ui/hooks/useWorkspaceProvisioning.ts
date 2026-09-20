import { useCustom } from "@refinedev/core";
import type { WorkspaceResponse } from "@lumeweb/pinner";
import { WorkspaceStatus } from "@lumeweb/pinner";

const TERMINAL_STATES: readonly string[] = [
  WorkspaceStatus.READY,
  WorkspaceStatus.FAILED,
  WorkspaceStatus.SUSPENDED,
  WorkspaceStatus.DELETING,
];

/**
 * True when a Workspace has reached a terminal lifecycle state where polling
 * should stop. Exported for focused unit testing.
 */
export function isTerminalStatus(status: string | undefined): boolean {
  return status != null && TERMINAL_STATES.includes(status);
}

/**
 * Reads the workspace being provisioned by ID using the `ipfs/workspaces`
 * Refine resource. Polls until a terminal lifecycle state is reached
 * (`ready`, `failed`, `suspended`, or `deleting`) so the provisioning screen
 * never polls forever. Refresh-safe: the ID comes from the URL, not transient
 * navigation state.
 */
export function useWorkspaceProvisioning(id: number | string | undefined) {
  const { query, result } = useCustom<WorkspaceResponse>({
    dataProviderName: "ipfs",
    method: "get",
    queryOptions: {
      enabled: id != null,
      refetchInterval: (activeQuery) => {
        const ws = activeQuery.state.data?.data as
          | undefined
          | WorkspaceResponse;
        return isTerminalStatus(ws?.status) ? false : 3000;
      },
      retry: false,
    },
    url: id != null ? `/api/workspaces/${id}` : "/api/workspaces/none",
  });

  const workspace = result.data;

  return {
    error: query.error,
    isError: query.isError,
    isFailed: workspace?.status === WorkspaceStatus.FAILED,
    isLoading: query.isLoading,
    isReady: workspace?.status === WorkspaceStatus.READY,
    isTerminal: isTerminalStatus(workspace?.status),
    refetch: query.refetch,
    workspace,
  };
}
