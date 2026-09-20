import { http, HttpResponse } from "msw";
import { testConfig } from "../setup";
import { WorkspaceStatus } from "@/api/workspaces";
import { WorkspaceStore } from "./workspace-store";
import type { Workspace } from "./workspace-store";

const CORS_HEADERS = { "Access-Control-Allow-Origin": "*" };

export function createWorkspaceHandlers(workspaceStore: WorkspaceStore) {
  const listWorkspacesHandler = http.get(
    `${testConfig.apiUrl}/workspaces`,
    async ({ request }) => {
      const url = new URL(request.url);
      const start = Number(url.searchParams.get("_start") ?? "0");
      const endParam = url.searchParams.get("_end");
      const end = endParam == null ? undefined : Number(endParam);

      const all = workspaceStore.list();
      const total = all.length;
      const data = end == null ? all : all.slice(start, end);

      return HttpResponse.json(
        { data, total },
        { status: 200, headers: CORS_HEADERS },
      );
    },
  );

  const createWorkspaceHandler = http.post(
    `${testConfig.apiUrl}/workspaces`,
    async ({ request }) => {
      const body = (await request.json().catch(() => ({}))) as {
        website_id?: number;
      };

      const id = workspaceStore.getNextWorkspaceId();
      const newWorkspace: Workspace = {
        id,
        domain: `workspace-${id}.pinner.xyz`,
        status: WorkspaceStatus.PROVISIONING,
        website_id: body.website_id,
        created: new Date(),
        updated: new Date(),
      };

      workspaceStore.set(id, newWorkspace);
      workspaceStore.setAccess(id, {
        username: `user-${id}`,
        password: `pass-${id}`,
      });

      return HttpResponse.json(newWorkspace, {
        status: 201,
        headers: CORS_HEADERS,
      });
    },
  );

  const getWorkspaceHandler = http.get(
    `${testConfig.apiUrl}/workspaces/:id`,
    async ({ params }) => {
      const id = parseInt(params.id as string);
      const workspace = workspaceStore.findById(id);

      if (!workspace) {
        return HttpResponse.json(
          { error: { reason: "Workspace not found" } },
          { status: 404 },
        );
      }

      return HttpResponse.json(workspace, {
        status: 200,
        headers: CORS_HEADERS,
      });
    },
  );

  const deleteWorkspaceHandler = http.delete(
    `${testConfig.apiUrl}/workspaces/:id`,
    async ({ params }) => {
      const id = parseInt(params.id as string);
      const workspace = workspaceStore.findById(id);

      if (!workspace) {
        return HttpResponse.json(
          { error: { reason: "Workspace not found" } },
          { status: 404 },
        );
      }

      const deleted = { ...workspace, status: WorkspaceStatus.DELETING };
      workspaceStore.set(id, deleted);

      return HttpResponse.json(deleted, {
        status: 200,
        headers: CORS_HEADERS,
      });
    },
  );

  const suspendWorkspaceHandler = http.post(
    `${testConfig.apiUrl}/workspaces/:id/suspend`,
    async ({ params }) => {
      const id = parseInt(params.id as string);
      const workspace = workspaceStore.findById(id);

      if (!workspace) {
        return HttpResponse.json(
          { error: { reason: "Workspace not found" } },
          { status: 404 },
        );
      }

      workspace.status = WorkspaceStatus.SUSPENDED;
      workspace.updated = new Date();

      return HttpResponse.json(workspace, {
        status: 200,
        headers: CORS_HEADERS,
      });
    },
  );

  const resumeWorkspaceHandler = http.post(
    `${testConfig.apiUrl}/workspaces/:id/resume`,
    async ({ params }) => {
      const id = parseInt(params.id as string);
      const workspace = workspaceStore.findById(id);

      if (!workspace) {
        return HttpResponse.json(
          { error: { reason: "Workspace not found" } },
          { status: 404 },
        );
      }

      workspace.status = WorkspaceStatus.READY;
      workspace.updated = new Date();

      return HttpResponse.json(workspace, {
        status: 200,
        headers: CORS_HEADERS,
      });
    },
  );

  const attachWorkspaceHandler = http.post(
    `${testConfig.apiUrl}/workspaces/:id/attach`,
    async ({ params, request }) => {
      const id = parseInt(params.id as string);
      const workspace = workspaceStore.findById(id);

      if (!workspace) {
        return HttpResponse.json(
          { error: { reason: "Workspace not found" } },
          { status: 404 },
        );
      }

      const body = (await request.json().catch(() => ({}))) as {
        website_id?: number;
      };
      if (body.website_id !== undefined) {
        workspace.website_id = body.website_id;
      }
      workspace.updated = new Date();

      return HttpResponse.json(workspace, {
        status: 200,
        headers: CORS_HEADERS,
      });
    },
  );

  const getAccessHandler = http.get(
    `${testConfig.apiUrl}/workspaces/:id/access`,
    async ({ request, params }) => {
      const id = parseInt(params.id as string);
      const url = new URL(request.url);
      const rotate = url.searchParams.get("rotate") === "true";

      let access = workspaceStore.getAccess(id);
      if (rotate) {
        access = workspaceStore.rotateAccess(id) ?? access;
      }
      if (!access) {
        return HttpResponse.json(
          { error: { reason: "Workspace access not found" } },
          { status: 404 },
        );
      }

      return HttpResponse.json(access, {
        status: 200,
        headers: CORS_HEADERS,
      });
    },
  );

  return [
    listWorkspacesHandler,
    createWorkspaceHandler,
    getWorkspaceHandler,
    deleteWorkspaceHandler,
    suspendWorkspaceHandler,
    resumeWorkspaceHandler,
    attachWorkspaceHandler,
    getAccessHandler,
  ];
}

export async function resetWorkspaceState(workspaceStore: WorkspaceStore): Promise<void> {
  workspaceStore.reset();
  await workspaceStore.initializeDefaults();
}
