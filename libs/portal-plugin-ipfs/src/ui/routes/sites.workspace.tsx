import { useNavigate, useParams } from "react-router";
import { Authenticated, useCustom, useCustomMutation, useList } from "@refinedev/core";
import type { WebsiteItem, WorkspaceResponse } from "@lumeweb/pinner";
import { WorkspaceStatus } from "@lumeweb/pinner";
import {
  GeneralLayout,
  PageHeader,
} from "@lumeweb/portal-framework-ui";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@lumeweb/portal-framework-ui-core";
import { lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { useState } from "react";

import { sitesPagination } from "../hooks/useSites";
import { LaunchDialog } from "../components/sites/LaunchDialog";

const ExternalLink = lazyIcon("ExternalLink");
const Unplug = lazyIcon("Unplug");
const Zap = lazyIcon("Zap");
const Trash2 = lazyIcon("Trash2");
const Monitor = lazyIcon("Monitor");

export default function WorkspaceDetail() {
  const navigate = useNavigate();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionError, setActionError] = useState<unknown>(null);

  const { query, result } = useCustom<WorkspaceResponse>({
    dataProviderName: "ipfs",
    method: "get",
    queryOptions: { retry: false },
    url: `/api/workspaces/${workspaceId}`,
  });
  const workspace = result.data;
  const isLoading = query.isLoading;
  const isError = query.isError;
  const error = query.error;
  const refetch = query.refetch;

  const websiteList = useList<WebsiteItem>({
    dataProviderName: "ipfs",
    pagination: sitesPagination(),
    queryOptions: {
      enabled: workspace?.website_id != null,
      select: (list) => ({
        ...list,
        data: (list.data ?? []).filter(
          (w) => w.id === (workspace?.website_id as number | undefined),
        ),
      }),
    },
    resource: "ipfs/websites",
  });
  const boundWebsite = websiteList.result?.data?.[0];

  const runActionMutation = useCustomMutation();
  const deleteWorkspaceMutation = useCustomMutation();
  const runAction = runActionMutation.mutateAsync;
  const isActing = runActionMutation.mutation.isPending;
  const deleteWorkspace = deleteWorkspaceMutation.mutateAsync;
  const isDeleting = deleteWorkspaceMutation.mutation.isPending;

  const handleSuspendResume = async () => {
    setActionError(null);
    const isSuspended = workspace?.status === WorkspaceStatus.SUSPENDED;
    try {
      await runAction({
        dataProviderName: "ipfs",
        method: "post",
        url: `/api/workspaces/${workspaceId}/${isSuspended ? "resume" : "suspend"}`,
        values: {},
      });
      await refetch();
    } catch (err) {
      setActionError(err);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Delete this Workspace? This cannot be undone. Your published Website (if any) will remain viewable.",
      )
    ) {
      return;
    }
    setActionError(null);
    try {
      await deleteWorkspace({
        dataProviderName: "ipfs",
        method: "delete",
        url: `/api/workspaces/${workspaceId}`,
        values: {},
      });
      navigate("/sites", { replace: true });
    } catch (err) {
      setActionError(err);
    }
  };

  const canManage = workspace?.status === WorkspaceStatus.READY;

  return (
    <Authenticated key={`ipfs-sites-detail-${workspaceId}`}>
      <GeneralLayout>
        <div className="mx-auto max-w-3xl space-y-6">
          <PageHeader
            description="Manage your Workspace lifecycle and access. Publishing and domain management happen inside the Workspace."
            title={workspace?.label || workspace?.domain || "Workspace"}
          />

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : isError || !workspace ? (
            <Card>
              <CardContent>
                <Alert variant="destructive">
                  <AlertTitle>Unable to load Workspace</AlertTitle>
                  <AlertDescription>
                    {error instanceof Error
                      ? error.message
                      : "Something went wrong. It may have been deleted."}
                  </AlertDescription>
                </Alert>
                <Button
                  className="mt-4"
                  onClick={() => navigate("/sites")}
                  variant="outline"
                >
                  Back to Sites
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Workspace
                    <Badge variant={statusBadgeVariant(workspace.status)}>
                      {workspace.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Portal-owned Workspace lifecycle and access management.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-sm font-medium">Build URL</span>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded border bg-muted px-2 py-1 text-sm">
                        https://{workspace.domain}
                      </code>
                      <a
                        href={`https://${workspace.domain}`}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Button disabled={!canManage} size="sm" variant="outline">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open
                        </Button>
                      </a>
                    </div>
                  </div>

                  {actionError ? (
                    <Alert variant="destructive">
                      <AlertTitle>Action failed</AlertTitle>
                      <AlertDescription>
                        {actionError instanceof Error
                          ? actionError.message
                          : "The action could not be completed."}
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    {canManage && (
                      <Button onClick={() => setDialogOpen(true)}>
                        <Monitor className="mr-2 h-4 w-4" />
                        Manage site
                      </Button>
                    )}
                    <Button
                      disabled={isActing || workspace.status === WorkspaceStatus.DELETING}
                      onClick={handleSuspendResume}
                      variant="outline"
                    >
                      {workspace.status === WorkspaceStatus.SUSPENDED ? (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Unplug className="mr-2 h-4 w-4" />
                          Suspend
                        </>
                      )}
                    </Button>
                    <Button
                      disabled={isDeleting}
                      onClick={handleDelete}
                      variant="destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>

                  {!canManage && workspace.status !== WorkspaceStatus.DELETING && (
                    <p className="text-sm text-muted-foreground">
                      This Workspace is not ready yet. Wait for provisioning to
                      finish before managing it.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bound Website</CardTitle>
                  <CardDescription>
                    {boundWebsite
                      ? "The published Website attached to this Workspace."
                      : "No Website is published yet. Publish from inside the Workspace to attach one."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {boundWebsite ? (
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="font-medium">Domain:</span>{" "}
                        {boundWebsite.domain}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{" "}
                        {boundWebsite.status}
                      </div>
                      <div>
                        <span className="font-medium">Current CID:</span>{" "}
                        <code className="rounded bg-muted px-1">
                          {boundWebsite.target_hash}
                        </code>
                      </div>
                      <a
                        className="mt-2 inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
                        href={`https://${boundWebsite.domain}`}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Visit site
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Publish a static bundle from inside the Workspace; your
                      Website will appear here automatically. You cannot create
                      or edit Websites from the portal.
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {workspace && (
            <LaunchDialog
              onOpenChange={setDialogOpen}
              open={dialogOpen}
              workspace={workspace}
            />
          )}
        </div>
      </GeneralLayout>
    </Authenticated>
  );
}

function statusBadgeVariant(status: string | undefined):
  | "default"
  | "destructive"
  | "outline"
  | "secondary" {
  if (status === WorkspaceStatus.READY) return "default";
  if (status === WorkspaceStatus.FAILED || status === WorkspaceStatus.SUSPENDED) {
    return "destructive";
  }
  return "secondary";
}
