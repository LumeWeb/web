import { test as it } from "../../__tests__/int-test";
import { describe, expect, beforeEach } from "vitest";
import {
  WorkspacesClient,
  WorkspaceStatus,
} from "../workspaces";
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
});
