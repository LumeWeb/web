import {
  DataTable,
  formatFileSize,
  GeneralLayout,
  PageHeader,
  useDialog,
} from "@lumeweb/portal-framework-ui";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Skeleton,
} from "@lumeweb/portal-framework-ui-core";
import { Authenticated, useDelete } from "@refinedev/core";
import { createColumnHelper } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { lazyIcon } from "@lumeweb/portal-framework-ui-core";
const HardDrive = lazyIcon("HardDrive");
const Trash2 = lazyIcon("Trash2");
const Unplug = lazyIcon("Unplug");
import { useEffect, useState } from "react";

import { useQuota } from "@lumeweb/portal-plugin-quota";
import { disconnectAppDialogConfig } from "@/ui/dialogs/disconnectAppDialog";
import { pruneDialogConfig } from "@/ui/dialogs/pruneDialog";
import { usePruneSia } from "@/hooks";
import type { AppResponse } from "@/types";

const columnHelper = createColumnHelper<AppResponse>();

interface AppLogoProps {
  logoURL?: string;
  name: string;
}

function AppLogo({ logoURL, name }: AppLogoProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [logoURL]);

  if (!logoURL || imgError) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
        <HardDrive className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      alt={name}
      className="h-8 w-8 rounded"
      onError={() => setImgError(true)}
      src={logoURL}
    />
  );
}

function getBarColor(percentage: number): string {
  if (percentage > 90) return "bg-destructive";
  if (percentage >= 70) return "bg-yellow-500";
  return "bg-foreground";
}

const columns = [
  columnHelper.accessor("name", {
    cell: (info) => (
      <div className="flex items-center gap-3">
        <AppLogo logoURL={info.row.original.logoURL} name={info.getValue()} />
        <div>
          <span className="font-medium">{info.getValue()}</span>
          {info.row.original.description && (
            <p className="text-xs text-muted-foreground">
              {info.row.original.description}
            </p>
          )}
        </div>
      </div>
    ),
    header: "App",
  }),
  columnHelper.accessor("pinnedData", {
    cell: (info) => (
      <span className="font-mono text-sm">
        {formatFileSize(info.getValue())}
      </span>
    ),
    header: "Storage Used",
  }),
  columnHelper.accessor("lastUsed", {
    cell: (info) => {
      const date = new Date(info.getValue());
      if (isNaN(date.getTime())) return <span className="text-sm text-muted-foreground">Never</span>;
      return (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(date, { addSuffix: true })}
        </span>
      );
    },
    header: "Last Used",
  }),
];

function StorageBar() {
  const { data, isReady, isBusy, hasError } = useQuota();

  if (isBusy) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Storage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (hasError || !isReady || !data) {
    return null;
  }

  const storage = data.storage;
  const isUnlimited = storage.limit === undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Total Used</span>
          {isUnlimited ? (
            <span className="text-muted-foreground">Unlimited</span>
          ) : (
            <span className="text-muted-foreground">
              {storage.percentage.toFixed(1)}%
            </span>
          )}
        </div>
        {isUnlimited ? (
          <div className="text-xs text-muted-foreground">
            {formatFileSize(storage.used)} used
          </div>
        ) : (
          <>
            <Progress
              className="h-2"
              indicatorClassName={getBarColor(storage.percentage)}
              max={storage.limit ?? 0}
              value={storage.used}
            />
            <div className="text-xs text-muted-foreground">
              {formatFileSize(storage.used)} / {formatFileSize(storage.limit ?? 0)}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function Apps() {
  const { openDialog } = useDialog();
  const { mutateAsync: deleteApp } = useDelete();
  const { mutate: prune, isLoading: isPruning } = usePruneSia();

  const handleDisconnect = (app: AppResponse) => {
    openDialog(
      disconnectAppDialogConfig(app.name, async () => {
        try {
          await deleteApp({
            id: app.publicKey,
            resource: "sia/apps",
            successNotification: () => ({
              description: `The app "${app.name}" has been disconnected.`,
              message: "App Disconnected",
              type: "success",
            }),
          });
        } catch {
          // Refine mutation error notifications are handled by the data provider
        }
      }),
    );
  };

  const handlePrune = () => {
    openDialog(
      pruneDialogConfig(() => {
        prune();
      }),
    );
  };

  return (
    <Authenticated key="sia-apps">
      <GeneralLayout>
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <PageHeader
              description="Manage apps connected to your private storage and view your storage usage."
              title="My Apps"
            />
            <Button
              variant="outline"
              onClick={handlePrune}
              disabled={isPruning}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isPruning ? "Cleaning up..." : "Clean Up Storage"}
            </Button>
          </div>

          <StorageBar />

          <DataTable
            actionMenu={{
              items: [
                {
                  icon: <Unplug className="mr-2 h-4 w-4" />,
                  label: "Disconnect",
                  onClick: (row) => {
                    handleDisconnect(row);
                  },
                },
              ],
            }}
            columns={columns}
            emptyStateMessage="No apps are connected to your private storage yet. Apps will appear here when they request access to your storage."
            pagination={true}
            resource="sia/apps"
            responsive={true}
          />
        </div>
      </GeneralLayout>
    </Authenticated>
  );
}
