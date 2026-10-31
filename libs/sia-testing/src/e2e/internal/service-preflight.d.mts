/** Read-only readiness and explicit process identity checks under the caller's lease. */
export function preflight(env: NodeJS.ProcessEnv): Promise<number>;
