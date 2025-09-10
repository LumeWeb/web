import type { EnvironmentSyncCallback } from "../types/form";
import type { UnifiedEnvironment } from "../types/environment";

/**
 * Create an environment receiver for the receiving side
 *
 * This helper function creates a simple receiver that can be used
 * to store and retrieve environment references provided by the framework.
 * It returns an object with the callback to pass to the framework
 * and a function to get the current environment.
 *
 * @returns An object with:
 *   - environmentSyncCallback: The callback to pass to the framework config
 *   - environmentSync: Function to get the current stored environment
 */
export function createEnvironmentReceiver() {
  let currentEnvironment: UnifiedEnvironment | null = null;

  const environmentSyncCallback: EnvironmentSyncCallback = (environment) => {
    // Store the environment directly
    currentEnvironment = environment;
  };

  const environmentSync = () => {
    return currentEnvironment;
  };

  return {
    environmentSync,
    environmentSyncCallback,
  };
}
