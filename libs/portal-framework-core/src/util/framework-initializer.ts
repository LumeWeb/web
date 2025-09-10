import { init, registerRemotes } from "@module-federation/enhanced/runtime";

import { Builder } from "../api/builder";
import { Framework } from "../api/framework";
import { env } from "../env";
import { CategoryError, InitializationResult, ERROR_CATEGORIES } from "../types/api";
import { getPortalPluginManifests } from "./pluginManifest";

// Track initialization state
const initializationState = new Map<
  string,
  {
    builder: Builder;
    framework: Framework;
  }
>();

interface InitializeFrameworkOptions {
  appName: string;
  configure: (builder: Builder) => Builder;
  existingBuilder?: Builder;
}

export async function initializeFramework(
  options: InitializeFrameworkOptions,
): Promise<InitializationResult> {
  const { appName, configure, existingBuilder } = options;
  const errors: CategoryError[] = [];

  // Check if we have an existing builder/framework instance tracked by this utility
  let builder = existingBuilder || initializationState.get(appName)?.builder;
  let framework: Framework | undefined; // Allow framework to be undefined initially

  try {
    if (!builder) {
      // Create builder first to ensure it's always initialized
      builder = new Builder(options.appName);

      // Initialize module federation runtime
      init({ name: appName, remotes: [] });

      // Get plugin manifests
      const manifestsMap = await getPortalPluginManifests(
        appName,
        env.VITE_PORTAL_DOMAIN,
      );

      // Register remote modules first
      await Promise.all(
        manifestsMap.map(async (manifestUrl, index) => {
          try {
            // Generate ID first before any registration
            const moduleId = `remote-${index}`;
            // Register with MF first
            await registerRemotes([{ entry: manifestUrl, name: moduleId }]);
            // Then load and register with plugin system
            await builder!.registerRemoteModule(manifestUrl, moduleId);
          } catch (err) {
            errors.push({
              category: ERROR_CATEGORIES.PLUGIN,
              error: err instanceof Error ? err : new Error(String(err)),
              id: `plugin-load-${index}`,
            });
          }
        }),
      );

      // Configure builder
      builder = configure(builder);
    }

    // Get framework instance from builder
    framework = await builder.framework;

    // Only initialize if the framework instance itself is not already initialized
    // Initialize initResult with the full expected type, assuming success initially
    let initResult: { failures?: CategoryError[]; success: boolean } = {
      success: true,
    };
    // Use the public getter instead of accessing the private field
    if (!framework.isInitialized()) {
      initResult = await framework.initialize();
      if (initResult.failures) {
        errors.push(...initResult.failures);
      }
    } else {
      // This warning is now redundant with the check in Framework.initialize,
      // but keeping it here for clarity on why initialize() isn't called.
      console.warn(
        `Framework instance for ${appName} already initialized - skipping initialize() call`,
      );
    }

    const result = {
      builder,
      framework,
      ...(errors.length > 0 ? { errors } : {}),
      success: errors.length === 0 && initResult.success,
    };

    // Store successful initialization state
    // Use the public getter instead of accessing the private field
    if (result.framework.isInitialized()) {
      initializationState.set(appName, {
        builder: result.builder,
        framework: result.framework,
      });
    } else {
      // If initialization failed, remove from state to allow retry
      initializationState.delete(appName);
    }

    return result;
  } catch (err) {
    // Handle unexpected system-level errors
    // Ensure builder is defined before returning
    if (!builder) {
      // If builder creation failed, we can't return a builder
      throw err; // Re-throw if builder is null
    }
    return {
      builder: builder,
      errors: [
        {
          category: ERROR_CATEGORIES.SYSTEM,
          error: err instanceof Error ? err : new Error(String(err)),
          id: "system-initialization",
        },
      ],
      framework: framework!, // framework might be undefined if error happened before builder.framework
      success: false,
    };
  }
}

// Helper to check if we need to reinitialize
export function shouldInitialize(
  builder?: Builder | null,
  framework?: Framework | null,
): boolean {
  // We need to initialize if we don't have a framework instance,
  // or if the existing framework instance is not initialized (using the public getter).
  return !framework?.isInitialized();
}
