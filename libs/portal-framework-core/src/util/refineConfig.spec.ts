import type { RefineProps } from "@refinedev/core";

import { describe, expect, it } from "vitest";

import {
  ensureResource,
  getDefaultRefineOptions,
  mergeRefineConfig,
  normalizeDataProvider,
} from "./refineConfig";

describe("refineConfig utilities", () => {
  describe("normalizeDataProvider", () => {
    it("should handle undefined input", () => {
      expect(normalizeDataProvider()).toEqual({});
    });

    it("should wrap function provider in default key", () => {
      const fn = () => ({});
      expect(normalizeDataProvider(fn)).toEqual({ default: fn });
    });

    it("should wrap string provider in default key", () => {
      expect(normalizeDataProvider("http://api.example.com")).toEqual({
        default: "http://api.example.com",
      });
    });

    it("should return object providers unchanged", () => {
      const obj = { custom: () => {}, default: () => {} };
      expect(normalizeDataProvider(obj)).toEqual(obj);
    });
  });

  describe("ensureResource", () => {
    const testResources = [
      { meta: { label: "Users" }, name: "users" },
      { meta: { label: "Posts" }, name: "posts" },
    ];

    it("should add missing resource with metadata", () => {
      const result = ensureResource(testResources, "comments", {
        label: "Comments",
      });
      expect(result).toEqual([
        ...testResources,
        {
          meta: { dataProviderName: "comments", label: "Comments" },
          name: "comments",
        },
      ]);
    });

    it("should not modify array when resource exists", () => {
      const result = ensureResource(testResources, "users");
      expect(result).toBe(testResources); // Same reference
    });
  });

  describe("getDefaultRefineOptions", () => {
    it("should return default options", () => {
      expect(getDefaultRefineOptions()).toEqual({
        disableTelemetry: true,
        mutationMode: "pessimistic",
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
      });
    });
  });

  describe("mergeRefineConfig", () => {
    const baseConfig: Partial<RefineProps> = {
      options: { disableTelemetry: true },
      resources: [{ name: "users" }],
    };

    it("should merge data providers", () => {
      const result = mergeRefineConfig(baseConfig, { custom: () => {} });
      expect(result.dataProvider).toEqual({
        custom: expect.any(Function),
        default: undefined,
      });
    });

    it("should merge required resources", () => {
      const result = mergeRefineConfig(baseConfig, {}, [
        { name: "posts" },
        { meta: { label: "Comments" }, name: "comments" },
      ]);
      expect(result.resources).toEqual([
        { name: "users" },
        {
          meta: { dataProviderName: "posts" },
          name: "posts",
        },
        {
          meta: { dataProviderName: "comments", label: "Comments" },
          name: "comments",
        },
      ]);
    });

    it("should preserve existing options while applying defaults", () => {
      const result = mergeRefineConfig(baseConfig);
      expect(result.options).toEqual({
        disableTelemetry: true,
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
      });
    });
  });
});
