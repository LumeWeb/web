import { useNavigate } from "react-router";
import { Authenticated } from "@refinedev/core";
import {
  GeneralLayout,
  PageHeader,
} from "@lumeweb/portal-framework-ui";
import {
  Badge,
  Button,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@lumeweb/portal-framework-ui-core";
import { lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { useState } from "react";

import {
  filterSites,
  type SiteRow,
  SITES_FILTERS,
  type SitesFilter,
} from "../components/sites/sitesModel";
import { useSites } from "../hooks/useSites";

const Plus = lazyIcon("Plus");
const ExternalLink = lazyIcon("ExternalLink");
const Settings = lazyIcon("Settings");

interface SiteStateBadgeProps {
  row: SiteRow;
}

function SiteStateBadge({ row }: SiteStateBadgeProps) {
  const variant: "default" | "destructive" | "outline" | "secondary" =
    row.state === "published" || row.state === "external"
      ? "default"
      : row.state === "failed" || row.state === "suspended"
        ? "destructive"
        : "secondary";

  return <Badge variant={variant}>{row.stateLabel}</Badge>;
}

function SourceBadge({ row }: SiteStateBadgeProps) {
  return (
    <Badge variant="outline">{row.sourceLabel}</Badge>
  );
}

const FILTER_LABELS: Record<SitesFilter, string> = {
  all: "All",
  builder: "Builder",
  external: "External",
};

export default function Sites() {
  const navigate = useNavigate();
  const { error, isError, isLoading, rows } = useSites();
  const [filter, setFilter] = useState<SitesFilter>("all");

  const visibleRows = filterSites(rows, filter);

  const renderAction = (row: SiteRow) => {
    if (row.source === "external") {
      return (
        <a
          className="inline-flex"
          href={row.publicUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Button size="sm" variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open site
          </Button>
        </a>
      );
    }
    if (!row.workspace) {
      return null;
    }
    return (
      <Button
        onClick={() => navigate(`/sites/${row.workspace?.id}`)}
        size="sm"
        variant="outline"
      >
        <Settings className="mr-2 h-4 w-4" />
        Manage site
      </Button>
    );
  };

  return (
    <Authenticated key="ipfs-sites">
      <GeneralLayout>
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <PageHeader
              description="Create and manage Workspace-based sites, and see standalone Websites published outside the portal builder."
              title="Sites"
            />
            <Button onClick={() => navigate("/sites/new")}>
              <Plus className="mr-2 h-4 w-4" />
              New site
            </Button>
          </div>

          <div className="flex items-center gap-1">
            {SITES_FILTERS.map((f) => (
              <Button
                key={f}
                onClick={() => setFilter(f)}
                size="sm"
                variant={filter === f ? "default" : "outline"}
              >
                {FILTER_LABELS[f]}
              </Button>
            ))}
          </div>

          {isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : "Failed to load sites. Please try again."}
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : visibleRows.length === 0 ? (
            <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
              {filter === "all"
                ? "No sites yet. Create your first Workspace to start building."
                : "No sites in this view yet."}
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>View</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleRows.map((row) => (
                    <TableRow key={row.key}>
                      <TableCell>
                        <div className="font-medium">{row.displayName}</div>
                        {row.domain && row.domain !== row.displayName && (
                          <div className="text-xs text-muted-foreground">
                            {row.domain}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <SiteStateBadge row={row} />
                      </TableCell>
                      <TableCell>
                        <SourceBadge row={row} />
                      </TableCell>
                      <TableCell>
                        {row.publicUrl ? (
                          <a
                            className="text-sm text-primary underline-offset-4 hover:underline"
                            href={row.publicUrl}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            Visit
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {renderAction(row)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </GeneralLayout>
    </Authenticated>
  );
}
