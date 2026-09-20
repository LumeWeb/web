import type { WebsiteItem, WorkspaceResponse } from "@lumeweb/pinner";
import { describe, expect, it } from "vitest";

import {
  filterSites,
  normalizeSites,
  type SiteRow,
  type SitesFilter,
} from "../sitesModel";

function website(overrides: Partial<WebsiteItem> = {}): WebsiteItem {
  return {
    created: "2024-01-01T00:00:00Z",
    dns_hosting_enabled: true,
    domain: "site-100.example.com",
    expired: false,
    id: 100,
    is_subdomain: false,
    status: "active",
    target_hash: "QmHash100",
    target_type: "ipfs",
    updated: "2024-01-01T00:00:00Z",
    validation_token: "token",
    ...overrides,
  };
}

function workspace(overrides: Partial<WorkspaceResponse> = {}): WorkspaceResponse {
  return {
    created: "2024-01-01T00:00:00Z",
    domain: "workspace-1.example.com",
    id: 1,
    label: "",
    status: "ready",
    updated: "2024-01-01T00:00:00Z",
    website_id: undefined,
    ...overrides,
  };
}

describe("normalizeSites", () => {
  it("produces a Builder row for an unpublished Workspace (no Website)", () => {
    const rows = normalizeSites([workspace({ id: 1 })], []);
    expect(rows).toHaveLength(1);
    expect(rows[0].source).toBe("builder");
    expect(rows[0].state).toBe("notPublished");
    expect(rows[0].key).toBe("workspace-1");
    expect(rows[0].publicUrl).toBeUndefined();
  });

  it("folds a Website attached via website_id into the Workspace row", () => {
    const ws = workspace({ id: 1, website_id: 100 });
    const rows = normalizeSites([ws], [website({ id: 100 })]);
    expect(rows).toHaveLength(1);
    expect(rows[0].source).toBe("builder");
    expect(rows[0].state).toBe("published");
    expect(rows[0].website?.id).toBe(100);
    expect(rows[0].displayName).toBe("site-100.example.com");
    expect(rows[0].publicUrl).toBe("https://site-100.example.com");
  });

  it("marks every Workspace state as a Builder row regardless of status", () => {
    for (const status of [
      "provisioning",
      "ready",
      "failed",
      "suspended",
      "deleting",
    ]) {
      const rows = normalizeSites([workspace({ id: 1, status })], []);
      expect(rows[0].source).toBe("builder");
      expect(rows[0].state).toBe(
        status === "provisioning"
          ? "provisioning"
          : status === "failed"
            ? "failed"
            : status === "suspended"
              ? "suspended"
              : status === "deleting"
                ? "deleting"
                : "notPublished",
      );
    }
  });

  it("shows unattached Websites once as External rows", () => {
    const rows = normalizeSites([], [website({ id: 200 }), website({ id: 201 })]);
    expect(rows).toHaveLength(2);
    expect(rows[0].source).toBe("external");
    expect(rows[0].state).toBe("external");
    expect(rows[0].key).toBe("website-200");
    expect(rows[1].key).toBe("website-201");
  });

  it("does not duplicate a Website that is attached to a Workspace", () => {
    const ws = workspace({ id: 1, website_id: 100 });
    const rows = normalizeSites([ws], [website({ id: 100 }), website({ id: 200 })]);
    // Only the attached website is folded; the standalone one is external.
    expect(rows).toHaveLength(2);
    const builderRow = rows.find((r) => r.key === "workspace-1");
    const externalRow = rows.find((r) => r.key === "website-200");
    expect(builderRow?.source).toBe("builder");
    expect(externalRow?.source).toBe("external");
  });

  it("applies label precedence: bound Website domain wins over label/domain", () => {
    const ws = workspace({
      id: 1,
      label: "My Workspace",
      domain: "build.example.com",
      website_id: 100,
    });
    const rows = normalizeSites([ws], [website({ id: 100, domain: "pub.example.com" })]);
    expect(rows[0].displayName).toBe("pub.example.com");
  });

  it("falls back to Workspace label then build domain", () => {
    expect(normalizeSites([workspace({ id: 1, label: "My Ws", domain: "b.example.com" })], [])[0].displayName).toBe("My Ws");
    expect(normalizeSites([workspace({ id: 1, domain: "b.example.com" })], [])[0].displayName).toBe("b.example.com");
  });
});

describe("filterSites", () => {
  const rows: SiteRow[] = [
    {
      displayName: "a",
      domain: "a.example.com",
      key: "workspace-1",
      source: "builder",
      sourceLabel: "Builder",
      state: "notPublished",
      stateLabel: "Not published",
    },
    {
      displayName: "b",
      domain: "b.example.com",
      key: "website-2",
      publicUrl: "https://b.example.com",
      source: "external",
      sourceLabel: "External",
      state: "external",
      stateLabel: "Published",
    },
  ];

  it("returns all rows for the all filter", () => {
    expect(filterSites(rows, "all")).toHaveLength(2);
  });

  it("returns only builder rows for the builder filter", () => {
    const filtered = filterSites(rows, "builder");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].source).toBe("builder");
  });

  it("returns only external rows for the external filter", () => {
    const filtered = filterSites(rows, "external");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].source).toBe("external");
  });

  it("handles unknown filter conservatively", () => {
    expect(filterSites(rows, "all" as SitesFilter)).toHaveLength(2);
  });
});
