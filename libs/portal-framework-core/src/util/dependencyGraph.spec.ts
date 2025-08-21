import { describe, expect, it } from "vitest";

import { DependencyGraph } from "./dependencyGraph";

describe("DependencyGraph", () => {
  it("should handle nodes and dependencies", () => {
    const graph = new DependencyGraph<string>();

    graph.addNode("a");
    graph.addNode("b");
    graph.addDependency("a", "b");

    expect(graph.getDependencies("a")).toEqual(new Set(["b"]));
    expect(graph.getDependents("b")).toEqual(new Set(["a"]));
  });

  it("should sort topologically simple chain", () => {
    const graph = new DependencyGraph<string>();
    graph.addDependency("a", "b");
    graph.addDependency("b", "c");

    expect(graph.topologicalSort()).toEqual(["c", "b", "a"]);
  });

  it("should sort topologically complex graph", () => {
    const graph = new DependencyGraph<string>();
    graph.addDependency("a", "b");
    graph.addDependency("a", "c");
    graph.addDependency("b", "d");
    graph.addDependency("c", "d");

    const sorted = graph.topologicalSort();
    expect(sorted).toEqual(["d", "b", "c", "a"]);
  });

  it("should throw on circular dependencies", () => {
    const graph = new DependencyGraph<string>();
    graph.addDependency("a", "b");
    graph.addDependency("b", "c");
    graph.addDependency("c", "a");

    expect(() => graph.topologicalSort()).toThrow("Circular dependency");
  });
});
