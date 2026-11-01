/** Read-only readiness and process identity checks; the caller must retain the cluster lease. */
/** Returns available storage bytes after verifying the explicit process, topology and readiness. */
export function preflight(env: NodeJS.ProcessEnv): Promise<number>;
