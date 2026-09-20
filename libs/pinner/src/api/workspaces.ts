import { createNanoEvents } from "nanoevents";
import type { PinnerConfig } from "../config";
import type { AuthManager } from "@/auth";
import { ApiClient } from "./client";
import type {
  WorkspaceAccessResponse,
  WorkspaceListResponseResponse,
  WorkspaceRequest,
  WorkspaceResponse,
} from "./generated/schemas/index";

// Workspace lifecycle status constants
export const WorkspaceStatus = {
  PROVISIONING: "provisioning",
  READY: "ready",
  FAILED: "failed",
  SUSPENDED: "suspended",
  DELETING: "deleting",
} as const;

export type WorkspaceStatusValue = (typeof WorkspaceStatus)[keyof typeof WorkspaceStatus];

export interface WorkspacesClientOptions {
  signal?: AbortSignal;
}

/**
 * Client for managing Workspaces — the runtime-agnostic authoring/pagebuilder
 * environments that Portal provisions with a managed HTTPS build URL and HTTP
 * Basic Auth access. A Workspace may optionally be attached to a Website
 * (via `website_id`) once it has published a static bundle.
 */
export class WorkspacesClient extends ApiClient {
  /**
   * Create a new WorkspacesClient.
   * @param config SDK configuration
   * @param auth AuthManager for authentication
   */
  constructor(config: PinnerConfig, auth: AuthManager) {
    super(auth, config.endpoint ?? "https://ipfs.pinner.xyz");
  }

  /**
   * List the authenticated user's workspaces (including unattached ones) in
   * the standard paginated `{data, total}` shape.
   * @param options Request options
   */
  async listWorkspaces(
    options?: WorkspacesClientOptions & { signal?: AbortSignal },
  ): Promise<WorkspaceListResponseResponse> {
    return this.request<WorkspaceListResponseResponse>("api/workspaces", {
      signal: options?.signal,
    });
  }

  /**
   * Create a Workspace. Omit `website_id` to create an unattached Workspace
   * (the builder-guided onboarding shape).
   * @param request Workspace creation parameters
   * @param options Request options
   */
  async createWorkspace(
    request: WorkspaceRequest,
    options?: WorkspacesClientOptions & { signal?: AbortSignal },
  ): Promise<WorkspaceResponse> {
    return this.request<WorkspaceResponse>("api/workspaces", {
      method: "POST",
      body: JSON.stringify(request),
      signal: options?.signal,
    });
  }

  /**
   * Get a workspace by ID.
   * @param id Workspace ID
   * @param options Request options
   */
  async getWorkspace(
    id: number | string,
    options?: WorkspacesClientOptions & { signal?: AbortSignal },
  ): Promise<WorkspaceResponse> {
    return this.request<WorkspaceResponse>(`api/workspaces/${id}`, {
      signal: options?.signal,
    });
  }

  /**
   * Delete (soft-delete) a workspace by ID.
   * @param id Workspace ID
   * @param options Request options
   */
  async deleteWorkspace(
    id: number | string,
    options?: WorkspacesClientOptions & { signal?: AbortSignal },
  ): Promise<WorkspaceResponse> {
    return this.request<WorkspaceResponse>(`api/workspaces/${id}`, {
      method: "DELETE",
      signal: options?.signal,
    });
  }

  /**
   * Suspend a ready workspace.
   * @param id Workspace ID
   * @param options Request options
   */
  async suspendWorkspace(
    id: number | string,
    options?: WorkspacesClientOptions & { signal?: AbortSignal },
  ): Promise<WorkspaceResponse> {
    return this.request<WorkspaceResponse>(`api/workspaces/${id}/suspend`, {
      method: "POST",
      signal: options?.signal,
    });
  }

  /**
   * Resume a suspended workspace.
   * @param id Workspace ID
   * @param options Request options
   */
  async resumeWorkspace(
    id: number | string,
    options?: WorkspacesClientOptions & { signal?: AbortSignal },
  ): Promise<WorkspaceResponse> {
    return this.request<WorkspaceResponse>(`api/workspaces/${id}/resume`, {
      method: "POST",
      signal: options?.signal,
    });
  }

  /**
   * Attach an unattached workspace to a website the user owns.
   * @param id Workspace ID
   * @param request Workspace request containing the `website_id` to attach
   * @param options Request options
   */
  async attachWorkspace(
    id: number | string,
    request: WorkspaceRequest,
    options?: WorkspacesClientOptions & { signal?: AbortSignal },
  ): Promise<WorkspaceResponse> {
    return this.request<WorkspaceResponse>(`api/workspaces/${id}/attach`, {
      method: "POST",
      body: JSON.stringify(request),
      signal: options?.signal,
    });
  }

  /**
   * Get the owner's proxy HTTP Basic Auth credentials for a workspace.
   * Pass `rotate: true` to rotate them first.
   * @param id Workspace ID
   * @param options Request options and optional rotate flag
   */
  async getAccess(
    id: number | string,
    options?: WorkspacesClientOptions & { rotate?: boolean },
  ): Promise<WorkspaceAccessResponse> {
    const rotate = options?.rotate;
    const query =
      rotate != null ? `?rotate=${encodeURIComponent(String(rotate))}` : "";
    return this.request<WorkspaceAccessResponse>(
      `api/workspaces/${id}/access${query}`,
      {
        signal: options?.signal,
      },
    );
  }

  /**
   * Watch a workspace's lifecycle status until it reaches a terminal state
   * (`ready`, `failed`, `suspended`, or `deleting`), errors, or times out.
   * Used to drive the provisioning/polling UX.
   *
   * The `ready` event is emitted (and polling stops) only when the workspace
   * reaches `ready`; other terminal states (`failed`, `suspended`,
   * `deleting`, ...) stop polling without emitting `ready` or `error`.
   * @param id Workspace ID
   * @param options Watch interval, timeout, and terminal states to stop on
   */
  watchWorkspace(
    id: number | string,
    options?: WorkspaceWatchOptions,
  ): WorkspaceWatcher {
    return new WorkspaceWatcherImpl(this, id, options);
  }
}

export interface WorkspaceWatchOptions {
  interval?: number;
  timeout?: number;
  terminalStates?: readonly string[];
}

export interface WorkspaceEvents {
  status: (status: WorkspaceResponse) => void;
  ready: (status: WorkspaceResponse) => void;
  error: (error: WorkspaceWatchError) => void;
}

export interface WorkspaceCallbacks {
  onStatus?: (status: WorkspaceResponse) => void;
  onReady?: (status: WorkspaceResponse) => void;
  onError?: (error: WorkspaceWatchError) => void;
}

export interface WorkspaceWatcher {
  start(callbacks: WorkspaceCallbacks): Promise<void>;
  stop(): void;
}

export interface WorkspaceWatchError extends Error {
  type: "timeout" | "error";
}

const DEFAULT_INTERVAL = 3000;
const DEFAULT_TIMEOUT = 300000;

const TERMINAL_STATES: readonly string[] = [
  WorkspaceStatus.READY,
  WorkspaceStatus.FAILED,
  WorkspaceStatus.SUSPENDED,
  WorkspaceStatus.DELETING,
];

interface ResolvedWatchOptions {
  interval: number;
  timeout: number;
  terminalStates: readonly string[];
}

class WorkspaceWatcherImpl implements WorkspaceWatcher {
  private emitter = createNanoEvents<WorkspaceEvents>();
  private unbind: (() => void)[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private stopped = false;
  private options: ResolvedWatchOptions;
  private runId = 0;

  constructor(
    private client: WorkspacesClient,
    private id: number | string,
    options: WorkspaceWatchOptions = {},
  ) {
    let interval = options.interval ?? DEFAULT_INTERVAL;
    let timeout = options.timeout ?? DEFAULT_TIMEOUT;

    if (interval <= 0) {
      interval = DEFAULT_INTERVAL;
    }
    if (timeout <= 0) {
      timeout = DEFAULT_TIMEOUT;
    }

    this.options = {
      interval,
      timeout,
      terminalStates: options.terminalStates ?? TERMINAL_STATES,
    };
  }

  private emitError(message: string, type: WorkspaceWatchError["type"]): void {
    const error = new Error(message) as WorkspaceWatchError;
    error.type = type;
    this.emitter.emit("error", error);
    this.stop();
  }

  async start(callbacks: WorkspaceCallbacks = {}): Promise<void> {
    this.stop();
    this.stopped = false;
    const currentRunId = ++this.runId;

    if (callbacks.onStatus) {
      this.unbind.push(this.emitter.on("status", callbacks.onStatus));
    }
    if (callbacks.onReady) {
      this.unbind.push(this.emitter.on("ready", callbacks.onReady));
    }
    if (callbacks.onError) {
      this.unbind.push(this.emitter.on("error", callbacks.onError));
    }

    const checkStatus = async (): Promise<void> => {
      if (this.stopped || this.runId !== currentRunId) {
        return;
      }

      try {
        const workspace = await this.client.getWorkspace(this.id);
        if (this.stopped || this.runId !== currentRunId) {
          return;
        }
        this.emitter.emit("status", workspace);

        if (this.options.terminalStates.includes(workspace.status)) {
          // `ready` is emitted (and polling stops) only when the workspace
          // actually reaches `ready`. Other terminal states (failed,
          // suspended, deleting, ...) stop polling without emitting `ready`
          // or `error` — the `error` event is reserved for transport
          // failures and timeouts (see WorkspaceWatchError).
          if (workspace.status === WorkspaceStatus.READY) {
            this.emitter.emit("ready", workspace);
          }
          this.stop();
        }
      } catch (err) {
        if (this.stopped || this.runId !== currentRunId) {
          return;
        }
        this.emitError(
          err instanceof Error ? err.message : "Failed to check workspace status",
          "error",
        );
      }
    };

    await checkStatus();

    if (this.stopped || this.runId !== currentRunId) {
      return;
    }

    this.intervalId = setInterval(checkStatus, this.options.interval);

    this.timeoutId = setTimeout(() => {
      if (!this.stopped && this.runId === currentRunId) {
        this.emitError("Workspace provisioning timeout", "timeout");
      }
    }, this.options.timeout);
  }

  stop(): void {
    this.stopped = true;

    this.unbind.forEach((unbind) => unbind());
    this.unbind = [];

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
