import type { EnvironmentSyncCallback } from "../types/form";
import type { UnifiedEnvironment } from "../types/environment";

/**
 * Hook to provide environment sync functionality
 * 
 * This hook is a simple mechanism to call the callback with the environment
 * when it's provided. It doesn't manage any state internally.
 * 
 * @param currentEnvironment - The current environment to sync
 * @param environmentSyncCallback - Optional callback that receives the environment directly
 */
export function useEnvironmentSync(
  currentEnvironment: UnifiedEnvironment | null,
  environmentSyncCallback?: EnvironmentSyncCallback
) {
  // Call the callback with the current environment if provided
  if (environmentSyncCallback && currentEnvironment) {
    environmentSyncCallback(currentEnvironment);
  }
}
