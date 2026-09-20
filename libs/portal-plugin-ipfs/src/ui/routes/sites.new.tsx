import { useSearchParams } from "react-router";
import { useNavigate } from "react-router";
import { Authenticated, useCustomMutation } from "@refinedev/core";
import type { WorkspaceResponse } from "@lumeweb/pinner";
import {
  GeneralLayout,
  PageHeader,
} from "@lumeweb/portal-framework-ui";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  IndeterminateProgress,
  Skeleton,
} from "@lumeweb/portal-framework-ui-core";
import { lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { useState } from "react";

import { useWorkspaceProvisioning } from "../hooks/useWorkspaceProvisioning";

const Plus = lazyIcon("Plus");
const Zap = lazyIcon("Zap");
const Settings = lazyIcon("Settings");

export default function NewSite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawId = searchParams.get("id");
  const workspaceId = rawId ? Number(rawId) : undefined;

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<unknown>(null);

  const { mutateAsync: createWorkspace } =
    useCustomMutation<WorkspaceResponse>();

  const { error, isError, isFailed, isLoading, isReady, workspace } =
    useWorkspaceProvisioning(workspaceId);

  const handleCreate = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      const result = await createWorkspace({
        dataProviderName: "ipfs",
        method: "post",
        url: "/api/workspaces",
        values: {},
      });
      const createdId = result?.data?.id;
      if (createdId != null) {
        navigate(`/sites/new?id=${createdId}`, { replace: true });
      } else {
        navigate("/sites", { replace: true });
      }
    } catch (err) {
      setCreateError(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Authenticated key="ipfs-sites-new">
      <GeneralLayout>
        <div className="mx-auto max-w-2xl space-y-6">
          <PageHeader
            description="Provision a new Workspace — a managed authoring environment for your site. Publishing happens inside the Workspace."
            title="New Site"
          />

          {workspaceId == null ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Create a Workspace
                </CardTitle>
                <CardDescription>
                  We&apos;ll provision a Workspace with a managed HTTPS build URL and
                  HTTP Basic Auth access. You&apos;ll be guided to finish setup inside
                  it.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {createError ? (
                  <Alert variant="destructive">
                    <AlertTitle>Could not create Workspace</AlertTitle>
                    <AlertDescription>
                      {createError instanceof Error
                        ? createError.message
                        : "Something went wrong while provisioning your Workspace. Please try again."}
                    </AlertDescription>
                  </Alert>
                ) : null}
                <Button
                  disabled={creating}
                  onClick={handleCreate}
                  variant={createError ? "outline" : "default"}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {creating ? "Provisioning…" : createError ? "Try again" : "Create Workspace"}
                </Button>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <Card>
              <CardContent className="space-y-4">
                <IndeterminateProgress />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </CardContent>
            </Card>
          ) : workspace ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {workspace.label || workspace.domain}
                </CardTitle>
                <CardDescription>
                  Workspace is currently: <strong>{workspace.status}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isFailed ? (
                  <Alert variant="destructive">
                    <AlertTitle>Provisioning failed</AlertTitle>
                    <AlertDescription>
                      {workspace.error ||
                        "Your Workspace could not be provisioned. Please try again."}
                    </AlertDescription>
                  </Alert>
                ) : isReady ? (
                  <Alert>
                    <AlertTitle>Workspace is ready</AlertTitle>
                    <AlertDescription>
                      Open your Workspace to build and publish your site.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <IndeterminateProgress />
                )}

                {isReady && (
                  <Button onClick={() => navigate(`/sites/${workspace.id}`)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Manage site
                  </Button>
                )}
                {isFailed && (
                  <Button onClick={() => navigate("/sites")} variant="outline">
                    Back to Sites
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : isError ? (
            <Card>
              <CardContent>
                <Alert variant="destructive">
                  <AlertTitle>Unable to load Workspace</AlertTitle>
                  <AlertDescription>
                    {error instanceof Error
                      ? error.message
                      : "Something went wrong while checking provisioning status."}
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
          ) : null}
        </div>
      </GeneralLayout>
    </Authenticated>
  );
}
