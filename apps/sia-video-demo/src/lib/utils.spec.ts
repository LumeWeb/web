import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("joins static class names with a single space", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("filters out falsy values", () => {
    expect(cn("a", false, null, undefined, 0, "", "b")).toBe("a b");
  });

  it("supports conditional object entries", () => {
    expect(cn("btn", { active: true, disabled: false })).toBe("btn active");
  });

  it("supports nested arrays", () => {
    expect(cn(["a", ["b", "c"]], "d")).toBe("a b c d");
  });

  it("returns an empty string for no class names", () => {
    expect(cn()).toBe("");
    expect(cn(false, null, undefined, "", 0)).toBe("");
  });

  it("resolves conflicting Tailwind padding utilities in favor of the last", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("p-4", "px-2")).toBe("p-4 px-2");
  });

  it("resolves conflicting background color utilities in favor of the last", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("keeps distinct utilities that do not conflict", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });
});
