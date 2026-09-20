import { describe, expect, it } from "vitest";

import { isTerminalStatus } from "../useWorkspaceProvisioning";
import { WorkspaceStatus } from "@lumeweb/pinner";

describe("isTerminalStatus", () => {
  it("is terminal for ready, failed, suspended and deleting", () => {
    expect(isTerminalStatus(WorkspaceStatus.READY)).toBe(true);
    expect(isTerminalStatus(WorkspaceStatus.FAILED)).toBe(true);
    expect(isTerminalStatus(WorkspaceStatus.SUSPENDED)).toBe(true);
    expect(isTerminalStatus(WorkspaceStatus.DELETING)).toBe(true);
  });

  it("is not terminal while provisioning", () => {
    expect(isTerminalStatus(WorkspaceStatus.PROVISIONING)).toBe(false);
  });

  it("is not terminal for unknown or missing status", () => {
    expect(isTerminalStatus(undefined)).toBe(false);
    expect(isTerminalStatus("")).toBe(false);
    expect(isTerminalStatus("bogus")).toBe(false);
  });
});
