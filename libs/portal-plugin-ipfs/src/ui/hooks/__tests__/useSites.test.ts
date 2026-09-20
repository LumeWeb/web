import { describe, expect, it } from "vitest";

import {
  SITES_MAX_PAGE_SIZE,
  SITES_PAGE_SIZE,
  sitesPagination,
} from "../useSites";

describe("useSites pagination", () => {
  it("keeps the Sites page size within the backend maximum of 100", () => {
    // The portal backend rejects `pageSize` above its max with HTTP 400
    // "error parsing pagination: pageSize: cannot exceed 100".
    expect(SITES_MAX_PAGE_SIZE).toBe(100);
    expect(SITES_PAGE_SIZE).toBeGreaterThan(0);
    expect(SITES_PAGE_SIZE).toBeLessThanOrEqual(SITES_MAX_PAGE_SIZE);
  });

  it("builds server-side pagination on the same page size", () => {
    const pagination = sitesPagination();
    expect(pagination.mode).toBe("server");
    expect(pagination.pageSize).toBe(SITES_PAGE_SIZE);
    expect(pagination.pageSize).toBeLessThanOrEqual(100);
  });

  it("uses the bundled page size for every unified Sites query", () => {
    // All `ipfs/workspaces` and `ipfs/websites` list queries in the unified
    // Sites UI must go through the same capped pagination so they never trip
    // the backend `pageSize > 100` validation.
    const pagination = sitesPagination();
    expect(pagination).toEqual({ mode: "server", pageSize: 100 });
  });
});
