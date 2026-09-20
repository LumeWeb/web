import { useCustom, useDataProvider } from "@refinedev/core";
import type { WorkspaceAccessResponse, WorkspaceResponse } from "@lumeweb/pinner";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Skeleton,
} from "@lumeweb/portal-framework-ui-core";
import { lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { useToast } from "@lumeweb/portal-framework-ui-core";
import { useState } from "react";

const Copy = lazyIcon("Copy");
const Eye = lazyIcon("Eye");
const Lock = lazyIcon("Lock");
const ExternalLink = lazyIcon("ExternalLink");
const RefreshCw = lazyIcon("RefreshCw");

interface LaunchDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  workspace: WorkspaceResponse;
}

/**
 * Local launch dialog built directly from UI-core primitives (not the
 * framework dialog/form configuration systems).
 *
 * On open it fetches the owner's HTTP Basic Auth credentials for the
 * workspace, shows them masked with explicit copy/show controls, and offers an
 * explicit "Open workspace" button. Credentials are never embedded in the URL
 * nor retained in list-row state.
 */
export function LaunchDialog({ onOpenChange, open, workspace }: LaunchDialogProps) {
  const [rotating, setRotating] = useState(false);
  const workspaceUrl = `https://${workspace.domain}`;
  const dataProvider = useDataProvider();

  const { query, result } = useCustom<WorkspaceAccessResponse>({
    dataProviderName: "ipfs",
    method: "get",
    queryOptions: {
      enabled: open,
      retry: false,
    },
    url: `/api/workspaces/${workspace.id}/access`,
  });

  const refetch = query.refetch;
  const isLoading = query.isLoading;
  const isFetching = query.isFetching;
  const isError = query.isError;
  const access = result.data;

  // Per the production API, access rotation is a GET `?rotate=true` on the same
  // access endpoint. We trigger it through the data provider and then refetch
  // the freshly rotated credentials.
  const handleRotate = async () => {
    setRotating(true);
    try {
      await dataProvider("ipfs").custom({
        dataProviderName: "ipfs",
        method: "get",
        url: `/api/workspaces/${workspace.id}/access?rotate=true`,
      });
      await refetch();
    } finally {
      setRotating(false);
    }
  };

  const isLoadingCreds = isLoading || isFetching;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Open workspace</DialogTitle>
          <DialogDescription>
            Your browser will request these HTTP Basic Auth credentials when you
            open the workspace. They are scoped to your account for this
            workspace only.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Workspace URL</Label>
            <Input className="font-mono" readOnly value={workspaceUrl} />
          </div>

          {isLoadingCreds ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : isError || !access ? (
            <p className="text-sm text-destructive">
              We could not retrieve your workspace credentials. Please try again.
            </p>
          ) : (
            <>
              <CopyField label="Username" value={access.username} />
              <MaskedPassword value={access.password} />
            </>
          )}

          <p className="text-xs text-muted-foreground">
            We never embed credentials in the URL. When the browser prompts for
            authentication, enter the username and password shown above.
          </p>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button
            disabled={isLoadingCreds || rotating}
            onClick={handleRotate}
            type="button"
            variant="outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {rotating ? "Rotating…" : "Rotate credentials"}
          </Button>
          <a href={workspaceUrl} rel="noopener noreferrer" target="_blank">
            <Button disabled={isLoadingCreds || isError} type="button">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open workspace
            </Button>
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: `${label} copied to clipboard` });
    } catch {
      toast({
        description: "Your browser blocked access to the clipboard.",
        title: "Could not copy",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-2">
        <Input className="font-mono" readOnly value={value} />
        <Button
          aria-label={`Copy ${label.toLowerCase()}`}
          onClick={handleCopy}
          size="icon"
          type="button"
          variant="outline"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function MaskedPassword({ value }: { value: string }) {
  const { toast } = useToast();
  const [revealed, setRevealed] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: "Password copied to clipboard" });
    } catch {
      toast({
        description: "Your browser blocked access to the clipboard.",
        title: "Could not copy",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">Password</Label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            className="flex-1 font-mono pr-10"
            readOnly
            type={revealed ? "text" : "password"}
            value={value}
          />
          <button
            aria-label={revealed ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setRevealed((r) => !r)}
            type="button"
          >
            {revealed ? <Lock className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <Button
          aria-label="Copy password"
          onClick={handleCopy}
          size="icon"
          type="button"
          variant="outline"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
