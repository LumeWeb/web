import { describe, expect, it } from "vitest";

import {
  createNamespace,
  createNamespaceFeature,
  createNamespacedId,
  CORE_NS,
  NamespaceFeature,
} from "./namespace";

describe("NamespaceFeature", () => {
  it("should have a framework-scoped namespaced id", () => {
    const feature = createNamespaceFeature() as NamespaceFeature;

    expect(feature.id).toBe("framework:namespace");
  });

  it("should re-export createNamespacedId", () => {
    const id = createNamespacedId(CORE_NS, "test");

    expect(id).toBe("core:test");
  });
});
