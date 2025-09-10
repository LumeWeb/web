import type { BaseCapability } from "../types/capabilities";

import { Framework } from "../api/framework";
import { DependencyGraph } from "../util/dependencyGraph";
import {
  validateCapability,
  validateCapabilityDetailed,
} from "../util/validation";

export class CapabilityManager {
  set framework(framework: Framework) {
    this._framework = framework;
  }

  get framework(): Framework {
    if (!this._framework) {
      throw new Error("Framework not set");
    }
    return this._framework;
  }

  #capabilities = new Map<string, BaseCapability>(); // Key by capability ID

  #capabilityToPlugin = new Map<string, string>(); // capabilityId -> pluginId
  #deferredPromises = new Map<
    string,
    {
      promise: Promise<void>;
      reject: (reason?: any) => void;
      resolve: () => void;
    }
  >();
  #initialized = new Set<string>(); // Track initialized capability IDs
  #typeIndex = new Map<string, string[]>(); // Type -> Array of capability IDs
  #typeRegistrationOrder: string[] = []; // Track type registration order
  private _framework: Framework | null = null;

  get #framework() {
    if (!this._framework) {
      throw new Error("Framework not set");
    }
    return this._framework;
  }

  // Destroy all capabilities
  async destroyAll() {
    const failures = new Map<string, Error>();
    const dependencyGraph = new Map<string, string[]>();
    const allCapabilities = Array.from(this.#capabilities.values());

    // Build dependency graph same as initialization
    for (const cap of allCapabilities) {
      dependencyGraph.set(cap.id, [...(cap.dependencies || [])]);
    }

    // Get reverse sorted capabilities
    const sortedCapabilities =
      this.#resolveDependencyOrder(dependencyGraph).reverse();

    // Process capabilities in reverse initialization order
    for (const cap of sortedCapabilities) {
      try {
        if (!this.#initialized.has(cap.id)) continue;

        await cap.destroy(this.#framework);
        this.#initialized.delete(cap.id);
      } catch (error) {
        failures.set(
          cap.id,
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    }

    return failures;
  }

  // Get a capability with initialization guarantee
  async get<T extends BaseCapability>(id: string): Promise<T | undefined> {
    const capability = this.#capabilities.get(id);
    if (!capability) return undefined;

    // If already initialized, return immediately
    if (this.#initialized.has(id)) {
      return capability as T;
    }

    const deferred = this.#deferredPromises.get(id);
    if (!deferred) return undefined;

    await deferred.promise;
    return this.#capabilities.get(id) as T;
  }

  // Get all capabilities of a type with initialization guarantees
  async getAllOfType<T extends BaseCapability>(type: string): Promise<T[]> {
    const ids = this.#typeIndex.get(type) || [];
    const caps = await Promise.all(ids.map((id) => this.get<T>(id)));
    const filteredCaps = caps.filter(Boolean) as T[];

    // Get plugin dependency order
    const pluginOrder = this.#framework
      .getPluginManager()
      .getInitializationOrder();
    const pluginOrderMap = new Map<string, number>(
      pluginOrder.map((id, index) => [id, index]),
    );

    // Create map of capability ID to original registration index
    const originalIndices = new Map(
      filteredCaps.map((cap, idx) => [cap.id, idx]),
    );

    // Sort by plugin dependency order while preserving registration order within plugins
    return filteredCaps.sort((a, b) => {
      const aPlugin = this.#capabilityToPlugin.get(a.id) || "";
      const bPlugin = this.#capabilityToPlugin.get(b.id) || "";
      const aIndex = pluginOrderMap.get(aPlugin) ?? pluginOrder.length;
      const bIndex = pluginOrderMap.get(bPlugin) ?? pluginOrder.length;

      // First sort by plugin initialization order
      const diff = aIndex - bIndex;
      if (diff !== 0) {
        return diff;
      }

      // For capabilities from the same plugin, preserve original registration order
      return (
        (originalIndices.get(a.id) ?? 0) - (originalIndices.get(b.id) ?? 0)
      );
    });
  }

  // Initialize all capabilities
  async initializeAll() {
    const failures = new Map<string, Error>();
    const dependencyGraph = new Map<string, string[]>();
    const allCapabilities = Array.from(this.#capabilities.values());

    // Build dependency graph
    for (const cap of allCapabilities) {
      dependencyGraph.set(cap.id, [...(cap.dependencies || [])]);
    }

    // Get topologically sorted capabilities
    const sortedCapabilities = this.#resolveDependencyOrder(dependencyGraph);

    // Create deferred promises for all capabilities before initialization
    for (const cap of sortedCapabilities) {
      if (!this.#deferredPromises.has(cap.id)) {
        let resolveFn: () => void = () => {};
        let rejectFn: (reason?: any) => void = () => {};

        const promise = new Promise<void>((resolve, reject) => {
          resolveFn = resolve;
          rejectFn = reject;
        });

        this.#deferredPromises.set(cap.id, {
          promise,
          reject: rejectFn,
          resolve: resolveFn,
        });
      }
    }

    // Process capabilities in dependency-aware order
    for (const cap of sortedCapabilities) {
      // Skip if already initialized
      if (this.#initialized.has(cap.id)) {
        console.warn(`Capability ${cap.id} already initialized`);
        continue;
      }

      // Defensive check for capability interface compliance
      if (!validateCapability(cap)) {
        const validationResult = validateCapabilityDetailed(cap);
        const errorMessage =
          validationResult.missingProperties.length > 0
            ? `Capability ${cap.id} validation failed: ${validationResult.missingProperties.join(", ")}`
            : `Capability ${cap.id} validation failed: unknown validation issues`;
        const err = new Error(errorMessage);
        this.#deferredPromises.get(cap.id)?.reject(err);
        failures.set(cap.id, err);
        continue;
      }

      try {
        await cap.initialize(this.#framework);
        this.#initialized.add(cap.id);
        this.#deferredPromises.get(cap.id)!.resolve();
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.#deferredPromises.get(cap.id)!.reject(err);
        failures.set(cap.id, err);
        // Don't throw here - collect all failures before returning
      }
    }

    return failures;
  }

  // Register a new capability
  register<T extends BaseCapability>(capability: T, pluginId: string) {
    if (this.#capabilities.has(capability.id)) {
      console.warn(
        `Capability ${capability.id} already registered by plugin ${this.#capabilityToPlugin.get(capability.id)}. Plugin ${pluginId} attempted to re-register it.`,
      );
      return;
    }

    this.#capabilityToPlugin.set(capability.id, pluginId);

    this.#capabilities.set(capability.id, capability);

    // Update type index and registration order
    if (!this.#typeIndex.has(capability.type)) {
      this.#typeIndex.set(capability.type, []);
      this.#typeRegistrationOrder.push(capability.type);
    }
    this.#typeIndex.get(capability.type)!.push(capability.id);
  }

  #resolveDependencyOrder(
    dependencyGraph: Map<string, string[]>,
  ): BaseCapability[] {
    const graph = new DependencyGraph<string>();

    // First add explicit dependencies
    for (const [id, deps] of dependencyGraph) {
      graph.addNode(id);
      for (const depId of deps) {
        graph.addDependency(id, depId);
      }
    }

    // Add implicit type-based ordering for capabilities without dependencies
    for (const type of this.#typeRegistrationOrder) {
      const typeCapIds = this.#typeIndex.get(type) || [];

      // Create dependency chain within type based on registration order
      for (let i = 1; i < typeCapIds.length; i++) {
        const prevId = typeCapIds[i - 1];
        const currId = typeCapIds[i];

        // Only create implicit dependency if:
        // - Neither capability has explicit dependencies
        // - They haven't already been ordered by explicit deps
        if (
          !graph.getDependencies(currId).size &&
          !graph.getDependencies(prevId).size &&
          !graph.getDependents(prevId).has(currId)
        ) {
          graph.addDependency(currId, prevId);
        }
      }
    }

    // Get sorted capability IDs
    const sortedIds = graph.topologicalSort();

    // Convert IDs to capabilities while preserving order
    return sortedIds
      .map((id) => this.#capabilities.get(id))
      .filter((cap): cap is BaseCapability => !!cap);
  }
}
