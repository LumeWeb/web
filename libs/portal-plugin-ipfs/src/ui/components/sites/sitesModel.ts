import type { WebsiteItem, WorkspaceResponse } from "@lumeweb/pinner";
import { WorkspaceStatus } from "@lumeweb/pinner";

/**
 * Presentation-only model for the unified Sites list. Source Workspace and
 * Website records are never mutated; normalization is purely a view concern
 * and does not introduce an aggregate backend model.
 */

export type SiteManagementSource = "builder" | "external";

export interface SiteRow {
  displayName: string;
  domain: string;
  key: string;
  publicUrl?: string;
  source: SiteManagementSource;
  sourceLabel: string;
  state: SiteState;
  stateLabel: string;
  website?: WebsiteItem;
  workspace?: WorkspaceResponse;
}

export type SitesFilter = "all" | "builder" | "external";

export type SiteState =
  | "deleting" // Workspace being deleted
  | "external" // stand-alone Website with no Workspace
  | "failed" // Workspace provisioning failed
  | "notPublished" // Workspace, no Website (builder-guided, not published)
  | "provisioning" // Workspace still provisioning
  | "published" // Workspace + attached Website (published)
  | "suspended"; // Workspace suspended

export const SITE_STATE_LABELS: Record<SiteState, string> = {
  deleting: "Deleting",
  external: "Published",
  failed: "Failed",
  notPublished: "Not published",
  provisioning: "Provisioning",
  published: "Published",
  suspended: "Suspended",
};

export const SOURCE_LABELS: Record<SiteManagementSource, string> = {
  builder: "Builder",
  external: "External",
};

export const SITES_FILTERS: SitesFilter[] = ["all", "builder", "external"];

export function filterSites(rows: SiteRow[], filter: SitesFilter): SiteRow[] {
  if (filter === "all") {
    return rows;
  }
  return rows.filter((row) => row.source === filter);
}

/**
 * Normalize raw Workspace + Website records into SiteRows.
 *
 * Workspace rows always appear (including provisioning, failed, suspended and
 * unpublished Workspaces). A Website attached to a Workspace via `website_id`
 * is folded into that Workspace row. Websites not referenced by any Workspace
 * appear once as `External` rows.
 */
export function normalizeSites(
  workspaces: WorkspaceResponse[],
  websites: WebsiteItem[],
): SiteRow[] {
  const websitesById = new Map<number, WebsiteItem>();
  for (const website of websites) {
    websitesById.set(website.id, website);
  }

  const attachedWebsiteIds = new Set<number>();
  const boundWebsiteIds = new Set<number>();
  const rows: SiteRow[] = [];

  for (const workspace of workspaces) {
    const website =
      workspace.website_id != null ? websitesById.get(workspace.website_id) : undefined;

    if (website) {
      attachedWebsiteIds.add(website.id);
      boundWebsiteIds.add(website.id);
    }

    const state: SiteState = website ? "published" : workspaceState(workspace.status);

    rows.push({
      displayName: displayNameFor(website, workspace),
      domain: website?.domain ?? workspace.domain,
      key: `workspace-${workspace.id}`,
      publicUrl: website ? `https://${website.domain}` : undefined,
      source: "builder",
      sourceLabel: SOURCE_LABELS.builder,
      state,
      stateLabel: SITE_STATE_LABELS[state],
      website,
      workspace,
    });
  }

  // Stand-alone Websites (not referenced by any Workspace) become External rows.
  for (const website of websites) {
    if (attachedWebsiteIds.has(website.id) || boundWebsiteIds.has(website.id)) {
      continue;
    }
    rows.push({
      displayName: website.domain,
      domain: website.domain,
      key: `website-${website.id}`,
      publicUrl: `https://${website.domain}`,
      source: "external",
      sourceLabel: SOURCE_LABELS.external,
      state: "external",
      stateLabel: SITE_STATE_LABELS.external,
      website,
    });
  }

  return rows;
}

function displayNameFor(website: undefined | WebsiteItem, workspace: WorkspaceResponse): string {
  // Label precedence: bound Website domain -> Workspace label -> build hostname.
  if (website?.domain) {
    return website.domain;
  }
  if (workspace.label) {
    return workspace.label;
  }
  return workspace.domain;
}

function workspaceState(status: string): SiteState {
  switch (status) {
    case WorkspaceStatus.DELETING:
      return "deleting";
    case WorkspaceStatus.FAILED:
      return "failed";
    case WorkspaceStatus.PROVISIONING:
      return "provisioning";
    case WorkspaceStatus.READY:
      return "notPublished";
    case WorkspaceStatus.SUSPENDED:
      return "suspended";
    default:
      return "provisioning";
  }
}
