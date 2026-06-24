import { Namespace, NamespacedId } from "../types/namespace";

export type { Namespace, NamespacedId };

const NAMESPACE_REGEX = /^[a-z0-9][a-z0-9-]{0,63}$/;
const NAME_REGEX = /^[a-z0-9][a-z0-9-]{0,127}$/;

export const CORE_NS: Namespace = "core" as Namespace;
export const FRAMEWORK_NS: Namespace = "framework" as Namespace;

export function createNamespacedId(
  namespace: string,
  name: string,
): NamespacedId {
  if (!NAMESPACE_REGEX.test(namespace)) {
    throw new Error(`Invalid namespace: "${namespace}"`);
  }
  if (!NAME_REGEX.test(name)) {
    throw new Error(`Invalid name: "${name}"`);
  }
  return `${namespace}:${name}` as NamespacedId;
}

export function createNamespace(ns: string): Namespace {
  if (!NAMESPACE_REGEX.test(ns)) {
    throw new Error(`Invalid namespace: "${ns}"`);
  }
  return ns as Namespace;
}

export function isNamespacedId(id: string): id is NamespacedId {
  const idx = id.indexOf(":");
  if (idx === -1 || idx === 0 || idx === id.length - 1) return false;
  const ns = id.slice(0, idx);
  const name = id.slice(idx + 1);
  // Reject nested colons: name must not contain ":"
  if (name.includes(":")) return false;
  return NAMESPACE_REGEX.test(ns) && NAME_REGEX.test(name);
}

export function normalizeId(
  pluginId: NamespacedId,
  id: string,
): NamespacedId {
  // If already valid, pass through
  if (isNamespacedId(id)) {
    return id;
  }
  // If it has a colon but isn't valid, throw — no silent pass-through
  if (id.includes(":")) {
    throw new Error(`Invalid namespaced ID: "${id}"`);
  }
  // Bare name — prepend plugin's namespace
  const ns = parseNamespacedId(pluginId).namespace;
  return createNamespacedId(ns, id);
}

export function parseNamespacedId(id: NamespacedId): {
  namespace: Namespace;
  name: string;
} {
  const idx = id.indexOf(":");
  return {
    namespace: id.slice(0, idx) as Namespace,
    name: id.slice(idx + 1),
  };
}

export function validateNamespacedId(id: string): asserts id is NamespacedId {
  if (!isNamespacedId(id)) {
    throw new Error(`Invalid namespaced identifier: "${id}"`);
  }
}
