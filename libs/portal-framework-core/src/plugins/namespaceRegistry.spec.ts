import { beforeEach, describe, expect, it } from "vitest";

import { NamespaceRegistry } from "./namespaceRegistry";

describe("NamespaceRegistry", () => {
  let registry: NamespaceRegistry;

  beforeEach(() => {
    registry = new NamespaceRegistry();
  });

  describe("claim", () => {
    it("allows a plugin to claim an unreserved namespace", () => {
      registry.claim("acme", "acme:plugin" as any);
      expect(registry.has("acme")).toBe(true);
      expect(registry.getPluginId("acme")).toBe("acme:plugin");
    });

    it("rejects reserved namespaces for non-core plugins", () => {
      expect(() => registry.claim("core", "acme:plugin" as any)).toThrow(
        'Namespace "core" is reserved by the framework',
      );
      expect(() => registry.claim("framework", "acme:plugin" as any)).toThrow(
        'Namespace "framework" is reserved by the framework',
      );
    });

    it("allows core plugins to claim reserved namespaces", () => {
      expect(() => registry.claim("core", "core:dashboard" as any)).not.toThrow();
      expect(registry.has("core")).toBe(true);
    });

    it("is idempotent when the same plugin reclaims a namespace", () => {
      registry.claim("acme", "acme:plugin" as any);
      expect(() => registry.claim("acme", "acme:plugin" as any)).not.toThrow();
      expect(registry.getPluginId("acme")).toBe("acme:plugin");
    });

    it("throws when a different plugin claims an already claimed namespace", () => {
      registry.claim("acme", "acme:plugin" as any);
      expect(() => registry.claim("acme", "other:plugin" as any)).toThrow(
        'Namespace "acme" is already claimed by "acme:plugin"',
      );
    });
  });

  describe("release", () => {
    it("removes all namespaces claimed by a plugin", () => {
      registry.claim("acme", "acme:plugin" as any);
      registry.release("acme:plugin" as any);
      expect(registry.has("acme")).toBe(false);
      expect(registry.getPluginId("acme")).toBeUndefined();
    });
  });

  describe("has", () => {
    it("returns true for reserved namespaces", () => {
      expect(registry.has("core")).toBe(true);
      expect(registry.has("framework")).toBe(true);
    });

    it("returns true for claimed namespaces and false otherwise", () => {
      registry.claim("acme", "acme:plugin" as any);
      expect(registry.has("acme")).toBe(true);
      expect(registry.has("unclaimed")).toBe(false);
    });
  });

  describe("resolve", () => {
    it("returns namespace, name, and owning pluginId", () => {
      registry.claim("acme", "acme:plugin" as any);
      expect(registry.resolve("acme:widget" as any)).toEqual({
        name: "widget",
        namespace: "acme",
        pluginId: "acme:plugin",
      });
    });

    it("returns undefined pluginId for unclaimed namespaces", () => {
      expect(registry.resolve("orphan:thing" as any)).toEqual({
        name: "thing",
        namespace: "orphan",
        pluginId: undefined,
      });
    });
  });
});
