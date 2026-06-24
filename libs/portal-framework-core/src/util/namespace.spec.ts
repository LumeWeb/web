import { describe, expect, it } from "vitest";

import {
  createNamespacedId,
  createNamespace,
  isNamespacedId,
  normalizeId,
  parseNamespacedId,
  validateNamespacedId,
  type Namespace,
  type NamespacedId,
} from "./namespace";

// Produce branded types in tests by going through the validation functions
const core = "core";
const ipfs = "ipfs";
const framework = "framework";

describe("namespace utils", () => {
  describe("createNamespace", () => {
    it("should create a valid namespace", () => {
      expect(createNamespace("core")).toBe("core");
      expect(createNamespace("ipfs")).toBe("ipfs");
    });

    it("should throw on invalid namespace", () => {
      expect(() => createNamespace("Core")).toThrow(); // uppercase
      expect(() => createNamespace("")).toThrow(); // empty
      expect(() => createNamespace("has:colon")).toThrow();
      expect(() => createNamespace("has space")).toThrow();
    });
  });

  describe("createNamespacedId", () => {
    it("should create valid namespaced ID", () => {
      expect(createNamespacedId(core, "plugin")).toBe("core:plugin");
      expect(createNamespacedId(ipfs, "file-manager")).toBe("ipfs:file-manager");
    });

    it("should throw on invalid namespace", () => {
      expect(() => createNamespacedId("core", "Plugin")).toThrow();
      expect(() => createNamespacedId("core", "")).toThrow();
      expect(() => createNamespacedId("core", "has:colon")).toThrow();
    });
  });

  describe("isNamespacedId", () => {
    it("should validate namespaced IDs", () => {
      expect(isNamespacedId("core:plugin")).toBe(true);
      expect(isNamespacedId("ipfs:file-manager")).toBe(true);
    });

    it("should reject bare strings", () => {
      expect(isNamespacedId("invalid")).toBe(false);
      expect(isNamespacedId("")).toBe(false);
    });

    it("should reject multi-colon strings", () => {
      expect(isNamespacedId("too:many:colons")).toBe(false);
      expect(isNamespacedId("a:b:c")).toBe(false);
    });

    it("should reject empty segments", () => {
      expect(isNamespacedId(":plugin")).toBe(false);
      expect(isNamespacedId("core:")).toBe(false);
      expect(isNamespacedId("core::plugin")).toBe(false);
    });

    it("should reject uppercase", () => {
      expect(isNamespacedId("Core:plugin")).toBe(false);
      expect(isNamespacedId("core:Plugin")).toBe(false);
    });

    it("should narrow to NamespacedId", () => {
      const id = "core:plugin";
      if (isNamespacedId(id)) {
        const _typed: NamespacedId = id;
        expect(_typed).toBe("core:plugin");
      }
    });
  });

  describe("normalizeId", () => {
    const base: NamespacedId = createNamespacedId(core, "base");
    const ipfsBase: NamespacedId = createNamespacedId(ipfs, "base");

    it("should namespace bare IDs", () => {
      expect(normalizeId(base, "plugin")).toBe("core:plugin");
      expect(normalizeId(ipfsBase, "file-manager")).toBe("ipfs:file-manager");
    });

    it("should preserve valid namespaced IDs", () => {
      expect(normalizeId(base, "other:plugin")).toBe("other:plugin");
      expect(normalizeId(base, "ipfs:file-manager")).toBe("ipfs:file-manager");
    });

    it("should throw on invalid multi-colon strings", () => {
      expect(() => normalizeId(base, "a:b:c")).toThrow();
      expect(() => normalizeId(base, "too:many:colons")).toThrow();
    });

    it("should throw on empty segments", () => {
      expect(() => normalizeId(base, ":plugin")).toThrow();
      expect(() => normalizeId(base, "core:")).toThrow();
      expect(() => normalizeId(base, "")).toThrow();
    });

    it("should throw on uppercase segments with colon", () => {
      expect(() => normalizeId(base, "Core:plugin")).toThrow();
    });
  });

  describe("parseNamespacedId", () => {
    it("should split valid IDs", () => {
      const id = createNamespacedId(core, "plugin");
      expect(parseNamespacedId(id)).toEqual({
        name: "plugin",
        namespace: "core",
      });
    });

    it("should handle names with hyphens", () => {
      const id = createNamespacedId(framework, "refine-config");
      expect(parseNamespacedId(id)).toEqual({
        name: "refine-config",
        namespace: "framework",
      });
    });
  });

  describe("validateNamespacedId", () => {
    it("should throw on invalid format", () => {
      expect(() => validateNamespacedId("invalid")).toThrow();
      expect(() => validateNamespacedId("")).toThrow();
    });

    it("should throw on multi-colon", () => {
      expect(() => validateNamespacedId("a:b:c")).toThrow();
      expect(() => validateNamespacedId("too:many:colons")).toThrow();
    });

    it("should throw on empty segments", () => {
      expect(() => validateNamespacedId(":plugin")).toThrow();
      expect(() => validateNamespacedId("core:")).toThrow();
    });

    it("should throw on uppercase", () => {
      expect(() => validateNamespacedId("Core:plugin")).toThrow();
    });

    it("should not throw on valid IDs", () => {
      expect(() => validateNamespacedId("core:plugin")).not.toThrow();
      expect(() => validateNamespacedId("framework:refine-config")).not.toThrow();
      expect(() => validateNamespacedId("ipfs:file-manager")).not.toThrow();
    });
  });
});
