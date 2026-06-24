import type { NamespacedId } from "../types/plugin";
import { parseNamespacedId } from "../util/namespace";

const RESERVED_NAMESPACES = new Set(["core", "framework"]);

export class NamespaceRegistry {
  readonly #namespaces = new Map<string, NamespacedId>();

  claim(namespace: string, pluginId: NamespacedId): void {
    if (RESERVED_NAMESPACES.has(namespace) && !pluginId.startsWith("core:")) {
      throw new Error(`Namespace "${namespace}" is reserved by the framework`);
    }
    const existing = this.#namespaces.get(namespace);
    if (existing && existing !== pluginId) {
      throw new Error(
        `Namespace "${namespace}" is already claimed by "${existing}"`,
      );
    }
    this.#namespaces.set(namespace, pluginId);
  }

  release(pluginId: NamespacedId): void {
    for (const [ns, id] of this.#namespaces) {
      if (id === pluginId) {
        this.#namespaces.delete(ns);
      }
    }
  }

  has(namespace: string): boolean {
    return RESERVED_NAMESPACES.has(namespace) || this.#namespaces.has(namespace);
  }

  getPluginId(namespace: string): NamespacedId | undefined {
    return this.#namespaces.get(namespace);
  }

  resolve(id: NamespacedId): {
    name: string;
    namespace: string;
    pluginId?: NamespacedId;
  } {
    const parsed = parseNamespacedId(id);
    const pluginId = this.#namespaces.get(parsed.namespace);
    return { ...parsed, pluginId };
  }
}
