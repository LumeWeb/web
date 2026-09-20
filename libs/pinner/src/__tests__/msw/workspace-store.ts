import { MapStore } from "./store";
import { WorkspaceStatus } from "@/api/workspaces";

// ============================================================================
// TYPES
// ============================================================================

export interface Workspace {
  id: number;
  domain: string;
  status: string;
  label?: string;
  error?: string;
  website_id?: number;
  created: Date;
  updated: Date;
}

export interface WorkspaceAccess {
  username: string;
  password: string;
}

// ============================================================================
// DEFAULT DATA
// ============================================================================

const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: 1,
    domain: "workspace-1.pinner.xyz",
    status: WorkspaceStatus.READY,
    label: "My first Workspace",
    created: new Date("2024-01-01T00:00:00Z"),
    updated: new Date("2024-01-01T00:00:00Z"),
  },
  {
    id: 2,
    domain: "workspace-2.pinner.xyz",
    status: WorkspaceStatus.PROVISIONING,
    created: new Date("2024-01-02T00:00:00Z"),
    updated: new Date("2024-01-02T00:00:00Z"),
  },
];

// ============================================================================
// WORKSPACE STORE
// ============================================================================

export class WorkspaceStore extends MapStore<number, Workspace> {
  private workspaceIdCounter = 3;
  private access = new Map<number, WorkspaceAccess>();

  constructor() {
    super();
  }

  getNextWorkspaceId(): number {
    return this.workspaceIdCounter++;
  }

  findById(id: number): Workspace | undefined {
    return this.get(id);
  }

  deleteById(id: number): boolean {
    return this.delete(id);
  }

  getAccess(id: number): WorkspaceAccess | undefined {
    return this.access.get(id);
  }

  setAccess(id: number, access: WorkspaceAccess): void {
    this.access.set(id, access);
  }

  rotateAccess(id: number): WorkspaceAccess | undefined {
    const current = this.access.get(id);
    if (!current) {
      return undefined;
    }
    const rotated: WorkspaceAccess = {
      username: current.username,
      password: `rotated-${Math.random().toString(36).slice(2, 12)}`,
    };
    this.access.set(id, rotated);
    return rotated;
  }

  override reset(): void {
    super.reset();
    this.workspaceIdCounter = 3;
    this.access.clear();
  }

  async initializeDefaults(): Promise<void> {
    this.clear();
    this.workspaceIdCounter = 3;
    this.access.clear();
    for (const workspace of DEFAULT_WORKSPACES) {
      this.set(workspace.id, { ...workspace });
      this.setAccess(workspace.id, {
        username: `user-${workspace.id}`,
        password: `pass-${workspace.id}`,
      });
    }
  }
}
