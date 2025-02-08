import { describe, expect, it } from "vitest";
import {
  createNamespacedId,
  isNamespacedId,
  normalizeId,
  parseNamespacedId,
  validateNamespacedId,
} from "./namespace";

describe("namespace utils", () => {
  describe("createNamespacedId", () => {
    it("should create valid namespaced ID", () => {
      expect(createNamespacedId("core", "plugin")).toBe("core:plugin");
    });
  });

  describe("isNamespacedId", () => {
    it("should validate namespaced IDs", () => {
      expect(isNamespacedId("core:plugin")).toBe(true);
      expect(isNamespacedId("invalid")).toBe(false);
      expect(isNamespacedId("too:many:colons")).toBe(false);
    });
  });

  describe("normalizeId", () => {
    it("should namespaced unqualified IDs", () => {
      expect(normalizeId("core:base", "plugin")).toBe("core:plugin");
    });

    it("should preserve existing namespaced IDs", () => {
      expect(normalizeId("core:base", "other:plugin")).toBe("other:plugin");
    });
  });

  describe("parseNamespacedId", () => {
    it("should split valid IDs", () => {
      expect(parseNamespacedId("core:plugin")).toEqual({
        namespace: "core",
        name: "plugin",
      });
    });
  });

  describe("validateNamespacedId", () => {
    it("should throw on invalid format", () => {
      expect(() => validateNamespacedId("invalid")).toThrow();
      expect(() => validateNamespacedId("core:plugin")).not.toThrow();
    });
  });
});
