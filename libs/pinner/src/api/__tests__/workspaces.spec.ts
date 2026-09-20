import { test as it } from "../../__tests__/int-test";
import { describe, expect, beforeEach, vi } from "vitest";
import {
  WorkspacesClient,
  WorkspaceStatus,
} from "../workspaces";
import type { WorkspaceResponse } from "../generated/schemas/index";
import type { PinnerConfig } from "@/config";
import {
  AuthenticationError,
  NotFoundError,
} from "@/errors";
import {
  WorkspaceStore,
  createWorkspaceHandlers,
  resetWorkspaceState,
  createUnauthorizedHandler,
  createNotFoundHandler,
} from "@/__tests__/msw";
import { testConfig } from "@/__tests__/setup";
import { JwtAuthManager } from "@/auth";

const workspaceStore = new WorkspaceStore();

await workspaceStore.initializeDefaults();

const workspaceHandlers = createWorkspaceHandlers(workspaceStore);

const workspaceNotFoundHandler = createNotFoundHandler(`${testConfig.apiUrl}/workspaces/:id`);
const workspaceUnauthorizedHandler = createUnauthorizedHandler(`${testConfig.apiUrl}/workspaces*`);

describe("WorkspacesClient", () => {
  const mockConfig: PinnerConfig = {
    jwt: "test-jwt-token",
    endpoint: "https://test.pinner.xyz",
  };

  const mockAuth = new JwtAuthManager(mockConfig.jwt!);

  beforeEach(() => {
    // Reset mock data state before each test to ensure isolation
    resetWorkspaceState(workspaceStore);
  });

  describe("list", () => {
    it("should list all workspaces in the paginated shape", async ({ worker }) => {
      worker.use(...workspaceHandlers);
      const client = new WorkspacesClient(mockConfig, mockAuth);

      const workspaces = await client.listWorkspaces();

      expect(workspaces.data).toHaveLength(2);
      expect(workspaces.total).toBe(2);
      expect(workspaces.data[0]).toHaveProperty("id");
      expect(workspaces.data[0]).toHaveProperty("domain");
      expect(workspaces.data[0]).toHaveProperty("status");
      expect(workspaces.data[0]).toHaveProperty("label");
      expect(workspaces.data[0]).toHaveProperty("created");
      expect(workspaces.data[0]).toHaveProperty("updated");
    });

    it("should handle authentication errors", async ({ worker }) => {
      worker.use(workspaceUnauthorizedHandler);
      const client = new WorkspacesClient(
        { jwt: "invalid-jwt", endpoint: "https://test.pinner.xyz" },
        new JwtAuthManager("invalid-jwt"),
      );
      await expect(client.listWorkspaces()).rejects.toThrow(AuthenticationError);
    });
  });

  describe("create", () => {
    it("should create an unattached workspace", async ({ worker }) => {
      worker.use(...workspaceHandlers);
      const client = new WorkspacesClient(mockConfig, mockAuth);

      const created = await client.createWorkspace({});

      expect(created.id).toBe(3);
      expect(created.status).toBe(WorkspaceStatus.PROVISIONING);
    });

    it("should create a workspace attached to a website", async ({ worker }) => {
      worker.use(...workspaceHandlers);
      const client = new WorkspacesClient(mockConfig, mockAuth);

      const created = await client.createWorkspace({ website_id: 42 });

      expect(created.website_id).toBe(42);
    });
  });

  describe("get", () => {
    it("should get workspace details", async ({ worker }) => {
      worker.use(...workspaceHandlers);
      const client = new WorkspacesClient(mockConfig, mockAuth);

      const workspace = await client.getWorkspace(1);

      expect(workspace.id).toBe(1);
      expect(workspace.domain).toBe("workspace-1.pinner.xyz");
    });

    it("should throw NotFoundError for non-existent workspace", async ({ worker }) => {
      worker.use(workspaceNotFoundHandler);
      const client = new WorkspacesClient(mockConfig, mockAuth);

      await expect(client.getWorkspace(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe("delete", () => {
    it("should soft-delete a workspace", async ({ worker }) => {
      worker.use(...workspaceHandlers);
      const client = new WorkspacesClient(mockConfig, mockAuth);

      const deleted = await client.deleteWorkspace(1);

      expect(deleted.id).toBe(1);
      expect(deleted.status).toBe(WorkspaceStatus.DELETING);
    });

    it("should throw NotFoundError for missing workspace", async ({ worker }) => {
      worker.use(workspaceNotFoundHandler);
      const client = new WorkspacesClient(mockConfig, mockAuth);

      await expect(client.deleteWorkspace(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe("suspend/resume", () => {
    it("should suspend a ready workspace", async ({ worker }) => {
      worker.use(...workspaceHandlers);
      const client = new WorkspacesClient(mockConfig, mockAuth);

      const suspended = await client.suspendWorkspace(1);

      expect(suspended.status).toBe(WorkspaceStatus.SUSPENDED);
    });

    it("should resume a suspended workspace", async ({ worker }) => {
      worker.use(...workspaceHandlers);
      const client = new WorkspacesClient(mockConfig, mockAuth);

      await client.suspendWorkspace(1);
      const resumed = await client.resumeWorkspace(1);

      expect(resumed.status).toBe(WorkspaceStatus.READY);
    });
  });

  describe("attach", () => {
    it("should attach a website to an unattached workspace", async ({ worker }) => {
      worker.use(...workspaceHandlers);
      const client = new WorkspacesClient(mockConfig, mockAuth);

      const attached = await client.attachWorkspace(1, { website_id: 7 });

      expect(attached.website_id).toBe(7);
    });
  });

  describe("getAccess", () => {
    it("should return username/password credentials", async ({ worker }) => {
      worker.use(...workspaceHandlers);
      const client = new WorkspacesClient(mockConfig, mockAuth);

      const access = await client.getAccess(1);

      expect(access).toHaveProperty("username");
      expect(access).toHaveProperty("password");
    });

    it("should rotate credentials when rotate=true", async ({ worker }) => {
      worker.use(...workspaceHandlers);
      const client = new WorkspacesClient(mockConfig, mockAuth);

      const before = await client.getAccess(1);
      const rotated = await client.getAccess(1, { rotate: true });

      expect(rotated.username).toBe(before.username);
      expect(rotated.password).not.toBe(before.password);
    });
  });

  describe("watch", () => {
    const setWorkspaceStatus = (id: number, status: string): void => {
      const current = workspaceStore.get(id);
      if (!current) {
        throw new Error(`Workspace ${id} not found in store`);
      }
      workspaceStore.set(id, { ...current, status });
    };

    it("should emit ready and stop only when the workspace is ready", async ({ worker }) => {
      worker.use(...workspaceHandlers);
      const client = new WorkspacesClient(mockConfig, mockAuth);

      // Workspace 1 is READY by default in the store.
      const getSpy = vi.spyOn(client, "getWorkspace");
      const statuses: WorkspaceResponse[] = [];
      const ready = vi.fn();
      const error = vi.fn();

      await client.watchWorkspace(1, { interval: 10, timeout: 100 }).start({
        onStatus: (status) => statuses.push(status),
        onReady: ready,
        onError: error,
      });

      expect(statuses[statuses.length - 1]?.status).toBe(WorkspaceStatus.READY);
      expect(ready).toHaveBeenCalledTimes(1);
      expect(ready).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, status: WorkspaceStatus.READY }),
      );
      expect(error).not.toHaveBeenCalled();
      // Reaching a terminal state stops polling after the first check.
      expect(getSpy).toHaveBeenCalledTimes(1);
    });

    it("should not emit ready when provisioning fails (FAILED terminal state)", async ({ worker }) => {
      worker.use(...workspaceHandlers);
      const client = new WorkspacesClient(mockConfig, mockAuth);

      // Workspace 2 starts as PROVISIONING; simulate failed provisioning.
      setWorkspaceStatus(2, WorkspaceStatus.FAILED);

      const getSpy = vi.spyOn(client, "getWorkspace");
      const statuses: WorkspaceResponse[] = [];
      const ready = vi.fn();
      const error = vi.fn();

      await client.watchWorkspace(2, { interval: 10, timeout: 100 }).start({
        onStatus: (status) => statuses.push(status),
        onReady: ready,
        onError: error,
      });

      expect(statuses[statuses.length - 1]?.status).toBe(WorkspaceStatus.FAILED);
      expect(ready).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
      // The failed terminal state stops polling without waiting for more checks.
      expect(getSpy).toHaveBeenCalledTimes(1);
    });

    it("should stop without ready or error for suspended and deleting terminal states", async ({ worker }) => {
      worker.use(...workspaceHandlers);
      const client = new WorkspacesClient(mockConfig, mockAuth);

      for (const status of [
        WorkspaceStatus.SUSPENDED,
        WorkspaceStatus.DELETING,
      ]) {
        setWorkspaceStatus(1, status);

        const statuses: WorkspaceResponse[] = [];
        const ready = vi.fn();
        const error = vi.fn();

        await client.watchWorkspace(1, { interval: 10, timeout: 100 }).start({
          onStatus: (value) => statuses.push(value),
          onReady: ready,
          onError: error,
        });

        expect(statuses[statuses.length - 1]?.status).toBe(status);
        expect(ready, `${status} should not emit ready`).not.toHaveBeenCalled();
        expect(error, `${status} should not emit error`).not.toHaveBeenCalled();
      }
    });

    it("should stop without ready when a provisioning workspace transitions to failed", async ({ worker }) => {
      worker.use(...workspaceHandlers);
      const client = new WorkspacesClient(mockConfig, mockAuth);

      // Workspace 2 starts PROVISIONING (non-terminal), so polling continues.
      const statuses: WorkspaceResponse[] = [];
      const ready = vi.fn();
      const error = vi.fn();

      const watcher = client.watchWorkspace(2, { interval: 20, timeout: 1000 });
      try {
        await watcher.start({
          onStatus: (status) => statuses.push(status),
          onReady: ready,
          onError: error,
        });

        expect(statuses[0]?.status).toBe(WorkspaceStatus.PROVISIONING);

        // Provisioning fails before the next poll observes it.
        setWorkspaceStatus(2, WorkspaceStatus.FAILED);
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(statuses[statuses.length - 1]?.status).toBe(WorkspaceStatus.FAILED);
        expect(ready).not.toHaveBeenCalled();
        expect(error).not.toHaveBeenCalled();
      } finally {
        watcher.stop();
      }
    });
  });
});
